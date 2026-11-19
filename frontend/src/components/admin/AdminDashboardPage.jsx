import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileQuestion,
  FileText,
  FolderKanban,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../services/apiClient";
import AdminCurriculumManager from "./AdminCurriculumManager";
import AdminLoginPage from "./AdminLoginPage";
import AdminQuizManagement from "./AdminQuizManagement";
import LearningContentStudio from "./LearningContentStudio";
import { LEVEL_META } from "./adminConstants";

const DEFAULT_MEDIA_ITEMS = [
  {
    id: "media-1",
    title: "Logo Utama Investpedia",
    url: "/investpedia-full.png",
    category: "Identitas Brand",
    date: "19 Nov 2026",
  },
  {
    id: "media-2",
    title: "Logo Mode Gelap Investpedia",
    url: "/investpedia-full-dark.png",
    category: "Identitas Brand",
    date: "19 Nov 2026",
  },
];

export default function AdminDashboardPage({
  onBackToDashboard,
  darkMode,
  toggleDarkMode,
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Views: "overview" | "studio" | "curriculum" | "quizzes" | "media" | "settings"
  const [activeView, setActiveView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kontenGroupOpen, setKontenGroupOpen] = useState(true);
  const [pengaturanGroupOpen, setPengaturanGroupOpen] = useState(false);
  const [breadcrumbText, setBreadcrumbText] = useState("Dashboard");

  // Deep-link lesson into "← Edit Materi"
  const [editorTargetLessonId, setEditorTargetLessonId] = useState(null);
  const [hasUnsavedEditorChanges, setHasUnsavedEditorChanges] = useState(false);

  // Data
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
  const [chartPeriod, setChartPeriod] = useState("30d");
  const [toast, setToast] = useState(null);

  // Media Library State (Matches Middle-Right "Media" Screen in Reference)
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaViewLayout, setMediaViewLayout] = useState("grid"); // "grid" | "list"
  const [customMediaItems, setCustomMediaItems] = useState(DEFAULT_MEDIA_ITEMS);
  const mediaUploadInputRef = useRef(null);

  // Settings State (Matches Bottom-Center "Pengaturan Situs" Screen in Reference)
  const [settingsTab, setSettingsTab] = useState("umum"); // "umum" | "seo" | "tampilan"
  const [siteName, setSiteName] = useState("Investpedia");
  const [siteDescription, setSiteDescription] = useState(
    "Platform edukasi pasar modal, analisis fundamental saham IDX80, dan evaluasi pembelajaran terstruktur."
  );
  const [siteLogoUrl, setSiteLogoUrl] = useState("/investpedia-full.png");
  const [passingScore, setPassingScore] = useState(75);
  const logoUploadRef = useRef(null);

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
        const da = new Date(
          a.updatedAt || a.updated_at || a.createdAt || 0
        ).getTime();
        const db = new Date(
          b.updatedAt || b.updated_at || b.createdAt || 0
        ).getTime();
        return db - da;
      })
      .slice(0, 4);
  }, [modules]);

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

  const handleNavigate = (viewId, subTab = null) => {
    if (viewId === "quizzes" && activeView !== "quizzes") {
      setSelectedQuizModuleId("ALL");
    }
    if (subTab) {
      setSettingsTab(subTab);
    }
    setActiveView(viewId);
    setSidebarOpen(false);
    setHasUnsavedEditorChanges(false);

    if (viewId === "overview") setBreadcrumbText("Dashboard");
    if (viewId === "studio") setBreadcrumbText("Konten / Materi Pembelajaran");
    if (viewId === "curriculum") setBreadcrumbText("Konten / Struktur Kurikulum");
    if (viewId === "quizzes") setBreadcrumbText("Konten / Bank Soal Kuis");
    if (viewId === "media") setBreadcrumbText("Media");
    if (viewId === "settings") setBreadcrumbText("Pengaturan");
  };

  const handleOpenModuleQuizzes = (mod) => {
    setSelectedQuizModuleId(mod.id);
    setActiveView("quizzes");
    setKontenGroupOpen(true);
    setBreadcrumbText(`Konten / Bank Soal / ${mod.title || "Modul"}`);
  };

  const handleOpenMaterialInEditor = (lessonId) => {
    setEditorTargetLessonId(lessonId);
    setActiveView("studio");
    setKontenGroupOpen(true);
  };

  const handleUploadNewMedia = (file) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 2.5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const newMedia = {
        id: `media-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, ""),
        url: String(reader.result || ""),
        category: "Ilustrasi Materi",
        date: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      setCustomMediaItems((prev) => [newMedia, ...prev]);
      showToast(`Media "${newMedia.title}" berhasil diunggah.`);
    };
    reader.readAsDataURL(file);
  };

  const filteredMedia = useMemo(() => {
    if (!mediaSearch.trim()) return customMediaItems;
    const q = mediaSearch.trim().toLowerCase();
    return customMediaItems.filter(
      (m) =>
        m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }, [customMediaItems, mediaSearch]);

  const isKontenSubActive = ["studio", "curriculum", "quizzes"].includes(
    activeView
  );

  return (
    <div className="min-h-screen flex bg-[#F4F6FA] dark:bg-[#080808] text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ================================================================
          LEFT SIDEBAR (Deep Navy #181C2E matching Reference Layout!)
          ================================================================ */}
      <aside
        aria-label="Navigasi Administrator"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#181B2C] text-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Brand & Navigation Menu */}
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/investpedia-full-dark.png"
                alt="Investpedia"
                className="h-7 w-auto object-contain select-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup menu navigasi"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5 text-xs sm:text-sm">
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => handleNavigate("overview")}
              className={`w-full px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-3 transition-all cursor-pointer ${
                activeView === "overview"
                  ? "bg-[#E5242A] text-white font-semibold shadow-md shadow-[#E5242A]/25"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* 2. Konten (Collapsible Group matching Reference!) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setKontenGroupOpen((prev) => !prev)}
                className={`w-full px-3.5 py-2.5 rounded-xl font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isKontenSubActive
                    ? "text-white font-semibold bg-white/[0.05]"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Konten</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    kontenGroupOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {kontenGroupOpen && (
                <div className="pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleNavigate("studio")}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeView === "studio"
                        ? "bg-[#E5242A] text-white font-semibold shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Materi Pembelajaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("curriculum")}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeView === "curriculum"
                        ? "bg-[#E5242A] text-white font-semibold shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                    <span>Struktur Kurikulum</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("quizzes")}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeView === "quizzes"
                        ? "bg-[#E5242A] text-white font-semibold shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <FileQuestion className="w-3.5 h-3.5 shrink-0" />
                    <span>Bank Soal Kuis</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Media */}
            <button
              type="button"
              onClick={() => handleNavigate("media")}
              className={`w-full px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-3 transition-all cursor-pointer ${
                activeView === "media"
                  ? "bg-[#E5242A] text-white font-semibold shadow-md shadow-[#E5242A]/25"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Media</span>
            </button>

            {/* 4. Pengaturan (Collapsible Group matching Reference!) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setPengaturanGroupOpen((prev) => !prev);
                  handleNavigate("settings");
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl font-medium flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "settings"
                    ? "bg-[#E5242A] text-white font-semibold shadow-md shadow-[#E5242A]/25"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Pengaturan</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 opacity-80 transition-transform ${
                    pengaturanGroupOpen || activeView === "settings"
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {(pengaturanGroupOpen || activeView === "settings") && (
                <div className="pl-8 space-y-1 text-xs">
                  {[
                    { id: "umum", label: "Umum" },
                    { id: "seo", label: "Standar Kurikulum" },
                    { id: "tampilan", label: "Tampilan" },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleNavigate("settings", sub.id)}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        activeView === "settings" && settingsTab === sub.id
                          ? "text-white font-semibold bg-white/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Admin Profile Card (Matching Reference Sidebar Footer) */}
        <div className="p-4">
          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-200/20 flex items-center justify-center text-white shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name?.split(" ")[0] || "Admin"}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  administrator
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Keluar Sesi"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================================
          MAIN WORKSPACE AREA
          ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar (Bell, Theme Toggle, & "Lihat Situs ↗") */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 bg-[#F4F6FA]/90 dark:bg-[#080808]/90 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="w-9 h-9 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#272727] flex items-center justify-center text-slate-600 dark:text-slate-300 lg:hidden cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              {breadcrumbText}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                showToast("Semua materi & perubahan kurikulum telah tersinkronisasi.")
              }
              aria-label="Notifikasi sistem"
              className="w-9 h-9 rounded-xl bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#272727] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>

            {toggleDarkMode && (
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Ubah tema"
                className="w-9 h-9 rounded-xl bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#272727] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#272727] text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lihat Situs</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-6">
          {/* Toast */}
          {toast && (
            <div
              role="status"
              aria-live="polite"
              className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
                toast.type === "error"
                  ? "bg-rose-50 dark:bg-[#2a0e12] border-rose-200 dark:border-[#4c151c] text-rose-700 dark:text-rose-300"
                  : "bg-emerald-50 dark:bg-[#062c19] border-emerald-200 dark:border-[#0e4429] text-emerald-700 dark:text-emerald-300"
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ==============================================================
              SCREEN 1: DASHBOARD (Matches Top-Left Large Panel in Reference!)
              ============================================================== */}
          {activeView === "overview" && (
            <div className="space-y-6">
              {/* Greeting Header */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Selamat datang kembali, Admin
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Kelola konten dan pengaturan kurikulum Investpedia dengan mudah.
                </p>
              </div>

              {/* 4 Soft Tinted Summary Cards (Matching Reference Colors & Icon Layout!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Modul */}
                <button
                  type="button"
                  onClick={() => handleNavigate("curriculum")}
                  className="p-5 rounded-2xl bg-[#F4F0FF] dark:bg-[#191528] border border-purple-200/50 dark:border-purple-900/30 flex items-center gap-4 text-left hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-2xs shrink-0">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                      Modul Kurikulum
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.totalModules}
                    </span>
                  </div>
                </button>

                {/* Card 2: Materi */}
                <button
                  type="button"
                  onClick={() => handleNavigate("studio")}
                  className="p-5 rounded-2xl bg-[#EAF5FF] dark:bg-[#121e2b] border border-sky-200/50 dark:border-sky-900/30 flex items-center gap-4 text-left hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-sky-600 dark:text-sky-300 shadow-2xs shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                      Materi Terbit
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.publishedModules}
                    </span>
                  </div>
                </button>

                {/* Card 3: Bank Soal */}
                <button
                  type="button"
                  onClick={() => handleNavigate("quizzes")}
                  className="p-5 rounded-2xl bg-[#E9FBF0] dark:bg-[#0f2419] border border-emerald-200/50 dark:border-emerald-900/30 flex items-center gap-4 text-left hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shadow-2xs shrink-0">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                      Bank Soal
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.totalQuizQuestions}
                    </span>
                  </div>
                </button>

                {/* Card 4: Estimasi Menit / Investor */}
                <button
                  type="button"
                  onClick={() => handleNavigate("studio")}
                  className="p-5 rounded-2xl bg-[#FFF7E6] dark:bg-[#261e10] border border-amber-200/50 dark:border-amber-900/30 flex items-center gap-4 text-left hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-amber-600 dark:text-amber-300 shadow-2xs shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                      Menit Belajar
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.totalEstimatedMinutes || 35}
                    </span>
                  </div>
                </button>
              </div>

              {/* Bottom 2-Column Section: "Aktivitas Konten" Chart (Left 7 Cols) + "Aktivitas Terbaru" List (Right 5 Cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: Aktivitas Konten (Smooth Area Line Chart matching Reference!) */}
                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-6 space-y-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Aktivitas Konten
                    </h2>
                    <select
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value)}
                      className="h-8 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <option value="30d">30 hari terakhir</option>
                      <option value="all">Semua Tingkat</option>
                    </select>
                  </div>

                  {/* Smooth Area Curve SVG */}
                  <div className="pt-2">
                    <svg
                      viewBox="0 0 540 210"
                      className="w-full h-48 overflow-visible"
                      aria-label="Grafik Aktivitas Konten"
                    >
                      <defs>
                        <linearGradient
                          id="contentActivityGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#E5242A" stopOpacity="0.24" />
                          <stop offset="100%" stopColor="#E5242A" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines & Y-Axis Labels */}
                      {[
                        { y: 20, label: "20" },
                        { y: 65, label: "15" },
                        { y: 110, label: "10" },
                        { y: 155, label: "5" },
                        { y: 190, label: "0" },
                      ].map((row) => (
                        <g key={row.label}>
                          <text
                            x="0"
                            y={row.y + 4}
                            className="fill-slate-400 text-[11px] font-mono"
                          >
                            {row.label}
                          </text>
                          <line
                            x1="32"
                            y1={row.y}
                            x2="520"
                            y2={row.y}
                            stroke="currentColor"
                            className="text-slate-100 dark:text-[#1f1f1f]"
                            strokeWidth="1"
                          />
                        </g>
                      ))}

                      {/* Area Under Curve */}
                      <path
                        d="M 55 150 C 95 148, 120 152, 150 148 C 185 144, 210 102, 245 102 C 280 102, 305 128, 340 124 C 375 120, 400 72, 435 74 C 465 76, 490 95, 515 55 L 515 190 L 55 190 Z"
                        fill="url(#contentActivityGrad)"
                      />

                      {/* Smooth Line Path */}
                      <path
                        d="M 55 150 C 95 148, 120 152, 150 148 C 185 144, 210 102, 245 102 C 280 102, 305 128, 340 124 C 375 120, 400 72, 435 74 C 465 76, 490 95, 515 55"
                        fill="none"
                        stroke="#E5242A"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                      />

                      {/* Data Dots */}
                      {[
                        { cx: 55, cy: 150, label: "Pemula 1" },
                        { cx: 150, cy: 148, label: "Pemula 2" },
                        { cx: 245, cy: 102, label: "Menengah 1" },
                        { cx: 340, cy: 124, label: "Menengah 2" },
                        { cx: 435, cy: 74, label: "Mahir 1" },
                        { cx: 515, cy: 55, label: "Bank Soal" },
                      ].map((pt, idx) => (
                        <g key={idx}>
                          <circle
                            cx={pt.cx}
                            cy={pt.cy}
                            r="4.5"
                            className="fill-[#E5242A] stroke-white dark:stroke-[#101010]"
                            strokeWidth="2"
                          />
                          <text
                            x={pt.cx}
                            y="208"
                            textAnchor="middle"
                            className="fill-slate-400 text-[10px]"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* RIGHT: Aktivitas Terbaru (Matching Reference Right Card!) */}
                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Aktivitas Terbaru
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleNavigate("studio")}
                      className="text-xs font-semibold text-[#E5242A] hover:underline cursor-pointer"
                    >
                      Lihat semua
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {recentModules.map((mod, idx) => {
                      const iconColors = [
                        "bg-rose-50 text-[#E5242A] dark:bg-rose-950/40",
                        "bg-sky-50 text-sky-600 dark:bg-sky-950/40",
                        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
                        "bg-amber-50 text-amber-600 dark:bg-amber-950/40",
                      ];
                      const updatedStr = mod.updatedAt
                        ? new Date(mod.updatedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Baru saja";

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleNavigate("studio")}
                          className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#161616] flex items-start gap-3.5 text-left transition-colors cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              iconColors[idx % iconColors.length]
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                              Materi &ldquo;{mod.title}&rdquo; diperbarui
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>
                                {LEVEL_META[mod.level]?.label || "Pemula"}
                              </span>
                              <span>•</span>
                              <span>{updatedStr}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              SCREEN 2: MATERI PEMBELAJARAN & ← EDIT MATERI
              ============================================================== */}
          {activeView === "studio" && (
            <LearningContentStudio
              initialLessonId={editorTargetLessonId}
              onClearInitialLessonId={() => setEditorTargetLessonId(null)}
              onOpenModuleQuizzes={handleOpenModuleQuizzes}
              onModulesChanged={loadAdminModules}
              onNotify={showToast}
              onBreadcrumbChange={setBreadcrumbText}
              onUnsavedStateChange={setHasUnsavedEditorChanges}
            />
          )}

          {/* ==============================================================
              SCREEN 3: STRUKTUR KURIKULUM
              ============================================================== */}
          {activeView === "curriculum" && (
            <AdminCurriculumManager
              onOpenMaterialInEditor={handleOpenMaterialInEditor}
              onOpenModuleQuizzes={handleOpenModuleQuizzes}
              onCurriculumChanged={loadAdminModules}
              onNotify={showToast}
              onBreadcrumbChange={setBreadcrumbText}
            />
          )}

          {/* ==============================================================
              SCREEN 4: BANK SOAL KUIS
              ============================================================== */}
          {activeView === "quizzes" && (
            <AdminQuizManagement
              modules={modules}
              selectedModuleId={selectedQuizModuleId}
              onSelectModuleId={setSelectedQuizModuleId}
              onBackToModules={() => handleNavigate("studio")}
              onQuizzesChanged={loadAdminModules}
              onNotify={showToast}
            />
          )}

          {/* ==============================================================
              SCREEN 5: MEDIA (Matches Middle-Right "Media" Screen in Reference!)
              ============================================================== */}
          {activeView === "media" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Media
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Kelola semua file gambar, ilustrasi grafik, dan dokumen materi pembelajaran.
                  </p>
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={() => mediaUploadInputRef.current?.click()}
                    className="h-10 px-4 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Unggah Media</span>
                  </Button>
                  <input
                    ref={mediaUploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadNewMedia(e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-5 space-y-5 shadow-xs">
                {/* Search & Grid/List View Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      placeholder="Cari media..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] focus:outline-none"
                    />
                  </div>

                  <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setMediaViewLayout("grid")}
                      aria-label="Tampilan Grid"
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        mediaViewLayout === "grid"
                          ? "bg-white dark:bg-[#0c0c0c] text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaViewLayout("list")}
                      aria-label="Tampilan Daftar"
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        mediaViewLayout === "list"
                          ? "bg-white dark:bg-[#0c0c0c] text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Media Grid */}
                <div
                  className={
                    mediaViewLayout === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "divide-y divide-slate-100 dark:divide-[#202020]"
                  }
                >
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className={
                        mediaViewLayout === "grid"
                          ? "group rounded-xl border border-slate-200/80 dark:border-[#262626] bg-slate-50/60 dark:bg-[#151515] overflow-hidden flex flex-col justify-between"
                          : "py-3 flex items-center justify-between gap-4"
                      }
                    >
                      <div
                        className={
                          mediaViewLayout === "grid"
                            ? "aspect-[4/3] w-full bg-slate-100 dark:bg-[#1c1c1c] flex items-center justify-center p-4 overflow-hidden"
                            : "w-14 h-14 rounded-xl bg-slate-100 dark:bg-[#1c1c1c] flex items-center justify-center p-2 shrink-0"
                        }
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="p-3 flex items-center justify-between gap-2 flex-1">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.category} • {item.date}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if ( navigator?.clipboard ) {
                              navigator.clipboard.writeText(item.url);
                              showToast("URL gambar disalin ke clipboard.");
                            }
                          }}
                          className="px-2 py-1 rounded text-[11px] font-medium bg-white dark:bg-[#222] border border-slate-200 dark:border-[#333] hover:border-[#E5242A] cursor-pointer shrink-0"
                        >
                          Salin URL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              SCREEN 6: PENGATURAN SITUS (Matches Bottom-Center Screen in Reference!)
              ============================================================== */}
          {activeView === "settings" && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Pengaturan Situs & Kurikulum
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Atur informasi dasar portal edukasi dan standar evaluasi Investpedia.
                </p>
              </div>

              {/* Segmented Pill Tabs: Umum | Standar Kurikulum | Tampilan */}
              <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-[#161616]">
                {[
                  { id: "umum", label: "Umum" },
                  { id: "seo", label: "Standar Kurikulum" },
                  { id: "tampilan", label: "Tampilan" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSettingsTab(tab.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      settingsTab === tab.id
                        ? "bg-[#E5242A] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Card */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Pengaturan portal berhasil disimpan.");
                }}
                className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-6 space-y-5 shadow-xs"
              >
                {settingsTab === "umum" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        Nama Situs
                      </label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl text-sm bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        Deskripsi Situs
                      </label>
                      <textarea
                        rows={3}
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        className="w-full p-3.5 rounded-xl text-sm bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        Logo Situs
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="px-6 py-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] flex items-center justify-center">
                          <img
                            src={siteLogoUrl}
                            alt="Logo Situs"
                            className="h-8 w-auto object-contain"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoUploadRef.current?.click()}
                            className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2a2a2a] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Ganti</span>
                          </button>
                          <input
                            ref={logoUploadRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () =>
                                setSiteLogoUrl(String(reader.result || ""));
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setSiteLogoUrl("/investpedia-full.png")}
                            className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === "seo" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        Ambang Batas Kelulusan Kuis Modul (%)
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl text-sm font-mono bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Seluruh materi berstatus Published otomatis dipecah menjadi segmen pengetahuan (semantic chunks) untuk fitur Learning with AI.
                    </p>
                  </div>
                )}

                {settingsTab === "tampilan" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]">
                      <div>
                        <div className="text-sm font-semibold">Mode Tampilan Portal</div>
                        <div className="text-xs text-slate-500">
                          Sesuaikan tema terang atau gelap pada ruang kerja Anda.
                        </div>
                      </div>
                      {toggleDarkMode && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={toggleDarkMode}
                          className="h-9 px-4 text-xs rounded-xl cursor-pointer"
                        >
                          {darkMode ? "Aktif: Mode Gelap" : "Aktif: Mode Terang"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="h-10 px-6 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white shadow-sm cursor-pointer"
                  >
                    Simpan
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
