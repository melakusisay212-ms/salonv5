import { useState } from "react";
import type { Client } from "../db/database";
import { t } from "../i18n/i18n";
import { FREQUENCY_LABEL_KEY, FREQUENCY_OPTIONS, Frequency } from "../utils/dateCalc";
import EthiopianDatePicker from "./EthiopianDatePicker";

export interface ClientFormValue {
  fullName: string;
  phone: string;
  status: "new" | "returning";
  frequency: Frequency;
  lastServiceDate: string;
  notes: string;
}

interface Props {
  initial?: Client;
  onCancel: () => void;
  onSave: (value: ClientFormValue) => void;
}

export default function ClientFormModal({ initial, onCancel, onSave }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<"new" | "returning">(initial?.status ?? "new");
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "1m");
  const [lastServiceDate, setLastServiceDate] = useState(initial?.lastServiceDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const canSave = fullName.trim().length > 0 && phone.trim().length > 0;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">
          {initial ? t("client.edit_title") : t("client.add_title")}
        </div>

        <div className="form-section">
          <div className="form-section-title">{t("client.section_personal")}</div>
          <div className="field">
            <label>{t("client.full_name")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("client.full_name")}
              autoFocus
            />
          </div>
          <div className="field">
            <label>{t("client.phone")}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XXXXXXXX"
              inputMode="tel"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">{t("client.section_schedule")}</div>
          <div className="field">
            <label>{t("client.status")}</label>
            <div className="segmented">
              <button
                className={status === "new" ? "active" : ""}
                onClick={() => setStatus("new")}
                type="button"
              >
                {t("client.status_new")}
              </button>
              <button
                className={status === "returning" ? "active" : ""}
                onClick={() => setStatus("returning")}
                type="button"
              >
                {t("client.status_returning")}
              </button>
            </div>
          </div>

          <div className="field">
            <label>{t("client.frequency")}</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>{t(FREQUENCY_LABEL_KEY[f])}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>{t("client.last_service")}</label>
            <EthiopianDatePicker value={lastServiceDate} onChange={setLastServiceDate} />
          </div>
        </div>

        <div className="form-section">
          <div className="field">
            <label>{t("client.notes")}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{t("common.cancel")}</button>
          <button
            className="btn btn-primary btn-lg"
            disabled={!canSave}
            onClick={() =>
              onSave({
                fullName: fullName.trim(),
                phone: phone.trim(),
                status,
                frequency,
                lastServiceDate,
                notes,
              })
            }
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
