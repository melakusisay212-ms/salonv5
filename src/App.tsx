import { useEffect, useState, useCallback, useRef } from "react";
import Header from "./components/Header";
import BottomNav, { TabKey } from "./components/BottomNav";
import DueListPage from "./pages/DueListPage";
import ClientsPage from "./pages/ClientsPage";
import SettingsPage from "./pages/SettingsPage";
import { onLangChange, t } from "./i18n/i18n";
import { todayIso, tomorrowIso } from "./utils/ethiopianCalendar";

const TAB_ORDER: TabKey[] = ["today", "tomorrow", "clients", "settings"];

export default function App() {
  const [tab, setTab] = useState<TabKey>("today");
  const [, forceRerender] = useState(0);
  const [openAdd, setOpenAdd] = useState(false);
  const [slideDir, setSlideDir] = useState<"right" | "left">("right");
  const prevTab = useRef<TabKey>("today");

  useEffect(() => onLangChange(() => forceRerender((n) => n + 1)), []);

  const titleForTab: Record<TabKey, string> = {
    today: t("nav.today"),
    tomorrow: t("nav.tomorrow"),
    clients: t("nav.clients"),
    settings: t("nav.settings"),
  };

  const changeTab = useCallback((next: TabKey) => {
    const prevIdx = TAB_ORDER.indexOf(prevTab.current);
    const nextIdx = TAB_ORDER.indexOf(next);
    setSlideDir(nextIdx >= prevIdx ? "right" : "left");
    prevTab.current = next;
    setTab(next);
  }, []);

  const handleAdd = useCallback(() => {
    changeTab("clients");
    setOpenAdd(true);
  }, [changeTab]);

  const consumeAdd = useCallback(() => setOpenAdd(false), []);

  return (
    <div className="app-shell">
      <Header title={titleForTab[tab]} />
      <div className="app-content">
        <div key={tab} className={slideDir === "right" ? "page-slide" : "page-slide-left"}>
          {tab === "today" && (
            <DueListPage
              dateIso={todayIso()}
              titleKey="today_tab.title"
              emptyKey="today_tab.empty"
              isToday
            />
          )}
          {tab === "tomorrow" && (
            <DueListPage
              dateIso={tomorrowIso()}
              titleKey="tomorrow_tab.title"
              emptyKey="tomorrow_tab.empty"
            />
          )}
          {tab === "clients" && (
            <ClientsPage openAdd={openAdd} onAddConsumed={consumeAdd} />
          )}
          {tab === "settings" && <SettingsPage />}
        </div>
      </div>
      <BottomNav active={tab} onChange={changeTab} onAdd={handleAdd} />
    </div>
  );
}
