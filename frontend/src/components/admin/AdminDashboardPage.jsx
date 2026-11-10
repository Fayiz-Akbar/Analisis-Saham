import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileQuestion,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PenTool,
  Plus,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../services/apiClient";
import AdminLoginPage from "./AdminLoginPage";
import AdminModuleManagement from "./AdminModuleManagement";
import AdminQuizManagement from "./AdminQuizManagement";
import LearningContentStudio from "./LearningContentStudio";
import { LEVEL_META } from "./adminConstants";

const NAV_ITEMS = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "studio", label: "Content Studio (CMS)", icon: PenTool },
  { id: "modules", label: "Tabel Kurikulum", icon: BookOpen },
  { id: "quizzes", label: "Bank Soal Kuis", icon: FileQuestion },
];

export default function AdminDashboardPage({
  onBackToDashboard,
  darkMode,
  toggleDarkMode,
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [activeView, setActiveView] = useState("studio"); // "overview" | "studio" | "modules" | "quizzes"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [triggerCreateModule, setTriggerCreateModule] = useState(false);

  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({
    totalModules: 0,
    publishedModules: 0,
    draftModules: 0,
    totalEstimatedMinutes: 0,
    totalQuizQuestions: 0,
    totalInvestors: 0,
    modulesByLevel: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 },
    questionsByLevel: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 },
  });
  const [selectedQuizModuleId, setSelectedQuizModuleId] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" }

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadAdminModules = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    try {
      setIsLoading(true);
      const res = await adminApi.getModules();
      const loadedModules = res?.data?.modules || [];
      setModules(loadedModules);
      if (res?.data?.stats) {
        setStats(res.data.stats);
      }
      setSelectedQuizModuleId((prev) => {
        if (prev === "ALL") return "ALL";
        if (prev && loadedModules.some((m) => m.id === prev)) return prev;
        return "ALL";
      });
    } catch (err) {
      showToast(err.message || "Gagal memuat data kurikulum.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, showToast]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      Promise.resolve().then(() => {
        loadAdminModules();
      });
    }
  }, [isAuthenticated, isAdmin, loadAdminModules]);

  const recentModules = useMemo(() => {
    return [...modules]
      .sort((a, b) => {
        const da = new Date(a.updatedAt || a.updated_at || a.createdAt || 0).getTime();
        const db = new Date(b.updatedAt || b.updated_at || b.createdAt || 0).getTime();
        return db - da;
      })
      .slice(0, 5);
  }, [modules]);

  // Jika belum login sebagai ADMIN, tampilkan gerbang autentikasi AdminLoginPage
  if (!isAuthenticated || !isAdmin) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          showToast("Sesi administrator aktif.", "success");
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // Handlers CRUD Materi
  const handleCreateModule = async (payload) => {
    const res = await adminApi.createModule(payload);
    showToast(
      `Materi "${res?.data?.module?.title || payload.title}" berhasil disimpan.`,
      "success"
    );
    await loadAdminModules();
  };

  const handleUpdateModule = async (id, payload) => {
    const res = await adminApi.updateModule(id, payload);
    showToast(
      `Materi "${res?.data?.module?.title || "Pembelajaran"}" berhasil diperbarui.`,
      "success"
    );
    await loadAdminModules();
  };

  const handleDeleteModule = async (id) => {
    const res = await adminApi.deleteModule(id);
    showToast(res?.message || "Materi pembelajaran berhasil dihapus.", "success");
    await loadAdminModules();
  };

  // Navigasi Kontekstual: Materi -> Kelola Soal
  const handleOpenModuleQuizzes = (mod) => {
    setSelectedQuizModuleId(mod.id);
    setActiveView("quizzes");
  };

  const handleNavigate = (viewId) => {
    if (viewId === "quizzes" && activeView !== "quizzes") {
      setSelectedQuizModuleId("ALL");
    }
    setActiveView(viewId);
    setSidebarOpen(false);
  };

  const handleQuickCreateModule = () => {
    setActiveView("studio");
  };

  const currentPageLabel =
    NAV_ITEMS.find((item) => item.id === activeView)?.label || "Content Studio (CMS)";

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-slate-100">
      {/* Overlay Mobile Drawer */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ================================================================
          SIDEBAR NAVIGATION (Desktop Fixed, Mobile Drawer)
          ================================================================ */}
      <aside
        aria-label="Navigasi Administrator"
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-[#0c0c0c] border-r border-slate-200 dark:border-[#222222] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Bagian Atas Sidebar: Brand & Menu Navigasi */}
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/investpedia-full.png"
                alt="Investpedia"
                className="h-7 w-auto object-contain select-none block dark:hidden"
              />
              <img
                src="/investpedia-full-dark.png"
                alt="Investpedia"
                className="h-7 w-auto object-contain select-none hidden dark:block"
              />
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#2a2a2a]">
                CMS
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup menu navigasi"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161616]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bagian Bawah Sidebar: Informasi Administrator & Keluar Sesi */}
        <div className="p-4 border-t border-slate-200 dark:border-[#222222] space-y-3">
          <div className="px-2 space-y-0.5">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name || "Administrator"}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full h-9 px-3 rounded-lg text-xs font-medium text-rose-600 dark:text-[#f87171] hover:bg-rose-50 dark:hover:bg-[#2a0e12]/60 border border-transparent hover:border-rose-200 dark:hover:border-[#4c151c] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA (Topbar + Halaman Aktif)
          ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Sederhana */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 lg:px-8 bg-white/95 dark:bg-[#0c0c0c]/95 border-b border-slate-200 dark:border-[#222222] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#272727] flex items-center justify-center text-slate-600 dark:text-slate-300 lg:hidden cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
                Admin Portal
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
                /
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentPageLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toggleDarkMode && (
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Ubah tema tampilan"
                title={darkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#272727] bg-slate-50 dark:bg-[#141414] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e1e1e] transition-colors cursor-pointer"
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] bg-slate-50 dark:bg-[#141414] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e1e1e] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sistem Utama</span>
              </button>
            )}
          </div>
        </header>

        {/* Konten Halaman */}
        <main
          className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${
            activeView === "studio" ? "max-w-[1480px]" : "max-w-6xl"
          }`}
        >
          {/* Notifikasi Feedback CRUD */}
          {toast && (
            <div
              role="status"
              aria-live="polite"
              className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
                toast.type === "error"
                  ? "bg-rose-50 dark:bg-[#2a0e12] border-rose-200 dark:border-[#4c151c] text-rose-800 dark:text-[#f87171]"
                  : "bg-emerald-50 dark:bg-[#062c19] border-emerald-200 dark:border-[#0e4429] text-emerald-800 dark:text-[#34d399]"
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Tutup notifikasi"
                className="opacity-70 hover:opacity-100 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ==============================================================
              VIEW 1: RINGKASAN PENGELOLAAN KONTEN (Section 4)
              ============================================================== */}
          {activeView === "overview" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    Ringkasan Konten
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ikhtisar kurikulum pembelajaran, Visual Block Studio, dan bank soal evaluasi pasar modal.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => handleNavigate("studio")}
                    className="h-9 px-4 rounded-lg text-xs font-semibold bg-[#e3252f] text-white hover:bg-[#c91f28] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Buka Content Studio</span>
                  </Button>
                </div>
              </div>

              {/* Statistik Ringkas */}
              <div className="rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-[#242424]">
                <div className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Total Modul Materi
                  </span>
                  <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {stats.totalModules}
                  </div>
                </div>

                <div className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Materi Diterbitkan
                  </span>
                  <div className="text-2xl font-semibold font-mono tabular-nums text-emerald-600 dark:text-[#34d399]">
                    {stats.publishedModules}
                  </div>
                </div>

                <div className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Materi Draft
                  </span>
                  <div className="text-2xl font-semibold font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {stats.draftModules}
                  </div>
                </div>

                <div className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Total Soal Kuis
                  </span>
                  <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {stats.totalQuizQuestions}
                  </div>
                </div>
              </div>

              {/* Akses Cepat Pengelolaan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleNavigate("studio")}
                  className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] hover:border-[#e3252f] text-left transition-colors space-y-1 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-[#e3252f]" />
                    <span>Visual Learning Content Studio</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Editor berbasis blok visual (Heading, Tabel, Rumus, Gambar, Kuis, & AI Chunking).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("modules")}
                  className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] hover:border-slate-400 dark:hover:border-slate-600 text-left transition-colors space-y-1 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Tabel Kurikulum Pembelajaran
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lihat daftar tabel modul, ubah status publikasi cepat, atau filter jenjang.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("quizzes")}
                  className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] hover:border-slate-400 dark:hover:border-slate-600 text-left transition-colors space-y-1 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Kelola Bank Soal Kuis
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kelola pertanyaan pilihan ganda deterministik, kunci jawaban, dan indikator.
                  </p>
                </button>
              </div>

              {/* Daftar Materi Terbaru */}
              <div className="rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Materi Pembelajaran Terbaru
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleNavigate("studio")}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Buka di Studio ({modules.length}) →
                  </button>
                </div>

                {recentModules.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    Belum ada materi pembelajaran yang terdaftar.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200/80 dark:divide-[#222222]">
                    {recentModules.map((mod) => {
                      const isPublished = Boolean(mod.isPublished ?? mod.is_published);
                      const quizCount = mod.quizCount ?? mod.quiz_count ?? 0;

                      return (
                        <div
                          key={mod.id}
                          className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {mod.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {LEVEL_META[mod.level]?.label || "Pemula"}
                              </span>
                              <span>•</span>
                              <span>{quizCount} soal</span>
                              <span>•</span>
                              <span
                                className={
                                  isPublished
                                    ? "text-emerald-600 dark:text-[#34d399] font-medium"
                                    : "text-slate-500"
                                }
                              >
                                {isPublished ? "Terbit" : "Draft"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleNavigate("studio")}
                              className="h-8 px-3 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition-colors cursor-pointer"
                            >
                              Edit di Studio
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenModuleQuizzes(mod)}
                              className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            >
                              Kelola Soal
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              VIEW 2: VISUAL LEARNING CONTENT STUDIO (CMS)
              ============================================================== */}
          {activeView === "studio" && (
            <LearningContentStudio
              onOpenModuleQuizzes={handleOpenModuleQuizzes}
              onModulesChanged={loadAdminModules}
              onNotify={showToast}
            />
          )}

          {/* ==============================================================
              VIEW 3: TABEL KURIKULUM MATERI PEMBELAJARAN
              ============================================================== */}
          {activeView === "modules" && (
            <AdminModuleManagement
              modules={modules}
              isLoading={isLoading}
              onCreateModule={handleCreateModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
              onOpenModuleQuizzes={handleOpenModuleQuizzes}
              externalCreateModalOpen={triggerCreateModule}
              onExternalCreateModalHandled={() => setTriggerCreateModule(false)}
            />
          )}

          {/* ==============================================================
              VIEW 4: BANK SOAL KUIS
              ============================================================== */}
          {activeView === "quizzes" && (
            <AdminQuizManagement
              modules={modules}
              selectedModuleId={selectedQuizModuleId}
              onSelectModuleId={setSelectedQuizModuleId}
              onBackToModules={() => setActiveView("studio")}
              onQuizzesChanged={loadAdminModules}
              onNotify={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
