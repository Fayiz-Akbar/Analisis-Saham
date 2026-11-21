import React, { useState, useRef, useEffect } from "react";
import { LogOut, ShieldCheck, UserCheck, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AppHeader({
  activeTab,
  setActiveTab,
  onOpenSearch,
  darkMode,
  toggleDarkMode,
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
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

  // Tutup mobile drawer saat Escape ditekan
  useEffect(() => {
    if (!showMobileNav) return;
    function handleEsc(e) {
      if (e.key === "Escape") setShowMobileNav(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showMobileNav]);

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

  const handleSelectNav = (tabId) => {
    setActiveTab(tabId);
    setShowMobileNav(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#080808]/95 border-b border-slate-200 dark:border-[#272727] backdrop-blur-md transition-colors shadow-xs dark:shadow-none">
      <div className="max-w-full lg:max-w-[98%] mx-auto px-3 sm:px-4 lg:px-6 h-14 lg:h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* ========================================================
            KIRI: Logo Investpedia Resmi (Dukungan Light & Dark Mode)
            ======================================================== */}
        <div
          onClick={() => handleSelectNav("dashboard")}
          className="flex items-center cursor-pointer select-none flex-shrink-0"
        >
          <img
            src={darkMode ? "/investpedia-full-dark.png" : "/investpedia-full.png"}
            alt="Investpedia"
            className="h-7 sm:h-8 lg:h-9 w-auto max-w-[132px] sm:max-w-none object-contain transition-opacity"
          />
        </div>

        {/* ========================================================
            TENGAH: Floating Pill Bar Navigasi (Desktop lg+)
            ======================================================== */}
        <nav className="hidden lg:flex flex-1 justify-center max-w-5xl min-w-0 mx-2 xl:mx-4">
          <div className="bg-slate-100 border border-slate-200/90 dark:bg-[#12151e] dark:border-slate-800/90 rounded-full p-1 shadow-xs dark:shadow-md flex items-center gap-0.5 xl:gap-1 max-w-full overflow-x-auto scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectNav(tab.id)}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================================================
            KANAN: Portal Admin + Search + Theme + Login/Akun + Menu Mobile
            ======================================================== */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Pintasan Switch Admin <-> Sistem Utama (HANYA TAMPIL KETIKA SUDAH LOGIN SEBAGAI ADMIN) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleSelectNav(activeTab === "admin" ? "dashboard" : "admin")}
              className={`hidden sm:flex h-9 px-3 rounded-lg border text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "admin"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white"
                  : "bg-slate-100 dark:bg-[#161922] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#272727] hover:border-slate-400 dark:hover:border-slate-500"
              }`}
              title={activeTab === "admin" ? "Beralih ke Sistem Utama (Publik)" : "Beralih ke Portal Administrator"}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-current" />
              <span>
                {activeTab === "admin" ? "Ke Sistem Utama" : "Portal Admin"}
              </span>
            </button>
          )}

          {/* 1. Global Stock Search Bar Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.07] flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            title="Cari Saham IDX (Global Search)"
            aria-label="Cari Saham"
          >
            <svg
              className="w-[18px] h-[18px] stroke-current stroke-2 fill-none"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </button>

          {/* 2. Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.07] flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            aria-label="Ganti Tema"
          >
            {darkMode ? (
              <svg
                className="w-[18px] h-[18px] stroke-current stroke-2 fill-none"
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
                className="w-[18px] h-[18px] stroke-current stroke-2 fill-none"
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

          {/* 3. Desktop Login / User Profile */}
          {isAuthenticated ? (
            <div ref={authRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowAuthMenu(!showAuthMenu)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white hover:bg-slate-100 dark:bg-[#141414] dark:hover:bg-[#1f1f1f] text-slate-900 dark:text-white flex items-center gap-2 transition-colors cursor-pointer"
                title="Profil Pengguna & Autentikasi"
                aria-label="Akun Pengguna"
                aria-expanded={showAuthMenu}
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
                <span className="text-xs font-semibold tracking-tight max-w-[110px] truncate">
                  {user?.name?.split(" ")[0]}
                </span>
              </button>

              {showAuthMenu && (
                <div className="absolute right-0 mt-2 w-[min(17.5rem,calc(100vw-24px))] rounded-xl border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#111111] shadow-lg dark:shadow-none p-3.5 z-50 text-xs space-y-3">
                  <div className="border-b border-slate-200 dark:border-[#272727] pb-3 space-y-0.5">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(activeTab === "admin" ? "dashboard" : "admin");
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-900 dark:text-white transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-current" />
                          {activeTab === "admin" ? "Beralih ke Sistem Utama" : "Buka Portal Admin"}
                        </span>
                        <span>→</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowAuthMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-transparent dark:hover:bg-white/[0.08] text-slate-900 dark:text-white border border-slate-200 dark:border-[#272727] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectNav("login")}
              className="hidden lg:inline-flex h-9 px-4 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>Login</span>
            </button>
          )}

          {/* 4. Mobile / Tablet Navigation Button (< lg) - Ikon 2 Garis Minimalis */}
          <button
            type="button"
            onClick={() => setShowMobileNav((prev) => !prev)}
            aria-expanded={showMobileNav}
            aria-label="Buka menu navigasi"
            title="Menu Navigasi"
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.07] flex items-center justify-center text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors cursor-pointer"
          >
            {showMobileNav ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <svg
                className="w-5 h-5 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>

      {/* Mobile / Tablet Slide-Over Drawer dari Kanan (< lg) */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileNav(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-hidden="true"
          />

          {/* Panel Drawer Kanan */}
          <aside
            aria-label="Menu Navigasi Mobile"
            className="relative z-10 w-[min(300px,82vw)] h-dvh bg-white dark:bg-[#0d0f14] border-l border-slate-200 dark:border-[#272727] shadow-2xl flex flex-col"
          >
            {/* Header Drawer */}
            <div className="h-14 px-4 border-b border-slate-200 dark:border-[#272727] flex items-center justify-between shrink-0">
              <img
                src={darkMode ? "/investpedia-full-dark.png" : "/investpedia-full.png"}
                alt="Investpedia"
                className="h-6 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setShowMobileNav(false)}
                aria-label="Tutup menu navigasi"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141720] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-[#272727] flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Daftar Halaman Memanjang ke Bawah (1 Kolom Vertikal) */}
            <nav
              aria-label="Navigasi Utama"
              className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1"
            >
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectNav(tab.id)}
                    className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer Drawer: Login / Status Akun */}
            <div className="p-3.5 border-t border-slate-200 dark:border-[#272727] bg-slate-50/70 dark:bg-black/20 space-y-2 shrink-0">
              {isAuthenticated ? (
                <>
                  <div className="px-1 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleSelectNav(activeTab === "admin" ? "dashboard" : "admin")}
                      className="w-full h-10 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-current" aria-hidden="true" />
                      <span>
                        {activeTab === "admin" ? "Ke Sistem Utama" : "Buka Portal Admin"}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowMobileNav(false);
                    }}
                    className="w-full h-10 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-[#141720] dark:hover:bg-white/[0.08] text-slate-900 dark:text-white border border-slate-200 dark:border-[#272727] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectNav("login")}
                  className="w-full h-10 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
