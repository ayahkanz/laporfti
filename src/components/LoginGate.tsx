import React from "react";
import { Award, LogIn, Building2 } from "lucide-react";

interface LoginGateProps {
  onLogin: () => void;
  errorMsg?: string | null;
  onDismissError?: () => void;
}

export default function LoginGate({ onLogin, errorMsg, onDismissError }: LoginGateProps) {
  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-6 font-sans" id="login-gate">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto">
          <Award className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-slate-900">Lapor Handri</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Fakultas Teknologi Industri UII
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 text-left">
            <span>{errorMsg}</span>
            {onDismissError && (
              <button onClick={onDismissError} className="text-rose-500 hover:text-rose-800 font-bold text-lg leading-none cursor-pointer shrink-0">×</button>
            )}
          </div>
        )}

        <p className="text-sm text-slate-600 leading-relaxed">
          Portal ini khusus untuk civitas akademika Universitas Islam Indonesia. Silakan login dengan akun Google UII Anda (<span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">@uii.ac.id</span> / <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">@students.uii.ac.id</span>) untuk melanjutkan.
        </p>

        <button
          onClick={onLogin}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          id="login-gate-btn"
        >
          <LogIn className="w-4 h-4" />
          Login dengan Google
        </button>
      </div>
    </div>
  );
}
