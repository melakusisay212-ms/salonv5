import { useRef, useState } from "react";
import { t, getLang, setLang, Lang } from "../i18n/i18n";
import { getBranding, setBranding } from "../theme/branding";
import { THEMES, getThemeId, setThemeId, ThemeId } from "../theme/themes";
import { parseClientsCsv, clientsToCsv } from "../utils/csv";
import { bulkImportClients, getAllClients } from "../db/database";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export default function SettingsPage() {
  const [lang, setLangState] = useState<Lang>(getLang());
  const [branding, setBrandingState] = useState(getBranding());
  const [themeId, setThemeIdState] = useState<ThemeId>(getThemeId());
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const changeLang = (l: Lang) => {
    setLang(l);
    setLangState(l);
  };

  const saveBranding = (patch: Partial<typeof branding>) => {
    const merged = { ...branding, ...patch };
    setBrandingState(merged);
    setBranding(merged);
  };

  const pickTheme = (id: ThemeId) => {
    setThemeId(id);
    setThemeIdState(id);
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const { clients, errors } = parseClientsCsv(text);
    if (clients.length === 0) {
      setImportMsg(t("settings.import_error", { error: errors.join("; ") || "no valid rows" }));
      return;
    }
    const count = await bulkImportClients(clients);
    setImportMsg(t("settings.import_success", { count }));
  };

  const handleExport = async () => {
    const clients = await getAllClients();
    const csv = clientsToCsv(clients);
    const fileName = `salon-clients-${Date.now()}.csv`;
    if (Capacitor.getPlatform() === "web") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const result = await Filesystem.writeFile({
      path: fileName,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: fileName, url: result.uri });
  };

  return (
    <div>
      <div className="settings-card">
        <div className="section-title">{t("settings.language")}</div>
        <div className="segmented">
          <button className={lang === "en" ? "active" : ""} onClick={() => changeLang("en")}>
            English
          </button>
          <button className={lang === "am" ? "active" : ""} onClick={() => changeLang("am")}>
            አማርኛ
          </button>
        </div>
      </div>

      <div className="settings-card">
        <div className="section-title">{t("settings.theme")}</div>
        <div className="theme-grid">
          {THEMES.map((th) => (
            <button
              key={th.id}
              className={`theme-swatch ${themeId === th.id ? "active" : ""}`}
              onClick={() => pickTheme(th.id)}
              type="button"
            >
              <div className="swatch-colors">
                <span className="dot" style={{ background: th.primary }} />
                <span className="dot" style={{ background: th.accent }} />
                <span className="dot" style={{ background: th.bg }} />
              </div>
              <div className="theme-name">{lang === "am" ? th.nameAm : th.nameEn}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <div className="section-title">{t("settings.branding")}</div>
        <div className="field">
          <label>{t("settings.salon_name")}</label>
          <input
            value={branding.salonName}
            onChange={(e) => saveBranding({ salonName: e.target.value })}
          />
        </div>
      </div>

      <div className="settings-card">
        <div className="section-title">{t("settings.backup")}</div>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
          {t("settings.backup_hint")}
        </p>
        <button
          className="btn btn-primary btn-block"
          style={{ marginBottom: 10 }}
          onClick={() => fileRef.current?.click()}
        >
          {t("settings.import_csv")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = "";
          }}
        />
        <button className="btn btn-secondary btn-block" onClick={handleExport}>
          {t("settings.export_csv")}
        </button>
        {importMsg && (
          <p style={{ fontSize: 13, marginTop: 12, color: "var(--color-success)", fontWeight: 600 }}>
            {importMsg}
          </p>
        )}
      </div>

      <div className="settings-card">
        <div className="section-title">{t("settings.calendar")}</div>
        <p style={{ fontSize: 14, margin: 0, color: "var(--color-text-secondary)" }}>
          {t("settings.ethiopian_calendar")}
        </p>
      </div>

      <div className="footer-credit">
        Salon Manager V5 · {t("settings.developed_by")}
      </div>
    </div>
  );
}
