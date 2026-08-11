import React, { useState, useEffect } from "react";
import { Report, ReportStatus, ReportComment, AdminRole } from "./types";
import * as api from "./lib/api";
import PortalHeader from "./components/PortalHeader";
import HomeView from "./components/HomeView";
import ReportForm from "./components/ReportForm";
import ReportTracker from "./components/ReportTracker";
import PublicFeed from "./components/PublicFeed";
import AdminPanel from "./components/AdminPanel";
import MobileBottomNav from "./components/MobileBottomNav";
import LoginGate from "./components/LoginGate";
import { Building2 } from "lucide-react";

import { Division } from "./lib/divisions";

type AuthState = { status: "loading" | "authenticated" | "unauthenticated"; email?: string; name?: string; role?: AdminRole; division?: Division };

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  domain_not_allowed: "Login gagal: portal ini hanya untuk civitas akademika UII (email @uii.ac.id atau subdomainnya, misal @students.uii.ac.id).",
  missing_code: "Login gagal: proses OAuth tidak lengkap. Silakan coba lagi.",
  no_id_token: "Login gagal: Google tidak mengembalikan token identitas. Silakan coba lagi.",
  no_email: "Login gagal: akun Google Anda tidak memiliki email yang dapat diverifikasi.",
  oauth_failed: "Login gagal karena kesalahan teknis. Silakan coba lagi.",
};

export default function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [searchTicketId, setSearchTicketId] = useState<string>("");
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  const isLoggedIn = auth.status === "authenticated";
  const isAdminUser = isLoggedIn && !!auth.role;

  const refreshReports = async () => {
    const data = await api.getReports();
    setReports(data);
  };

  const refreshAuth = async () => {
    const me = await api.getMe();
    setAuth(
      me.authenticated
        ? { status: "authenticated", email: me.email, name: me.name, role: me.role, division: me.division }
        : { status: "unauthenticated" }
    );
  };

  useEffect(() => {
    refreshAuth();

    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    if (authError) {
      setAuthErrorMsg(AUTH_ERROR_MESSAGES[authError] || "Login gagal. Silakan coba lagi.");
      params.delete("authError");
      const newSearch = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
    }
  }, []);

  // The whole app is gated behind login (see server/app.ts requireLogin), so
  // only fetch reports once we know there's a valid session — otherwise every
  // request 401s before the user even sees the login screen.
  useEffect(() => {
    if (isLoggedIn) refreshReports();
  }, [isLoggedIn]);

  const handleRequestLogin = () => {
    window.location.href = api.apiUrl("api/auth/google/start");
  };

  const handleLogout = async () => {
    await api.logout();
    setReports([]);
    await refreshAuth();
  };

  // Submit report handler
  const handleAddNewReport = async (
    payload: Omit<Report, "id" | "status" | "createdAt" | "updatedAt" | "timeline" | "comments">
  ): Promise<Report> => {
    const created = await api.createReport(payload);
    await refreshReports();
    return created;
  };

  // Update status handler (Admin/Staff only)
  const handleUpdateStatusAndNote = async (ticketId: string, status: ReportStatus, note: string) => {
    await api.updateReportStatus(ticketId, status, note);
    await refreshReports();
  };

  // Add discussion comment handler
  const handleAddComment = async (ticketId: string, comment: ReportComment) => {
    await api.addComment(ticketId, comment);
    await refreshReports();
  };

  if (auth.status === "loading") {
    return <div className="min-h-screen bg-slate-50/70" id="lapor-handri-app-loading" />;
  }

  if (auth.status === "unauthenticated") {
    return (
      <LoginGate
        onLogin={handleRequestLogin}
        errorMsg={authErrorMsg}
        onDismissError={() => setAuthErrorMsg(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 text-slate-800 flex flex-col font-sans pb-20 md:pb-6" id="lapor-handri-app">
      {/* Outer wrapper max-w-7xl matching responsive precision guidelines */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col space-y-5 sm:space-y-6">

        {/* Portal Breadcrumbs */}
        <div className="flex items-center text-[11px] text-slate-400 font-semibold px-1">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Portal FTI UII</span>
            <span>&gt;</span>
            <span className="text-slate-600">Lapor Handri (Aspirasi & Keluhan)</span>
          </div>
        </div>

        {authErrorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3">
            <span>{authErrorMsg}</span>
            <button onClick={() => setAuthErrorMsg(null)} className="text-rose-500 hover:text-rose-800 font-bold text-lg leading-none cursor-pointer">×</button>
          </div>
        )}

        {/* Dynamic Header */}
        <PortalHeader
          reports={reports}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdminUser}
          adminName={auth.name}
          adminEmail={auth.email}
          adminRole={auth.role}
          onLogout={handleLogout}
        />

        {/* Main View Shell - dynamically routing requested tab */}
        <main className="flex-1">
          {isAdminUser ? (
            <AdminPanel
              reports={reports}
              adminRole={auth.role}
              adminEmail={auth.email}
              adminDivision={auth.division}
              onUpdateStatus={handleUpdateStatusAndNote}
              onAddComment={handleAddComment}
              onRefreshReports={refreshReports}
            />
          ) : (
            <div className="transition-all duration-300">
              {activeTab === "home" && (
                <HomeView
                  reports={reports}
                  setActiveTab={setActiveTab}
                  setSearchTicketId={setSearchTicketId}
                />
              )}
              {activeTab === "create" && (
                <ReportForm
                  onSubmit={handleAddNewReport}
                  setActiveTab={setActiveTab}
                  setSearchTicketId={setSearchTicketId}
                />
              )}
              {activeTab === "track" && (
                <ReportTracker
                  reports={reports}
                  searchTicketId={searchTicketId}
                  setSearchTicketId={setSearchTicketId}
                  onAddComment={handleAddComment}
                />
              )}
              {activeTab === "feed" && (
                <PublicFeed
                  reports={reports}
                  setActiveTab={setActiveTab}
                  setSearchTicketId={setSearchTicketId}
                />
              )}
            </div>
          )}
        </main>

        {/* Portal-Friendly Humble Footer */}
        <footer className="text-center text-slate-400 text-[10px] pt-8 pb-4 border-t border-slate-200/50 space-y-1">
          <p>© {new Date().getFullYear()} Fakultas Teknologi Industri • Universitas Islam Indonesia.</p>
          <p className="font-medium text-slate-400">
            Dikembangkan untuk meningkatkan tata kelola layanan prima, keterbukaan informasi, dan partisipasi mahasiswa.
          </p>
        </footer>
      </div>

      {/* Floating Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdminUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
