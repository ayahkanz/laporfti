import React, { useState, useEffect } from "react";
import { Send, Search, ShieldCheck, Eye, Award, CheckCircle2, MessageSquareText } from "lucide-react";
import { Report, ReportCategory } from "../types";
import { getHotline } from "../lib/api";
import { formatPhoneNumber } from "../utils/whatsapp";

interface HomeViewProps {
  reports: Report[];
  setActiveTab: (tab: string) => void;
  setSearchTicketId: (id: string) => void;
}

export default function HomeView({ reports, setActiveTab, setSearchTicketId }: HomeViewProps) {
  const [ticketInput, setTicketInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCat, setSelectedCat] = useState<{ name: ReportCategory; count: number } | null>(null);
  const [hotline, setHotline] = useState<{ phone: string; label: string } | null>(null);

  useEffect(() => {
    getHotline()
      .then((data) => {
        if (data.phone) setHotline(data);
      })
      .catch(() => {});
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    const formattedInput = ticketInput.trim().toUpperCase();
    const found = reports.find(
      (r) => r.id === formattedInput || r.id.replace(/-/g, "").includes(formattedInput.replace(/-/g, ""))
    );

    if (found) {
      setSearchTicketId(found.id);
      setActiveTab("track");
      setErrorMsg("");
    } else {
      setErrorMsg("Maaf, Kode Tiket tidak ditemukan. Silakan periksa kembali.");
    }
  };

  const categoryCounts = Object.values(ReportCategory).map((cat) => {
    const count = reports.filter((r) => r.category === cat).length;
    return { name: cat, count };
  });

  return (
    <div className="space-y-8" id="home-view">
      {/* Hero Section - Portal Identity & Primary CTAs */}
      <div className="space-y-6">
        {/* Portal Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1D293D] tracking-tight">
            Lapor Handri
          </h1>
          <p className="text-lg text-[#1D293D]/80 leading-relaxed max-w-2xl">
            Portal aspirasi dan keluhan civitas akademika Fakultas Teknologi Industri UII untuk respons cepat dan transparan.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActiveTab("create")}
            className="px-6 py-3 bg-[#4F39F6] hover:bg-[#3d2acc] text-white rounded-[12px] font-semibold text-sm transition-all shadow-lg shadow-[#4F39F6]/20 cursor-pointer flex items-center justify-center gap-2"
            id="hero-create-btn"
          >
            <Send className="w-4 h-4" />
            Buat Aduan / Aspirasi
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className="px-6 py-3 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1D293D] rounded-[12px] font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            id="hero-feed-btn"
          >
            <Eye className="w-4 h-4" />
            Lihat Laporan Publik
          </button>
        </div>
      </div>

      {/* Ticket Tracking Section */}
      <div className="bg-white rounded-[12px] p-6 md:p-8 border border-[#A8A8CC]/20 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#4F39F6]/10 rounded-[8px]">
            <Search className="w-5 h-5 text-[#4F39F6]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1D293D] text-lg">Lacak Status Laporan</h3>
            <p className="text-sm text-[#1D293D]/60 mt-1">
              Masukkan kode tiket yang Anda terima untuk melihat progres penanganan secara real-time.
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => {
                setTicketInput(e.target.value);
                setErrorMsg("");
              }}
              placeholder="Contoh: LH-20260615-0012"
              className="w-full px-4 py-3 bg-[#FAFCFD] border border-[#A8A8CC] rounded-[12px] text-[#1D293D] placeholder-[#1D293D]/40 focus:outline-none focus:ring-2 focus:ring-[#4F39F6]/20 font-mono text-sm uppercase"
              id="quick-track-input"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#4F39F6] hover:bg-[#3d2acc] text-white rounded-[12px] font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-[#4F39F6]/20"
            id="quick-track-submit"
          >
            Cari Tiket
          </button>
        </form>
        {errorMsg && (
          <p className="text-red-600 text-xs font-semibold">{errorMsg}</p>
        )}
      </div>

      {/* Trust Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[12px] p-5 border border-[#A8A8CC]/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4F39F6]/10 rounded-[8px]">
              <ShieldCheck className="w-5 h-5 text-[#4F39F6]" />
            </div>
            <h4 className="font-bold text-[#1D293D]">Privasi Terjamin</h4>
          </div>
          <p className="text-sm text-[#1D293D]/60 leading-relaxed">
            Identitas Anda dilindungi sepenuhnya. Laporan dapat dikirim secara anonim sesuai pilihan Anda.
          </p>
        </div>

        <div className="bg-white rounded-[12px] p-5 border border-[#A8A8CC]/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4F39F6]/10 rounded-[8px]">
              <CheckCircle2 className="w-5 h-5 text-[#4F39F6]" />
            </div>
            <h4 className="font-bold text-[#1D293D]">Transparansi Proses</h4>
          </div>
          <p className="text-sm text-[#1D293D]/60 leading-relaxed">
            Timeline penanganan didokumentasikan dengan jelas. Anda dapat memantau setiap tahap penyelesaian.
          </p>
        </div>

        <div className="bg-white rounded-[12px] p-5 border border-[#A8A8CC]/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4F39F6]/10 rounded-[8px]">
              <Award className="w-5 h-5 text-[#4F39F6]" />
            </div>
            <h4 className="font-bold text-[#1D293D]">Respons Berkelanjutan</h4>
          </div>
          <p className="text-sm text-[#1D293D]/60 leading-relaxed">
            Setiap laporan ditindaklanjuti langsung oleh tim dekanat FTI untuk solusi terbaik.
          </p>
        </div>
      </div>

      {/* Public Hotline Contact Card */}
      {hotline && (
        <div className="bg-white rounded-[12px] p-6 border border-[#A8A8CC]/20 flex items-center justify-between gap-4 flex-wrap" id="hotline-contact-card">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-[8px]">
              <MessageSquareText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1D293D]">{hotline.label}</h4>
              <p className="text-sm text-[#1D293D]/60 mt-1">
                Butuh respons cepat untuk hal darurat? Hubungi kontak resmi FTI di bawah ini.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${formatPhoneNumber(hotline.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[12px] font-semibold text-sm transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0"
          >
            <MessageSquareText className="w-4 h-4" />
            {hotline.phone}
          </a>
        </div>
      )}

      {/* Report Categories Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-[#1D293D] text-xl">Kategori Laporan</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoryCounts.map((cat, index) => (
            <button
              key={index}
              onClick={() => setSelectedCat(cat)}
              className="bg-white hover:bg-[#4F39F6]/5 p-4 rounded-[12px] border border-[#A8A8CC]/20 hover:border-[#4F39F6]/40 transition-all flex flex-col justify-between group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#4F39F6]/20"
              id={`cat-card-${index}`}
            >
              <p className="text-[#1D293D] text-sm font-semibold leading-tight group-hover:text-[#4F39F6] transition-colors">
                {cat.name}
              </p>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#A8A8CC]/10">
                <span className="text-[#1D293D]/50 text-xs font-semibold uppercase tracking-wider">Aktif</span>
                <span className="px-2.5 py-1 bg-[#4F39F6]/10 group-hover:bg-[#4F39F6] group-hover:text-white text-[#4F39F6] rounded-full text-xs font-bold transition-all">
                  {cat.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dean's Message Section */}
      <div className="bg-white rounded-[12px] p-6 md:p-8 border border-[#A8A8CC]/20 space-y-4">
        <div className="space-y-4">
          <span className="inline-block text-xs font-bold text-[#4F39F6] uppercase tracking-wider bg-[#4F39F6]/10 px-3 py-1 rounded-[6px]">
            Pesan Dekanat
          </span>
          <blockquote className="text-lg text-[#1D293D] leading-relaxed italic">
            "Komitmen kami adalah mendengarkan setiap suara civitas akademika dan mengubahnya menjadi tindakan nyata. Bersama-sama kita membangun FTI yang lebih baik."
          </blockquote>
          <div className="flex items-center gap-3 pt-3 border-t border-[#A8A8CC]/10">
            <div className="w-12 h-12 rounded-full bg-[#4F39F6] text-white font-bold flex items-center justify-center text-sm">
              MH
            </div>
            <div>
              <p className="font-bold text-[#1D293D] text-sm">Mas Handri & Tim Dekanat</p>
              <p className="text-xs text-[#1D293D]/50">Fakultas Teknologi Industri UII</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Action Modal */}
      {selectedCat && (
        <div className="fixed inset-0 bg-[#1D293D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="category-action-modal">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-5 border border-[#A8A8CC]/20 shadow-2xl relative">
            <button
              onClick={() => setSelectedCat(null)}
              className="absolute top-4 right-4 text-[#1D293D]/40 hover:text-[#1D293D]/60 text-2xl cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-2">
              <span className="inline-block text-xs font-bold text-[#4F39F6] uppercase tracking-wider bg-[#4F39F6]/10 px-3 py-1 rounded-[6px]">
                Kategori Laporan
              </span>
              <h3 className="text-xl font-bold text-[#1D293D]">{selectedCat.name}</h3>
              <p className="text-sm text-[#1D293D]/60">
                Terdapat <strong className="text-[#4F39F6] font-bold">{selectedCat.count} laporan aktif</strong> pada kategori ini.
              </p>
            </div>

            <div className="space-y-2 pt-3">
              <button
                onClick={() => {
                  setSelectedCat(null);
                  setActiveTab("create");
                }}
                className="w-full p-3.5 bg-[#4F39F6] hover:bg-[#3d2acc] text-white rounded-[12px] text-sm font-semibold transition-all shadow-lg shadow-[#4F39F6]/20 cursor-pointer flex items-center justify-between"
                id="modal-create-cat-btn"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Buat Laporan Baru
                </span>
                <span className="text-white/70 text-xs">→</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCat(null);
                  setActiveTab("feed");
                }}
                className="w-full p-3.5 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1D293D] rounded-[12px] text-sm font-semibold transition-all cursor-pointer flex items-center justify-between"
                id="modal-feed-cat-btn"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Lihat Laporan Publik
                </span>
                <span className="text-[#1D293D]/50 text-xs">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
