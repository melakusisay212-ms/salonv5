import { useState } from "react";
import { getLang, setLang } from "../i18n/i18n";
import { getBranding } from "../theme/branding";

export default function Header({ title }: { title: string }) {
  const [lang, setLangState] = useState(getLang());
  const branding = getBranding();

  const change = (l: "en" | "am") => {
    setLang(l);
    setLangState(l);
  };

  return (
    <div className="app-header">
      <div>
        <h1>{branding.salonName}</h1>
        <div className="subtitle">{title}</div>
      </div>
      <div className="lang-switch">
        <button className={lang === "en" ? "active" : ""} onClick={() => change("en")}>EN</button>
        <button className={lang === "am" ? "active" : ""} onClick={() => change("am")}>አማ</button>
      </div>
    </div>
  );
}
