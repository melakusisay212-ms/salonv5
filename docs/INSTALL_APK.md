# Installing the APK on the owner’s phone (sideloading)

No Play Store account, no internet on the phone required once the file is
transferred.

## 1. Get the APK onto the phone

Pick any one:
- **USB cable**: plug the phone into your computer, copy `app-debug.apk`
  into the phone’s `Download` folder, then unplug.
- **Send it via Telegram/WhatsApp/Email to yourself** and download it on the
  phone.
- **Google Drive / any cloud link**: upload the APK, open the link on the phone.

## 2. Allow installing from this source (first time only)

Modern Android (8+) asks per-app, not globally:

1. Open the Files app (or wherever you saved the APK) and tap `app-debug.apk`.
2. Android will show **"For your security, your phone is not allowed to
   install unknown apps from this source."**
3. Tap **Settings** on that prompt → turn on **"Allow from this source"**
   for the app you used (e.g. Files, Chrome, Telegram).
4. Go back and tap the APK file again.

(On very old Android versions, instead go to
`Settings → Security → Unknown sources` and enable it once, globally.)

## 3. Install

Tap **Install** → wait a few seconds → **Open**.

## 4. First-time setup on the phone

1. Open the app — it starts empty.
2. Go to **Settings tab** and:
   - Set the language (English / አማርኛ) if needed.
   - Optionally set the salon name and color.
   - Tap **Import Clients from CSV** and pick your KoboCollect/KoboToolbox
     export (or the included `sample-data/sample_kobo_clients.csv` to try it).
3. Go to the **Clients tab** to confirm everything imported correctly.
4. The **Today** / **Tomorrow** tabs will now automatically show whoever is
   due, calculated from each client’s Last Service Date + Frequency.

## 5. Sending your first SMS reminder

- On Today/Tomorrow, tap **Send Reminder** on a client card.
- The app will try to send it silently. The very first time, Android will
  ask for SMS permission — tap **Allow**.
- If you tap **Deny** (or deny it permanently), the app will instead open
  your phone’s normal Messages app with the number and text already typed
  in — you just tap send there.
- You can edit the message text before sending, every time.

## Updating to a newer version later

Just repeat steps 1–3 with the new APK file — Android will update the app
in place and **keep all existing client data** (the database lives outside
the APK, in the app’s private storage).

> ⚠️ If you ever change the app’s package id (`appId` in
> `capacitor.config.ts`) between versions, Android treats it as a different
> app and won’t update in place — avoid changing it unless you mean to.
