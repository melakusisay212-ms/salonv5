import { t } from "../i18n/i18n";
import { IconToday, IconTomorrow, IconClients, IconSettings, IconPlus } from "./Icons";

export type TabKey = "today" | "tomorrow" | "clients" | "settings";

interface Props {
  active: TabKey;
  onChange: (t: TabKey) => void;
  onAdd?: () => void;
}

const TABS: { key: TabKey; Icon: typeof IconToday; labelKey: string }[] = [
  { key: "today", Icon: IconToday, labelKey: "nav.today" },
  { key: "tomorrow", Icon: IconTomorrow, labelKey: "nav.tomorrow" },
  { key: "clients", Icon: IconClients, labelKey: "nav.clients" },
  { key: "settings", Icon: IconSettings, labelKey: "nav.settings" },
];

export default function BottomNav({ active, onChange, onAdd }: Props) {
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <div className="bottom-nav-wrap">
      <nav className="bottom-nav">
        {left.map(({ key, Icon, labelKey }) => (
          <button
            key={key}
            className={active === key ? "active" : ""}
            onClick={() => onChange(key)}
          >
            <span className="nav-icon"><Icon size={20} /></span>
            <span>{t(labelKey)}</span>
          </button>
        ))}

        {onAdd && (
          <button className="nav-fab" onClick={onAdd} aria-label={t("common.add")}>
            <IconPlus size={24} />
          </button>
        )}

        {right.map(({ key, Icon, labelKey }) => (
          <button
            key={key}
            className={active === key ? "active" : ""}
            onClick={() => onChange(key)}
          >
            <span className="nav-icon"><Icon size={20} /></span>
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
