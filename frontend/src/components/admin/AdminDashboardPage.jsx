import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileQuestion,
  Layers,
  LogOut,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../services/apiClient";
import AdminLoginPage from "./AdminLoginPage";
import AdminModuleManagement from "./AdminModuleManagement";
import AdminQuizManagement from "./AdminQuizManagement";

export default function AdminDashboardPage({ onBackToDashboard }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState("modules"); // "modules" | "quizzes"
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
  const [selectedQuizModuleId, setSelectedQuizModuleId] = useState(null);
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
        if (prev && loadedModules.some((m) => m.id === prev)) return prev;
        return loadedModules[0]?.id || null;
      });
    } catch (err) {
      showToast(err.message || "Gagal memuat data kurikulum administrator.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, showToast]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAdminModules();
    }
  }, [isAuthenticated, isAdmin, loadAdminModules]);

  // Jika belum login sebagai ADMIN, tampilkan gerbang autentikasi AdminLoginPage (RBAC Gate)
  if (!isAuthenticated || !isAdmin) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          showToast("Selamat datang di Portal Administrator InvestAI.", "success");
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // Handlers CRUD Modul
  const handleCreateModule = async (payload) => {
    const res = await adminApi.createModule(payload);
    showToast(`Modul "${res?.data?.module?.title || payload.title}" berhasil ditambahkan.`, "success");
    await loadAdminModules();
  };

  const handleUpdateModule = async (id, payload) => {
    const res = await adminApi.updateModule(id, payload);
    showToast(`Modul "${res?.data?.module?.title || "Materi"}" berhasil diperbarui.`, "success");
    await loadAdminModules();
  };

  const handleDeleteModule = async (id) => {
    const res = await adminApi.deleteModule(id);
    showToast(res?.message || "Modul pembelajaran berhasil dihapus.", "success");
    await loadAdminModules();
  };

  const handleOpenModuleQuizzes = (mod) => {
    setSelectedQuizModuleId(mod.id);
    setActiveAdminTab("quizzes");
  };

  return (
    <div className="space-y-6">
      {/* Notifikasi Umpan Balik Aksi CRUD */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold shadow-lg transition-all ${
            toast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-200"
              : "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Portal Administrator (Sesuai Layar 12 STITCH_PROTOTYPE_EDUKASI_SIMULASI.md) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: ADMINISTRATOR
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {user?.email}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            PORTAL ADMINISTRATOR: Manajemen Kurikulum & Kuis Evaluasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
            Kelola materi pembelajaran investasi saham 3 level (Pemula, Menengah, Mahir), urutan tampil kurikulum, status publikasi, serta instrumen bank soal kuis deterministik dan pemetaan indikator konsep materi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ke Dashboard Utama
            </button>
          )}

          <button
            type="button"
            onClick={loadAdminModules}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Admin
          </button>
        </div>
      </div>

      {/* 4 Kartu Ringkasan Metrik Kurikulum (Tabular Monospace) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Modul Materi
            </span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalModules} Modul
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {stats.publishedModules} Published
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {stats.draftModules} Draft
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Distribusi 3 Jenjang
            </span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              🟢 {stats.modulesByLevel?.BEGINNER ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
              🟡 {stats.modulesByLevel?.INTERMEDIATE ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold">
              🔴 {stats.modulesByLevel?.ADVANCED ?? 0}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Pemula • Menengah • Mahir
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bank Soal Kuis Evaluasi
            </span>
            <FileQuestion className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalQuizQuestions} Butir Soal
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Kunci deterministik A–D & indikator LLM
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Durasi Baca & Investor
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalEstimatedMinutes} Menit
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Total durasi kurikulum • {stats.totalInvestors} Akun Investor
          </div>
        </div>
      </div>

      {/* Tab Navigasi Utama Portal Admin (Sesuai Wireframe Layar 12) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#272727] pb-4">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800/90">
          <button
            type="button"
            onClick={() => setActiveAdminTab("modules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === "modules"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Kelola Materi Pembelajaran ({stats.totalModules})
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab("quizzes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === "quizzes"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            Kelola Bank Soal Kuis ({stats.totalQuizQuestions})
          </button>
        </div>
      </div>

      {/* Konten Tab Aktif */}
      {activeAdminTab === "modules" ? (
        <AdminModuleManagement
          modules={modules}
          isLoading={isLoading}
          onCreateModule={handleCreateModule}
          onUpdateModule={handleUpdateModule}
          onDeleteModule={handleDeleteModule}
          onOpenModuleQuizzes={handleOpenModuleQuizzes}
        />
      ) : (
        <AdminQuizManagement
          modules={modules}
          selectedModuleId={selectedQuizModuleId}
          onSelectModuleId={setSelectedQuizModuleId}
          onQuizzesChanged={loadAdminModules}
          onNotify={showToast}
        />
      )}
    </div>
  );
}

