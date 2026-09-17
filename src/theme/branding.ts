/**
 * ── BRANDING ANCHOR #2 ──────────────────────────────────────────────
 * Single file to edit when rebranding. Owners can also override name/colors
 * at runtime from Settings (stored in localStorage).
 */

export interface Branding {
  salonName: string;
  primaryColor: string;
  primaryColorDark: string;
  accentColor: string;
  logoUrl: string;
}

export const DEFAULT_BRANDING: Branding = {
  salonName: "Salon Manager",
  primaryColor: "#27187E",
  primaryColorDark: "#1A1058",
  accentColor: "#E8A33D",
  logoUrl: "/src/assets/logo.svg",
};

const STORAGE_KEY = "salon_branding_override";

export function getBranding(): Branding {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt override */
  }
  return DEFAULT_BRANDING;
}

export function setBranding(partial: Partial<Branding>) {
  const merged = { ...getBranding(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  applyBrandingToDocument(merged);
}

export function applyBrandingToDocument(branding: Branding = getBranding()) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", branding.primaryColor);
  root.style.setProperty("--color-primary-dark", branding.primaryColorDark);
  root.style.setProperty("--color-accent", branding.accentColor);
  document.title = branding.salonName;
}
