import React, { useState, useEffect } from "react";
import { Send, Search, ShieldCheck, Award, CheckCircle2, MessageSquareText } from "lucide-react";
import { Report } from "../types";
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

  return (
    <div className="space-y-8" id="home-view">
      {/* Hero Section - Portal Identity & Primary CTAs */}
      <div className="space-y-6">
        {/* Portal Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1D293D] tracking-tight">
            Lapor FIT
          </h1>
          <p className="text-lg text-[#1D293D]/80 leading-relaxed max-w-2xl">
            Portal aspirasi dan keluhan civitas akademika Fakultas Teknologi Industri UII untuk respons cepat dan transparan.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActiveTab("create")}
            className="px-6 py-3 bg-[#4F39F6] hover:bg-[#3d2acc] text-white rounded-[12px] font-semibold text-sm transition-all shadow-lg shadow-[#4F39F6]/20 cursor-pointer flex items-center justify-center gap-2"
            id="hero-create-btn"
          >
            <Send className="w-4 h-4" />
            Buat Aduan / Aspirasi
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
            Setiap laporan ditindaklanjuti langsung oleh Dekanat Fakultas Teknologi Industri (FTI) UII untuk solusi terbaik.
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

    </div>
  );
}
