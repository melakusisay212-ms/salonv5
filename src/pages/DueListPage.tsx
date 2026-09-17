import { useEffect, useState, useCallback } from "react";
import type { Client } from "../db/database";
import { getClientsByNextDate, deleteClient, markClientDone, markSmsSent, updateClient } from "../db/database";
import { t } from "../i18n/i18n";
import ClientCard from "../components/ClientCard";
import SmsModal from "../components/SmsModal";
import ConfirmModal from "../components/ConfirmModal";
import ClientFormModal, { ClientFormValue } from "../components/ClientFormModal";
import { formatEthiopian } from "../utils/ethiopianCalendar";

/** Shared implementation for the Today and Tomorrow tabs — dashboard style for Today. */
export default function DueListPage({
  dateIso,
  titleKey,
  emptyKey,
  isToday,
}: {
  dateIso: string;
  titleKey: string;
  emptyKey: string;
  isToday?: boolean;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [smsTarget, setSmsTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [doneTarget, setDoneTarget] = useState<Client | null>(null);
  const [editTarget, setEditTarget] = useState<Client | null>(null);

  const load = useCallback(async () => {
    setClients(await getClientsByNextDate(dateIso));
  }, [dateIso]);

  useEffect(() => {
    load();
  }, [load]);

  const smsPending = clients.filter((c) => !c.smsSentForNextDate).length;

  return (
    <div>
      {isToday && (
        <>
          <div className="dash-greeting">
            <div className="hello">{t("today_tab.greeting")}</div>
            <h2>{formatEthiopian(dateIso)}</h2>
          </div>
          <div className="dash-stats">
            <div className="stat-card">
              <div className="stat-value">{clients.length}</div>
              <div className="stat-label">{t("today_tab.expected")}</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-value">{smsPending}</div>
              <div className="stat-label">{t("today_tab.sms_pending")}</div>
            </div>
          </div>
        </>
      )}

      {!isToday && <div className="section-title">{t(titleKey)}</div>}

      {isToday && clients.length > 0 && (
        <div className="section-title">{t("today_tab.list_title")}</div>
      )}

      {clients.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          {t(emptyKey)}
        </div>
      )}

      {clients.map((c) => (
        <ClientCard
          key={c.id}
          client={c}
          showSmsStatus
          onEdit={() => setEditTarget(c)}
          onDelete={() => setDeleteTarget(c)}
          onMarkDone={() => setDoneTarget(c)}
          onSendSms={() => setSmsTarget(c)}
        />
      ))}

      {smsTarget && (
        <SmsModal
          client={smsTarget}
          onClose={() => setSmsTarget(null)}
          onSent={async () => {
            await markSmsSent(smsTarget.id);
            setSmsTarget(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={t("client.delete_confirm")}
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteClient(deleteTarget.id);
            setDeleteTarget(null);
            load();
          }}
        />
      )}

      {doneTarget && (
        <ConfirmModal
          message={t("client.mark_done_confirm", { name: doneTarget.fullName })}
          onCancel={() => setDoneTarget(null)}
          onConfirm={async () => {
            await markClientDone(doneTarget.id);
            setDoneTarget(null);
            load();
          }}
        />
      )}

      {editTarget && (
        <ClientFormModal
          initial={editTarget}
          onCancel={() => setEditTarget(null)}
          onSave={async (value: ClientFormValue) => {
            await updateClient({ ...editTarget, ...value });
            setEditTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}
