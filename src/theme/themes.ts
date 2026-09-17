/** Built-in visual themes beyond single color pickers */

export type ThemeId = "royal" | "habesha" | "midnight" | "rose" | "forest";

export interface Theme {
  id: ThemeId;
  nameEn: string;
  nameAm: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primaryMuted: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
}

export const THEMES: Theme[] = [
  {
    id: "royal",
    nameEn: "Royal Purple",
    nameAm: "ሮያል ሐምራዊ",
    primary: "#27187E",
    primaryDark: "#1A1058",
    primarySoft: "#9787F3",
    primaryMuted: "#EAEFFE",
    accent: "#E8A33D",
    bg: "#F7F7FF",
    surface: "#FFFFFF",
    text: "#1A1A2E",
  },
  {
    id: "habesha",
    nameEn: "Habesha Gold",
    nameAm: "ሐበሻ ወርቅ",
    primary: "#8B1A1A",
    primaryDark: "#5C1010",
    primarySoft: "#D4A017",
    primaryMuted: "#FDF6E9",
    accent: "#D4A017",
    bg: "#FBF7F0",
    surface: "#FFFFFF",
    text: "#2C1810",
  },
  {
    id: "midnight",
    nameEn: "Midnight",
    nameAm: "ምሽት",
    primary: "#1E3A5F",
    primaryDark: "#0F1F33",
    primarySoft: "#5B8DB8",
    primaryMuted: "#E8F0F7",
    accent: "#F0A500",
    bg: "#F0F4F8",
    surface: "#FFFFFF",
    text: "#1A2332",
  },
  {
    id: "rose",
    nameEn: "Rose Salon",
    nameAm: "ሮዝ ሳሎን",
    primary: "#9B2D5B",
    primaryDark: "#6B1F40",
    primarySoft: "#E891B0",
    primaryMuted: "#FDF0F5",
    accent: "#E8A33D",
    bg: "#FDF8FA",
    surface: "#FFFFFF",
    text: "#2B1520",
  },
  {
    id: "forest",
    nameEn: "Forest",
    nameAm: "ደን",
    primary: "#1B5E3B",
    primaryDark: "#0E3A24",
    primarySoft: "#4CAF7A",
    primaryMuted: "#E8F5EE",
    accent: "#C4A35A",
    bg: "#F4F9F6",
    surface: "#FFFFFF",
    text: "#1A2E22",
  },
];

const STORAGE_KEY = "salon_theme_id";

export function getThemeId(): ThemeId {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  if (saved && THEMES.some((t) => t.id === saved)) return saved;
  return "royal";
}

export function getTheme(id?: ThemeId): Theme {
  const tid = id ?? getThemeId();
  return THEMES.find((t) => t.id === tid) ?? THEMES[0];
}

export function setThemeId(id: ThemeId) {
  localStorage.setItem(STORAGE_KEY, id);
  applyTheme(getTheme(id));
}

export function applyTheme(theme: Theme = getTheme()) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-dark", theme.primaryDark);
  root.style.setProperty("--color-primary-soft", theme.primarySoft);
  root.style.setProperty("--color-primary-muted", theme.primaryMuted);
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-bg", theme.bg);
  root.style.setProperty("--color-surface", theme.surface);
  root.style.setProperty("--color-text", theme.text);
}
