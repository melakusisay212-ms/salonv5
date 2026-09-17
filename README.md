# Salon Manager V5

Offline-first client & appointment manager for hair salon owners — **owner-only**,
no client-facing app, no Google Play Store required. Built with **Capacitor + React +
SQLite**, bilingual **English / Amharic**, and **Ethiopian calendar everywhere**
(including the last-visit date picker).

**Developed by Melaku Sisay.**

---

## V5 highlights

- Modern 2027 UI: floating pill nav + FAB, soft ghost surfaces, refined purple palette
- **Ethiopian date picker** for last service date (day / month / year in ET calendar)
- All dates displayed in Ethiopian calendar
- Today tab as a real dashboard (greeting, expected count, SMS pending)
- Cleaner client cards with primary “Mark as done” action
- Clients page with live totals and filter counts
- Non-blocking startup shell while SQLite initializes
- Same solid architecture: SQLite, custom SMS plugin, CSV import/export, branding

---

## Quick start

```bash
npm install
npm run dev          # browser preview (web SQLite fallback)
```

Push to GitHub — `.github/workflows/build-apk.yml` builds a debug APK automatically.
Or follow **`docs/BUILD_APK.md`** for a local build.

---

## Architecture

See `docs/` for build, install, rebrand, and GitHub setup guides.
