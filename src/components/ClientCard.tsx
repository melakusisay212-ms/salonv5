import type { Client } from "../db/database";
import { t } from "../i18n/i18n";
import { formatEthiopian } from "../utils/ethiopianCalendar";
import { FREQUENCY_LABEL_KEY } from "../utils/dateCalc";
import { IconCheck, IconPhone, IconSms, IconEdit, IconTrash } from "./Icons";

interface Props {
  client: Client;
  showSmsStatus?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkDone: () => void;
  onSendSms?: () => void;
}

export default function ClientCard({ client, showSmsStatus, onEdit, onDelete, onMarkDone, onSendSms }: Props) {
  return (
    <div className="card client-card">
      {/* Top row: name + badges */}
      <div className="client-card-top">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="client-name">{client.fullName}</div>
          <div className="client-phone">
            <IconPhone size={13} /> {client.phone}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end", flexShrink: 0 }}>
          <span className={`badge ${client.status === "new" ? "badge-new" : "badge-returning"}`}>
            {client.status === "new" ? t("client.status_new") : t("client.status_returning")}
          </span>
          {client.cyclesCompleted > 0 && (
            <span className="badge badge-loyal">{t("client.loyal_badge", { count: client.cyclesCompleted })}</span>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div className="client-meta">
        <span className="badge badge-freq">{t(FREQUENCY_LABEL_KEY[client.frequency])}</span>
        {showSmsStatus && (
          <span className={`badge ${client.smsSentForNextDate ? "badge-sent" : "badge-not-sent"}`}>
            {client.smsSentForNextDate ? t("sms.sent") : t("sms.not_sent")}
          </span>
        )}
      </div>

      {/* Next date highlight */}
      {client.nextExpectedDate && (
        <div className="client-next">
          <span className="label">{t("client.next_expected")}</span>
          <span className="date">{formatEthiopian(client.nextExpectedDate)}</span>
        </div>
      )}

      {/* Actions always visible in a compact row */}
      <div className="client-actions-bar">
        <button className="btn btn-success btn-compact" onClick={onMarkDone}>
          <IconCheck size={16} /> {t("client.mark_done")}
        </button>
        {onSendSms && (
          <button className="btn btn-primary btn-compact" onClick={onSendSms}>
            <IconSms size={16} /> {t("sms.send")}
          </button>
        )}
        <button className="icon-btn" onClick={onEdit} aria-label={t("common.edit")}>
          <IconEdit size={15} />
        </button>
        <button className="icon-btn icon-btn-danger" onClick={onDelete} aria-label={t("common.delete")}>
          <IconTrash size={15} />
        </button>
      </div>
    </div>
  );
}
