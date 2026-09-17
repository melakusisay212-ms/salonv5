# Pushing this project to GitHub

This project was generated without internet access, so it has not been
pushed anywhere yet. Do this once from your own machine:

## 1. Create the repository on GitHub

Go to https://github.com/new, pick a name (e.g. `salon-manager`), leave it
empty (no README/license — you already have those), and create it.

## 2. Push this folder

From inside `hair-salon-manager/`:

```bash
git init
git add .
git commit -m "Initial commit: Salon Manager Android app"
git branch -M main
git remote add origin https://github.com/<your-username>/salon-manager.git
git push -u origin main
```

That’s it — `.gitignore` is already set up to exclude `node_modules/`,
build output, and the generated `android/` build artifacts, so the repo
stays small and clean.

## 3. Get your APK automatically

The moment you push, GitHub Actions (`.github/workflows/build-apk.yml`)
runs a full build on GitHub's servers and produces a real, sideloadable
`app-debug.apk` — no local installs needed. See **"Option A"** in
`BUILD_APK.md` for where to download it (repo → Actions tab → latest run →
Artifacts).

## Note on the `android/` folder

The native `android/` folder itself (created by `npx cap add android`) is
**not excluded** by `.gitignore` — only its build output is. Whether you
commit the generated `android/` folder is up to you:

- **Commit it** (recommended if you want any collaborator to open Android
  Studio and build immediately, with zero setup commands).
- **Don’t commit it** and instead have collaborators run
  `npx cap add android` themselves after cloning (keeps the repo smaller,
  matches the structure delivered here).

If you choose not to commit it, add this line to `.gitignore`:
```
android/
```

## Suggested repo description / topics

- Description: `Offline-first Android app for hair salon owners — client management, appointment reminders, and SMS, built with Capacitor. By Melaku Sisay.`
- Topics: `capacitor`, `android`, `sqlite`, `offline-first`, `ethiopia`, `amharic`, `react`, `typescript`
