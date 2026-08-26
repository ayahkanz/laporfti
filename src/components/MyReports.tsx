import React from "react";
import { Calendar, ChevronRight, FileQuestion } from "lucide-react";
import { Report, ReportStatus } from "../types";

interface MyReportsProps {
  reports: Report[];
  userEmail?: string;
  setActiveTab: (tab: string) => void;
  setSearchTicketId: (id: string) => void;
}

export default function MyReports({ reports, userEmail, setActiveTab, setSearchTicketId }: MyReportsProps) {
  const myReports = reports
    .filter((r) => userEmail && r.reporterEmail?.toLowerCase() === userEmail.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.MENUNGGU:
        return "bg-amber-50 text-amber-800 border-amber-200";
      case ReportStatus.DIPROSES:
        return "bg-sky-50 text-sky-800 border-sky-200";
      case ReportStatus.SELESAI:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case ReportStatus.DITOLAK:
        return "bg-slate-50 text-slate-800 border-slate-200";
    }
  };

  const handleOpenDetail = (id: string) => {
    setSearchTicketId(id);
    setActiveTab("track");
  };

  return (
    <div className="space-y-6" id="my-reports-view">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Laporan Saya</h3>
        <p className="text-slate-500 text-xs mt-1">
          Semua aduan/aspirasi yang pernah Anda kirimkan dengan akun ini, apa pun status penanganannya.
        </p>
      </div>

      {myReports.length === 0 ? (
        <div className="bg-slate-50 text-center py-12 rounded-2xl border border-slate-200/50 space-y-2">
          <FileQuestion className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Belum ada laporan dengan akun ini.</p>
          <p className="text-xs text-slate-500">Laporan yang Anda kirimkan akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3" id="my-reports-list">
          {myReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleOpenDetail(report.id)}
              className="bg-white hover:bg-slate-50/50 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {report.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusBadge(report.status)}`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{report.title}</p>
                <p className="text-[10px] text-slate-400">{report.category}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
