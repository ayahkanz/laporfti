import React, { useState } from "react";
import { Filter, Search, Calendar, MessageSquare, ArrowRight, CornerDownRight, ThumbsUp, Tag } from "lucide-react";
import { Report, ReportCategory, ReportStatus } from "../types";

interface PublicFeedProps {
  reports: Report[];
  setActiveTab: (tab: string) => void;
  setSearchTicketId: (id: string) => void;
}

export default function PublicFeed({ reports, setActiveTab, setSearchTicketId }: PublicFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Keep track of mock upvotes/likes for some reports
  const [upvotes, setUpvotes] = useState<{ [id: string]: number }>({
    "LH-20260615-0012": 18,
    "LH-20260620-0045": 7,
    "LH-20260627-0102": 32,
  });

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Filter public reports
  const publicReports = reports.filter((r) => r.isPublic);

  const filteredReports = publicReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || report.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || report.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenDetail = (id: string) => {
    setSearchTicketId(id);
    setActiveTab("track");
  };

  const getStatusColor = (status: ReportStatus) => {
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

  return (
    <div className="space-y-6" id="public-feed-view">
      {/* Title Header */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Kanal Transparansi Laporan Publik</h3>
        <p className="text-slate-500 text-xs mt-1">
          Pantau seluruh aspirasi dan laporan kemajuan fasilitas dari mahasiswa FTI yang dipublikasikan secara transparan.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kata kunci, topik, atau kode tiket..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {Object.values(ReportCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              {Object.values(ReportStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed Cards List */}
      {filteredReports.length === 0 ? (
        <div className="bg-slate-50 text-center py-12 rounded-2xl border border-slate-200/50 space-y-2">
          <p className="text-sm font-bold text-slate-700">Tidak ada laporan publik yang cocok.</p>
          <p className="text-xs text-slate-500">Coba ubah filter pencarian atau kata kunci Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" id="feed-reports-list">
          {filteredReports.map((report) => {
            const hasResponse = report.comments.some((c) => c.senderRole === "Admin");
            return (
              <div
                key={report.id}
                onClick={() => handleOpenDetail(report.id)}
                className="bg-white hover:bg-slate-50/50 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer space-y-4 group relative"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {report.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                {/* Title and Summary */}
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {report.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {report.description}
                  </p>
                </div>

                {/* Latest response preview if exists */}
                {report.comments.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                    <CornerDownRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="line-clamp-2">
                      <strong className="text-slate-800">Tanggapan terakhir: </strong>
                      &ldquo;{report.comments[report.comments.length - 1].content}&rdquo;
                    </div>
                  </div>
                )}

                {/* Footer buttons and details */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    {/* Category Label */}
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {report.category}
                    </span>

                    {/* Upvote support counter */}
                    <button
                      onClick={(e) => handleUpvote(report.id, e)}
                      className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Dukung laporan ini"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      <span>{upvotes[report.id] || 0} Dukungan</span>
                    </button>

                    {/* Comments Count */}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{report.comments.length} Balasan</span>
                    </span>
                  </div>

                  <span className="text-indigo-600 font-bold group-hover:translate-x-1.5 transition-transform duration-300 flex items-center gap-1">
                    Buka Detail
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
