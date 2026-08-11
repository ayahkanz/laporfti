import React from "react";
import { MessageSquare, CheckCircle2, Clock, AlertCircle, Award, ShieldCheck } from "lucide-react";
import { Report, ReportStatus, AdminRole } from "../types";

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  MODERATOR: "Moderator",
  PIMPINAN: "Pimpinan",
  STAFF: "Staff",
};

interface PortalHeaderProps {
  reports: Report[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  adminName?: string;
  adminEmail?: string;
  adminRole?: AdminRole;
  onLogout: () => void;
}

export default function PortalHeader({
  reports,
  activeTab,
  setActiveTab,
  isAdmin,
  adminName,
  adminEmail,
  adminRole,
  onLogout,
}: PortalHeaderProps) {
  // Calculate statistics
  const totalReports = reports.length;
  const processedReports = reports.filter((r) => r.status === ReportStatus.DIPROSES).length;
  const resolvedReports = reports.filter((r) => r.status === ReportStatus.SELESAI).length;
  const pendingReports = reports.filter((r) => r.status === ReportStatus.MENUNGGU).length;

  const navigationItems = [
    { id: "home", label: "Beranda" },
    { id: "create", label: "Buat Laporan" },
    { id: "track", label: "Lacak Laporan" },
    { id: "feed", label: "Laporan Publik" },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-slate-800" id="portal-header">
      {/* Status Bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-2.5 flex items-center justify-center sm:justify-start text-xs text-slate-300 border-b border-indigo-950/60 gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-medium text-slate-300">
          {isAdmin ? "Mode Aktif: Dashboard Tindak Lanjut Staf / Dekanat FTI" : "Mode Aktif: Dashboard Pelapor & Mahasiswa"}
        </span>
      </div>

      {/* Main Brand Section */}
      <div className="px-6 py-8 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="bg-indigo-600/25 p-2 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-100 bg-clip-text text-transparent">
                Lapor Handri
              </h1>
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                Fakultas Teknologi Industri
              </p>
            </div>
          </div>
          <p className="text-slate-300 text-sm max-w-xl mt-1 leading-relaxed">
            Sampaikan pengaduan, kritik, kendala akademis, sarana prasarana, atau aspirasi Anda secara aman, transparan, dan langsung ditindaklanjuti oleh pimpinan serta divisi terkait FTI.
          </p>
        </div>

        {/* Rapid Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:min-w-[420px]">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-medium">Total Masuk</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold">{totalReports}</span>
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-medium">Verifikasi</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-amber-400">{pendingReports}</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-medium">Diproses</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-sky-400">{processedReports}</span>
              <AlertCircle className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-medium">Selesai</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-emerald-400">{resolvedReports}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Portal-Ready Tabs */}
      <div className="px-6 bg-slate-950/40 border-t border-slate-800 flex flex-wrap gap-2 py-3 items-center justify-between">
        {!isAdmin ? (
          <div className="flex flex-wrap gap-2 items-center">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  id={`tab-${item.id}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Panel {adminRole ? ROLE_LABELS[adminRole] : "Admin"} — Dekanat FTI</span>
              </span>
              <span className="text-xs text-slate-300">
                • Mengelola {totalReports} aduan masuk ({pendingReports} belum diverifikasi)
              </span>
              {adminEmail && (
                <span className="text-[10px] text-slate-400">
                  • Login sebagai {adminName ? `${adminName} (${adminEmail})` : adminEmail}
                </span>
              )}
            </div>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
            >
              ← Keluar / Kembali ke Tampilan Pelapor
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
