import React from "react";
import { Home, PlusCircle, Search, MessageSquare, ShieldCheck } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onRequestLogin: () => void;
  onLogout: () => void;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  isAdmin,
  onLogout,
}: MobileBottomNavProps) {
  const navItems = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "create", label: "Lapor", icon: PlusCircle, isHighlight: true },
    { id: "track", label: "Lacak", icon: Search },
    { id: "feed", label: "Publik", icon: MessageSquare },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 text-white shadow-2xl transition-all"
      id="mobile-bottom-nav"
    >
      {!isAdmin ? (
        <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "text-indigo-400 font-bold bg-indigo-950/60"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id={`mobile-nav-${item.id}`}
              >
                {item.isHighlight ? (
                  <div className="p-1.5 bg-indigo-600 rounded-full text-white shadow-md shadow-indigo-900/50 -mt-2">
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5 mb-0.5" />
                )}
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between max-w-md mx-auto px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Dashboard Staf FTI</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            id="mobile-exit-admin-btn"
          >
            ← Keluar
          </button>
        </div>
      )}
    </nav>
  );
}
