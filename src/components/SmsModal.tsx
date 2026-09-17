import { useState } from "react";
import type { Client } from "../db/database";
import { t } from "../i18n/i18n";
import { SalonSms } from "../plugins/salonSms";

interface Props {
  client: Client;
  onClose: () => void;
  onSent: () => void;
}

export default function SmsModal({ client, onClose, onSent }: Props) {
  const [message, setMessage] = useState(t("sms.default_message", { name: client.fullName }));
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setStatusMsg(null);
    try {
      const result = await SalonSms.sendReminder({ phone: client.phone, message });
      if (result.method === "sent") {
        setStatusMsg(t("sms.sent_silently"));
      } else {
        setStatusMsg(t("sms.opened_sms_app"));
      }
      onSent();
    } catch {
      setStatusMsg(t("sms.send_failed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">{t("sms.preview_title")}</div>
        <div className="field">
          <label>
            {client.fullName} · {client.phone}
          </label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
        </div>
        {statusMsg && (
          <div style={{ fontSize: 13, color: "var(--color-success)", marginBottom: 12, fontWeight: 600 }}>
            {statusMsg}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>{t("common.close")}</button>
          <button className="btn btn-primary" disabled={sending} onClick={send}>
            {sending ? t("common.loading") : t("sms.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
