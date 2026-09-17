package com.melakusisay.salonsms;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.telephony.SmsManager;
import androidx.activity.result.ActivityResult;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Native Android side of the silent SMS reminder feature.
 *
 * Behavior (matches the product spec exactly):
 *  1. sendReminder() first checks SEND_SMS permission.
 *  2. If granted -> sends silently via SmsManager, resolves {method:"sent"}.
 *  3. If NOT granted -> immediately falls back to opening the native SMS
 *     app (ACTION_SENDTO) with the number and message pre-filled, and
 *     resolves {method:"fallback"}. It does NOT block on a permission
 *     prompt during send unless the owner has explicitly requested
 *     permission ahead of time via requestPermission().
 *  4. Any runtime exception during silent send also falls back to (3),
 *     so the owner is never left without a way to send the reminder.
 */
@CapacitorPlugin(
    name = "SalonSms",
    permissions = {
        @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms")
    }
)
public class SalonSmsPlugin extends Plugin {

    @PluginMethod
    public void checkPermission(PluginCall call) {
        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SEND_SMS)
                == PackageManager.PERMISSION_GRANTED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (getPermissionState("sms") == com.getcapacitor.PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        requestPermissionForAlias("sms", call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        boolean granted = getPermissionState("sms") == com.getcapacitor.PermissionState.GRANTED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void sendReminder(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message");

        if (phone == null || phone.trim().isEmpty() || message == null || message.trim().isEmpty()) {
            call.reject("phone and message are required");
            return;
        }

        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SEND_SMS)
                == PackageManager.PERMISSION_GRANTED;

        if (granted) {
            try {
                sendSilently(phone, message);
                JSObject ret = new JSObject();
                ret.put("method", "sent");
                call.resolve(ret);
                return;
            } catch (Exception e) {
                // Silent send failed for any reason (e.g. radio unavailable) -> fallback.
                openSmsApp(phone, message);
                JSObject ret = new JSObject();
                ret.put("method", "fallback");
                call.resolve(ret);
                return;
            }
        }

        // Not granted: fall back to opening the SMS app, per Option C in the spec.
        openSmsApp(phone, message);
        JSObject ret = new JSObject();
        ret.put("method", "fallback");
        call.resolve(ret);
    }

    private void sendSilently(String phone, String message) {
        SmsManager smsManager = SmsManager.getDefault();
        // Split long messages across multiple SMS parts automatically.
        java.util.ArrayList<String> parts = smsManager.divideMessage(message);
        if (parts.size() > 1) {
            smsManager.sendMultipartTextMessage(phone, null, parts, null, null);
        } else {
            smsManager.sendTextMessage(phone, null, message, null, null);
        }
    }

    private void openSmsApp(String phone, String message) {
        Uri uri = Uri.parse("smsto:" + phone);
        Intent intent = new Intent(Intent.ACTION_SENDTO, uri);
        intent.putExtra("sms_body", message);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }
}
