# Rebranding for a different salon

The whole app was structured so a rebrand touches **one code file** plus
some assets — no business logic, database, or SMS code needs to change.

## 1. Name and colors (runtime-editable, no rebuild needed)

The owner can already do this from the phone:
**Settings tab → Salon Branding** → change Salon Name and Primary Color.
This is saved on-device and overrides the defaults instantly.

## 2. Name and colors (compiled-in defaults)

Edit `src/theme/branding.ts`:

```ts
export const DEFAULT_BRANDING: Branding = {
  salonName: "Your Salon Name",
  primaryColor: "#7A3B69",     // main brand color
  primaryColorDark: "#4E2143", // header gradient / dark accents
  accentColor: "#E8A33D",      // FAB / highlight color
  logoUrl: "/src/assets/logo.svg",
};
```

Then rebuild (`npm run build && npx cap sync android`).

## 3. Logo

Replace `src/assets/logo.svg` with the new salon's logo (any size, will be
scaled). It's referenced from `branding.ts` — wire it into the header if
you want an image instead of text (the header currently shows the salon
name as text by default, to stay simple and always legible).

## 4. App icon (what shows on the phone's home screen)

After `npx cap add android` has generated the native project, replace the
icon files under:

```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png
android/app/src/main/res/mipmap-hdpi/ic_launcher.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

Easiest approach: use Android Studio's built-in **Image Asset Studio**
(right-click `res/` → New → Image Asset) and point it at the new logo —
it generates all the required sizes for you.

## 5. App id / package name (only if publishing as a separate, independent app)

In `capacitor.config.ts`:

```ts
appId: "com.yoursalonname.salonmanager",
appName: "Your Salon Name",
```

Changing `appId` makes Android treat it as a brand-new app (won't upgrade
in place over an old install with a different id) — only do this when you
are deliberately creating a separate app for a different salon, not for a
simple visual rebrand of the same salon's app.

## 6. Translations

`src/i18n/en.json` and `src/i18n/am.json` hold every piece of UI text. Salon
name is intentionally NOT hardcoded there — it always comes from
`branding.ts` / the Settings screen, so translating the rest of the UI is a
one-time job shared across all rebranded copies of the app.

## Summary checklist for a new salon

- [ ] `src/theme/branding.ts` — name + colors
- [ ] `src/assets/logo.svg` — new logo file
- [ ] Android launcher icons (via Image Asset Studio)
- [ ] `capacitor.config.ts` `appId`/`appName` (only if it's a separate app)
- [ ] Rebuild: `npm run build && npx cap sync android` → new APK
