import React, { useState, useRef, useEffect } from "react";

export default function AppHeader({
  activeTab,
  setActiveTab,
  onOpenSearch,
  darkMode,
  toggleDarkMode,
}) {
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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090d]/95 border-b border-slate-800/80 backdrop-blur-md transition-colors">
      <div className="max-w-[98%] mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* ========================================================
            KIRI: Logo Investpedia Resmi
            ======================================================== */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center cursor-pointer select-none flex-shrink-0"
        >
          <img
            src={darkMode ? "/investpedia-full-dark.png" : "/investpedia-full.png"}
            alt="Investpedia"
            className="h-8 sm:h-9 w-auto object-contain"
          />
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
            KANAN: Global Search Bar + User Profile / Auth + Theme
            ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
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

          {/* 2. User Profile / Auth Button (Login, Register, Logout) */}
          <div ref={authRef} className="relative">
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className="w-9 h-9 rounded-xl bg-[#12151e] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
              title="Profil Pengguna & Autentikasi"
              aria-label="Akun Pengguna"
            >
              <svg
                className="w-4 h-4 stroke-white stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Auth Dropdown Popover */}
            {showAuthMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-[#12151e]/98 shadow-2xl p-4 z-50 text-xs space-y-3 backdrop-blur-md">
                <div className="border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-white text-sm block">Autentikasi Pengguna</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Sesi Investor Aktif</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      alert("Fitur login pengguna berbasis JWT aktif.");
                      setShowAuthMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Masuk (Login)
                  </button>
                  <button
                    onClick={() => {
                      alert("Fitur pendaftaran akun baru terbuka.");
                      setShowAuthMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    Daftar Akun Baru
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Investpedia AI • Analisis Fundamental Pasar Modal IDX
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
