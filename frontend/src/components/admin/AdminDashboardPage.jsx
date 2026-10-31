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
          showToast("Sesi administrator aktif.", "success");
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
    <div className="space-y-5 pb-12">
      {/* Notifikasi Umpan Balik Aksi CRUD (Flat Hairline Alert) */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold transition-all ${
            toast.type === "error"
              ? "bg-rose-50 dark:bg-[#2a0e12] border-rose-200 dark:border-[#4c151c] text-rose-800 dark:text-[#f87171]"
              : "bg-emerald-50 dark:bg-[#062c19] border-emerald-200 dark:border-[#0e4429] text-emerald-800 dark:text-[#34d399]"
          }`}
        >
          <div className="flex items-center gap-2">
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
            className="opacity-70 hover:opacity-100 cursor-pointer p-0.5"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Portal Administrator (Clean Financial Terminal) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1a1f2c] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: ADMINISTRATOR
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {user?.email}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            PORTAL ADMINISTRATOR: Manajemen Kurikulum & Kuis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Kelola materi kurikulum pasar modal 3 jenjang, status publikasi, urutan tampil, serta bank soal kuis deterministik dan pemetaan indikator materi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#151822] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2330] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ke Sistem Utama
            </button>
          )}

          <button
            type="button"
            onClick={loadAdminModules}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#151822] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2330] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-rose-700 dark:text-[#f87171] hover:bg-rose-100 dark:hover:bg-[#3d131a] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sesi
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Kurikulum (Clean Flat Surface, Monospace Tabular) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Total Modul Materi</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalModules} <span className="text-xs font-medium text-slate-400">Modul</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-[#34d399] font-bold">
              {stats.publishedModules} Terbit
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {stats.draftModules} Draft
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Distribusi 3 Jenjang</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-[#062c19]/70 border border-emerald-200 dark:border-[#0e4429] text-emerald-700 dark:text-[#34d399] font-mono text-xs font-bold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stats.modulesByLevel?.BEGINNER ?? 0}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-[#0c2340]/70 border border-blue-200 dark:border-[#1e3a8a] text-blue-700 dark:text-[#60a5fa] font-mono text-xs font-bold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {stats.modulesByLevel?.INTERMEDIATE ?? 0}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-[#2a0e12]/70 border border-rose-200 dark:border-[#4c151c] text-rose-700 dark:text-[#f87171] font-mono text-xs font-bold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {stats.modulesByLevel?.ADVANCED ?? 0}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Pemula • Menengah • Mahir
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Bank Soal Kuis</span>
            <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalQuizQuestions} <span className="text-xs font-medium text-slate-400">Butir</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Kunci deterministik A–D & indikator materi
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Durasi Kurikulum</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalEstimatedMinutes} <span className="text-xs font-medium text-slate-400">Menit</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {stats.totalInvestors} Akun Investor Terdaftar
          </div>
        </div>
      </div>

      {/* Segmented Tab Switcher (Linear Style) */}
      <div className="border-b border-slate-200 dark:border-[#272727] pb-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveAdminTab("modules")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === "modules"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Materi Pembelajaran ({stats.totalModules})
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab("quizzes")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === "quizzes"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Bank Soal Kuis ({stats.totalQuizQuestions})
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
