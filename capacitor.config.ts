import type { CapacitorConfig } from '@capacitor/cli';

// ── BRANDING ANCHOR #1 ──────────────────────────────────────────────
// Change appId / appName here when rebranding this app for a new salon.
// This is the ONLY place the Android package id is defined.
const config: CapacitorConfig = {
  appId: 'com.melakusisay.salonmanager',
  appName: 'Salon Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false
      }
    }
  }
};

export default config;
