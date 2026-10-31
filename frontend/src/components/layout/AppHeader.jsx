import React, { useState, useRef, useEffect } from "react";
import { LogOut, ShieldCheck, UserCheck, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AppHeader({
  activeTab,
  setActiveTab,
  onOpenSearch,
  darkMode,
  toggleDarkMode,
}) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const authRef = useRef(null);

  // Close auth dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (authRef.current && !authRef.current.contains(event.target)) {
        setShowAuthMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 9 Menu Utama Header Sesuai Ketetapan PRD Tabel A:
  const navTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "market", label: "Market & Sentiment" },
    { id: "screener", label: "Stock Screener" },
    { id: "komparasi", label: "Stock Comparison" },
    { id: "watchlist", label: "Watchlist" },
    { id: "portofolio", label: "Portfolio" },
    { id: "simulasi", label: "Simulasi" },
    { id: "learning", label: "Learning" },
    { id: "ai", label: "AI Assistant" },
  ];

  const roleBadgeLabel = isAdmin
    ? "Administrator"
    : user?.investorProfile === "EXPERIENCED"
      ? "Investor (Expert)"
      : "Investor (Pemula)";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080808]/95 border-b border-[#272727] backdrop-blur-md transition-colors">
      <div className="max-w-[98%] mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* ========================================================
            KIRI: Logo Baru InvestAI Sesuai Brand Resmi
            ======================================================== */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-shrink-0"
        >
          {/* Logo Solid Putih: 3 Pilar Pertumbuhan Finansial */}
          <div className="w-8 h-8 rounded-xl bg-[#12151e] border border-slate-800 flex items-center justify-center p-1.5 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white">
              <rect x="3" y="13" width="4.5" height="8" rx="2.25" />
              <rect x="9.75" y="8" width="4.5" height="13" rx="2.25" />
              <rect x="16.5" y="3" width="4.5" height="18" rx="2.25" />
            </svg>
          </div>

          <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block">
            InvestAI
          </span>
        </div>

        {/* ========================================================
            TENGAH: Floating Pill Bar Navigasi (9 Menu Header PRD)
            ======================================================== */}
        <nav className="flex-1 flex justify-center max-w-5xl min-w-0 mx-2 sm:mx-4">
          <div className="bg-[#12151e] border border-slate-800/90 rounded-full p-1 shadow-md flex items-center gap-0.5 sm:gap-1 max-w-full overflow-x-auto scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================================================
            KANAN: Portal Admin Pill + Global Search + User Auth + Theme
            ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Pintasan Portal Admin (Sprint 1 - KF-16) */}
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-white text-slate-950 border-white shadow-xs"
                : isAdmin
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30"
                  : "bg-[#12151e] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
            title="Portal Administrator Manajemen Kurikulum & Kuis"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Portal Admin</span>
          </button>

          {/* 1. Global Stock Search Bar Button */}
          <button
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-xl bg-[#12151e] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            title="Cari Saham IDX (Global Search)"
            aria-label="Cari Saham"
          >
            <svg
              className="w-4 h-4 stroke-white stroke-2 fill-none"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </button>

          {/* 2. User Profile / Auth Button (Login, Register, Logout, Role Badge) */}
          <div ref={authRef} className="relative">
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className={`h-9 px-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                isAuthenticated
                  ? isAdmin
                    ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-200 hover:bg-indigo-950/80"
                    : "bg-emerald-950/50 border-emerald-500/40 text-emerald-200 hover:bg-emerald-950/70"
                  : "w-9 justify-center bg-[#12151e] border-slate-800 hover:border-slate-700 text-white hover:bg-slate-800"
              }`}
              title="Profil Pengguna & Autentikasi"
              aria-label="Akun Pengguna"
            >
              <svg
                className="w-4 h-4 stroke-current stroke-2 fill-none shrink-0"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isAuthenticated && (
                <span className="hidden md:inline text-[11px] font-bold tracking-tight max-w-[110px] truncate">
                  {user?.name?.split(" ")[0]}
                </span>
              )}
            </button>

            {/* Auth Dropdown Popover */}
            {showAuthMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-[#12151e]/98 shadow-2xl p-4 z-50 text-xs space-y-3 backdrop-blur-md">
                {isAuthenticated ? (
                  <>
                    <div className="border-b border-slate-800 pb-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {user?.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            isAdmin
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {roleBadgeLabel}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block truncate">
                        {user?.email}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("admin");
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          {isAdmin ? "Buka Portal Administrator" : "Portal Admin (RBAC)"}
                        </span>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Keluar (Logout Sesi)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-b border-slate-800 pb-2.5">
                      <span className="font-bold text-white text-sm block">
                        Autentikasi Pengguna
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Masuk sebagai Investor atau Administrator
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          openAuthModal("login");
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Masuk (Login Investor)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openAuthModal("register");
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Daftar Akun Investor Baru
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("admin");
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Login Portal Administrator
                        </span>
                        <span>→</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    InvestAI • Analisis Fundamental & Simulasi Pasar Modal IDX
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl bg-[#12151e] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            aria-label="Ganti Tema"
          >
            {darkMode ? (
              <svg
                className="w-4 h-4 stroke-white stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" />
                <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
                <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" />
                <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 stroke-white stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
