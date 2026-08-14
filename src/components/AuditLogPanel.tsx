import React, { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { getAuditLog, AuditLogEntry } from "../lib/api";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Login",
  REPORT_STATUS_UPDATED: "Update Status Laporan",
  REPORT_DISPOSITIONED: "Disposisi Laporan",
  REPORT_MODERATED: "Moderasi Publikasi",
  REPORT_CATEGORY_CHANGED: "Ubah Kategori Laporan",
  HOTLINE_UPDATED: "Ubah Hotline WA",
  ADMIN_USER_INVITED: "Undang Akun Admin",
  ADMIN_USER_ROLE_CHANGED: "Ubah Role Akun Admin",
  ADMIN_USER_REMOVED: "Hapus Akun Admin",
  ADMIN_SESSION_REVOKED: "Revoke Sesi Admin",
};

interface AuditLogPanelProps {
  onClose: () => void;
}

export default function AuditLogPanel({ onClose }: AuditLogPanelProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actorFilter, setActorFilter] = useState("");

  const load = async (actorEmail?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAuditLog(actorEmail ? { actorEmail } : undefined);
      setEntries(data);
    } catch (err) {
      setError("Gagal memuat audit log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(actorFilter.trim() || undefined);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 animate-fade-in" id="audit-log-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Audit Log</h4>
            <p className="text-xs text-slate-500">Riwayat login &amp; aksi sensitif admin (status, disposisi, moderasi, kategori, akun, hotline).</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 cursor-pointer">✕</button>
      </div>

      {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

      <form onSubmit={handleFilterSubmit} className="flex gap-2">
        <input
          type="email"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          placeholder="Filter by email admin (opsional)"
          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <p className="text-xs text-slate-400 text-center py-4">Memuat...</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas tercatat.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-xl">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </span>
                <span className="text-[10px] text-slate-400">{new Date(entry.createdAt).toLocaleString("id-ID")}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">{entry.actorEmail}</p>
              {entry.details && <p className="text-[11px] text-slate-500">{entry.details}</p>}
              {entry.targetId && (
                <p className="text-[10px] text-slate-400">Target: {entry.targetType ?? "-"} · {entry.targetId}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
