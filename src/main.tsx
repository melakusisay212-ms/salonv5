import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initDb } from "./db/database";
import { applyBrandingToDocument, getBranding } from "./theme/branding";
import { applyTheme } from "./theme/themes";
import "./styles/global.css";

applyTheme();
applyBrandingToDocument();

const rootEl = document.getElementById("root")!;
const branding = getBranding();

rootEl.innerHTML = `
  <div class="startup-shell">
    <div class="startup-logo">💇</div>
    <div class="startup-title">${branding.salonName}</div>
    <div class="startup-sub">Loading…</div>
    <div class="startup-spinner"></div>
  </div>
`;

initDb()
  .then(() => {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((err) => {
    rootEl.innerHTML = `
      <div style="padding:32px;font-family:system-ui;color:#E04B4B;text-align:center">
        <h2 style="margin-bottom:8px">Failed to start</h2>
        <p style="font-size:14px;opacity:0.8">${String(err)}</p>
      </div>
    `;
    console.error(err);
  });
