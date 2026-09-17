import en from "./en.json";
import am from "./am.json";

export type Lang = "en" | "am";
const DICTS: Record<Lang, any> = { en, am };

let currentLang: Lang = (localStorage.getItem("salon_lang") as Lang) || "en";

const listeners = new Set<() => void>();

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem("salon_lang", lang);
  listeners.forEach((l) => l());
}

export function onLangChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

// t("client.add_title") or t("sms.default_message", { name: "Sara" })
export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = DICTS[currentLang] ?? DICTS.en;
  let str = getPath(dict, key) ?? getPath(DICTS.en, key) ?? key;
  if (typeof str !== "string") return key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{{${k}}}`, "g"), String(v));
    });
  }
  return str;
}

export function tArray(key: string): string[] {
  const dict = DICTS[currentLang] ?? DICTS.en;
  const arr = getPath(dict, key);
  return Array.isArray(arr) ? arr : [];
}
