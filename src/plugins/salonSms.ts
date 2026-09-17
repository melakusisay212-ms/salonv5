import { registerPlugin } from "@capacitor/core";

/**
 * TypeScript bridge for the native "SalonSms" Capacitor plugin.
 *
 * The native Android implementation lives at:
 *   plugins/salon-sms/android/src/main/java/com/melakusisay/salonsms/SalonSmsPlugin.java
 *
 * It is registered directly inside the generated android/ project (see
 * docs/BUILD_APK.md, step "Add the native SMS plugin") rather than shipped
 * as a separate npm package — this keeps the build simple and avoids an
 * extra compile step for a single native file.
 */

export interface SendResult {
  /** "sent" = silent SmsManager send succeeded.
   *  "fallback" = permission missing or send failed; native SMS app was opened instead. */
  method: "sent" | "fallback";
}

export interface SalonSmsPlugin {
  /**
   * Attempts a silent SMS send using Android SmsManager (Option B).
   * If SEND_SMS permission is not granted, or the send throws, this
   * automatically falls back to opening the default SMS app pre-filled
   * with the number and message (Option C) and resolves with
   * method: "fallback". Never rejects for a permission issue.
   */
  sendReminder(options: { phone: string; message: string }): Promise<SendResult>;

  /** Check current SEND_SMS permission state without prompting. */
  checkPermission(): Promise<{ granted: boolean }>;

  /** Explicitly request SEND_SMS permission (shows the Android system dialog once). */
  requestPermission(): Promise<{ granted: boolean }>;
}

export const SalonSms = registerPlugin<SalonSmsPlugin>("SalonSms");
