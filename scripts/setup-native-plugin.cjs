#!/usr/bin/env node
/**
 * Wires the local native "SalonSms" plugin (plugins/salon-sms/) into the
 * generated android/ project. Run this AFTER `npx cap add android` and
 * BEFORE `npx cap sync android` (and again any time you delete/regenerate
 * the android/ folder).
 *
 * What it does, safely and idempotently:
 *   1. Copies SalonSmsPlugin.java into android/app/src/main/java/.../salonsms/
 *   2. Adds the SEND_SMS permission to android/app/src/main/AndroidManifest.xml
 *      (skipped if already present).
 *   3. Registers the plugin inside android/app/.../MainActivity.java
 *      (skipped if already registered).
 *
 * Usage:  node scripts/setup-native-plugin.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ANDROID_DIR = path.join(ROOT, "android");

function fail(msg) {
  console.error("\n\u274c " + msg + "\n");
  process.exit(1);
}

if (!fs.existsSync(ANDROID_DIR)) {
  fail(
    "android/ folder not found. Run `npx cap add android` first, then re-run this script."
  );
}

// ---- 1. Copy the plugin's Java source file ----------------------------
const pluginJavaSrc = path.join(
  ROOT,
  "plugins/salon-sms/android/src/main/java/com/melakusisay/salonsms/SalonSmsPlugin.java"
);
const pluginJavaDestDir = path.join(
  ANDROID_DIR,
  "app/src/main/java/com/melakusisay/salonsms"
);
const pluginJavaDest = path.join(pluginJavaDestDir, "SalonSmsPlugin.java");

fs.mkdirSync(pluginJavaDestDir, { recursive: true });
fs.copyFileSync(pluginJavaSrc, pluginJavaDest);
console.log("\u2713 Copied SalonSmsPlugin.java -> " + path.relative(ROOT, pluginJavaDest));

// ---- 2. Add SEND_SMS permission to AndroidManifest.xml -----------------
const manifestPath = path.join(ANDROID_DIR, "app/src/main/AndroidManifest.xml");
if (!fs.existsSync(manifestPath)) {
  fail("Could not find " + manifestPath);
}
let manifest = fs.readFileSync(manifestPath, "utf8");
if (manifest.includes("android.permission.SEND_SMS")) {
  console.log("\u2713 SEND_SMS permission already present in AndroidManifest.xml");
} else {
  manifest = manifest.replace(
    "<manifest",
    '<manifest'
  );
  manifest = manifest.replace(
    /<application/,
    '<uses-permission android:name="android.permission.SEND_SMS" />\n\n    <application'
  );
  fs.writeFileSync(manifestPath, manifest, "utf8");
  console.log("\u2713 Added SEND_SMS permission to AndroidManifest.xml");
}

// ---- 3. Register the plugin in MainActivity.java ------------------------
// Find MainActivity.java wherever Capacitor generated it (path depends on appId).
function findMainActivity(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findMainActivity(full);
      if (found) return found;
    } else if (entry.name === "MainActivity.java") {
      return full;
    }
  }
  return null;
}

const mainActivityPath = findMainActivity(path.join(ANDROID_DIR, "app/src/main/java"));
if (!mainActivityPath) {
  fail("Could not find MainActivity.java under android/app/src/main/java/");
}

let mainActivity = fs.readFileSync(mainActivityPath, "utf8");
if (mainActivity.includes("SalonSmsPlugin")) {
  console.log("\u2713 SalonSmsPlugin already registered in MainActivity.java");
} else {
  // Add the import after the last existing import (or after the package line).
  if (mainActivity.includes("import com.getcapacitor.BridgeActivity;")) {
    mainActivity = mainActivity.replace(
      "import com.getcapacitor.BridgeActivity;",
      "import com.getcapacitor.BridgeActivity;\nimport com.melakusisay.salonsms.SalonSmsPlugin;"
    );
  } else {
    mainActivity = mainActivity.replace(
      /(package [^;]+;\n)/,
      "$1\nimport com.melakusisay.salonsms.SalonSmsPlugin;\n"
    );
  }

  // Ensure there's an onCreate() that registers the plugin BEFORE super.onCreate().
  if (/public class MainActivity extends BridgeActivity\s*\{\s*\}/.test(mainActivity)) {
    // Empty class body, e.g. "public class MainActivity extends BridgeActivity {}"
    mainActivity = mainActivity.replace(
      /public class MainActivity extends BridgeActivity\s*\{\s*\}/,
      `public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    registerPlugin(SalonSmsPlugin.class);
    super.onCreate(savedInstanceState);
  }
}`
    );
  } else if (mainActivity.includes("public class MainActivity extends BridgeActivity {")) {
    // Non-empty class body: insert onCreate as the first member.
    mainActivity = mainActivity.replace(
      "public class MainActivity extends BridgeActivity {",
      `public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    registerPlugin(SalonSmsPlugin.class);
    super.onCreate(savedInstanceState);
  }
`
    );
  } else {
    fail(
      "MainActivity.java has an unexpected shape. Register SalonSmsPlugin manually \u2014 see plugins/salon-sms/templates/MainActivity.java for reference."
    );
  }

  fs.writeFileSync(mainActivityPath, mainActivity, "utf8");
  console.log("\u2713 Registered SalonSmsPlugin in " + path.relative(ROOT, mainActivityPath));
}

console.log("\nDone. Now run:  npx cap sync android\n");
