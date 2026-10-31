import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileQuestion,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLoginPage({ onLoginSuccess, onBackToDashboard }) {
  const { user, isAuthenticated, isAdmin, loginAdmin, logout } = useAuth();

  const [email, setEmail] = useState("admin.investai@example.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setIsSubmitting(true);
      const adminUser = await loginAdmin({ email, password });
      if (onLoginSuccess) onLoginSuccess(adminUser);
    } catch (err) {
      setErrorMessage(
        err.message || "Gagal masuk ke Portal Administrator. Periksa kredensial Anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setErrorMessage("");
    setEmail("admin.investai@example.com");
    setPassword("Password123!");
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center py-8 px-3 sm:px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#101010] shadow-2xl">
        {/* Panel Kiri: Informasi Otorisasi RBAC & Ruang Lingkup Portal Admin */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900 dark:bg-[#12151e] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC Protected Portal
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
                Portal Administrator Kurikulum & Evaluasi
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Antarmuka khusus pengelola sistem untuk memelihara modul pembelajaran pasar modal 3 jenjang serta bank soal kuis deterministik dan indikator konsep LLM.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-slate-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Manajemen Modul Pembelajaran (PB-12)
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    Kelola judul, slug unik, tingkat kesulitan (Pemula, Menengah, Mahir), urutan tampil, estimasi baca, dan status publikasi.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-slate-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Manajemen Bank Soal & Kunci Kuis (PB-13)
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    Susun soal pilihan ganda A–D, tetapkan kunci jawaban resmi deterministik, pembahasan resmi, serta indikator konsep materi.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>Middleware: verifyAdmin (JWT)</span>
            <span className="font-mono text-emerald-400 font-bold">KNF-01 • KF-01 • KF-16</span>
          </div>
        </div>

        {/* Panel Kanan: Form Autentikasi Administrator */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  Otorisasi Administrator
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Masuk ke Portal Manajemen Konten
                </h2>
              </div>

              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Peringatan RBAC jika saat ini sedang login sebagai INVESTOR */}
            {isAuthenticated && !isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs space-y-1.5">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    Akses Dibatasi (RBAC Role: INVESTOR)
                  </div>
                  <p className="text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
                    Anda saat ini masuk sebagai <span className="font-mono font-bold">{user?.email}</span> dengan peran{" "}
                    <span className="font-mono font-bold">INVESTOR</span>. Sesuai aturan keamanan{" "}
                    <span className="font-mono font-bold">KNF-01</span>, hanya akun berhak akses{" "}
                    <span className="font-mono font-bold">ADMIN</span> yang diizinkan mengelola modul materi dan kunci jawaban kuis.
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer"
                  >
                    Keluar dari sesi Investor saat ini
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Administrator
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin.investai@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kata Sandi Administrator
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi administrator"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-white text-slate-950 border border-slate-300 dark:border-transparent hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {isSubmitting ? "Memverifikasi Hak Akses ADMIN..." : "Masuk ke Portal Administrator"}
              </button>
            </form>
          </div>

          {/* Box Kredensial Demo Pengujian Langsung */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12151e]/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Kredensial Akun Administrator Terdaftar (Seeder):
                </span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Email: <strong className="text-slate-800 dark:text-white">admin.investai@example.com</strong> • Pass:{" "}
                  <strong className="text-slate-800 dark:text-white">Password123!</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Isi Otomatis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

