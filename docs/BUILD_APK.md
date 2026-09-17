# Building the real Android APK

There are two ways to get the APK. **Option A needs nothing installed** and
is the easiest way to get a working file today. Option B is for building
on your own computer (e.g. to test on an emulator, or to make a signed
release build).

## Option A: Let GitHub build it for you (no installs needed)

This repo includes `.github/workflows/build-apk.yml`, which automatically
runs every step in Option B on GitHub's servers, every time you push to
`main` (or you can trigger it manually).

1. Push this project to GitHub (see `GITHUB_SETUP.md`).
2. Go to your repo on GitHub → the **Actions** tab.
3. Open the latest **"Build Android APK"** run (it starts automatically on
   push, and takes 3-5 minutes).
4. Once it finishes, scroll to **Artifacts** at the bottom of the run page
   and download **`salon-manager-debug-apk`** — it's a zip containing
   `app-debug.apk`.
5. Unzip it and follow `INSTALL_APK.md` to sideload it.

No Android Studio, no Node.js, nothing to install on your own machine.
Re-run it (Actions tab → "Run workflow") any time you push new code and
want a fresh APK.

## Option B: Build it yourself locally

You need a computer (Windows/Mac/Linux) with internet access — the sandbox
this project was generated in has no internet, so these steps must be run on
**your** machine, once.

## 1. Install prerequisites (one-time)

1. **Node.js 18+** — https://nodejs.org (LTS version)
2. **Android Studio** — https://developer.android.com/studio
   - On first launch, let it install the Android SDK (API 34) and an emulator
     if you want one. You do **not** need the emulator to build the APK.
3. Confirm both are installed:
   ```bash
   node -v
   npm -v
   ```

## 2. Install project dependencies

From the project root (`hair-salon-manager/`):

```bash
npm install
```

This also pulls in the local `salon-sms` plugin folder automatically
(it is referenced as `"salon-sms": "file:./plugins/salon-sms"` in
`package.json`).

## 3. Build the web app and generate the native Android project

```bash
npm run build
npx cap add android
node scripts/setup-native-plugin.cjs
npx cap sync android
```

- `npm run build` compiles the React app into `dist/`.
- `npx cap add android` creates the native `android/` project (only needed
  the first time — skip it if `android/` already exists).
- `node scripts/setup-native-plugin.cjs` copies the local `SalonSms` native
  plugin (`plugins/salon-sms/`) into the generated project: it adds
  `SalonSmsPlugin.java`, the `SEND_SMS` permission, and registers the
  plugin in `MainActivity.java`. **Run this once after every `npx cap add
  android`** (i.e. after deleting/regenerating the `android/` folder) —
  it's safe to re-run any time, it won't duplicate anything already in place.
- `npx cap sync android` copies the web build into the Android project and
  wires up the Capacitor plugins (SQLite, Filesystem, Share) — run this
  again any time you change JS/TS code.

## 4. Open in Android Studio and build the APK

```bash
npx cap open android
```

This opens the generated `android/` folder in Android Studio.

- **Fastest way to get a sideload-able APK (debug build):**
  In Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`.
  When it finishes, click the "locate" link in the notification, or find it at:
  `android/app/build/outputs/apk/debug/app-debug.apk`

- **Or from the command line, no Android Studio UI needed:**
  ```bash
  cd android
  ./gradlew assembleDebug
  ```
  (Windows: `gradlew.bat assembleDebug`)
  Output: `android/app/build/outputs/apk/debug/app-debug.apk`

That `app-debug.apk` file is what you copy to the owner’s phone
(see `INSTALL_APK.md`).

## 5. (Optional) Build a signed release APK

Debug APKs install and work fine for personal sideloading. If you eventually
want a signed release build (smaller size, no debug banner):

```bash
cd android
keytool -genkey -v -keystore salon-release.keystore -alias salon -keyalg RSA -keysize 2048 -validity 10000
```

Then in `android/app/build.gradle`, add a `signingConfigs` block referencing
that keystore, set `buildTypes.release.signingConfig`, and run:

```bash
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

Keep the `.keystore` file and its password safe — you need the **same** one
to release future updates of the app.

## 5. Notes specific to this app

- **SMS permission**: the `SEND_SMS` permission is already declared by the
  `salon-sms` plugin’s own `AndroidManifest.xml` and is merged in
  automatically by Capacitor — no manual manifest editing needed.
- **App icon / name**: see `docs/REBRANDING.md`.
- Every time you change anything under `src/`, re-run:
  ```bash
  npm run build && npx cap sync android
  ```
  before rebuilding the APK in Android Studio.
