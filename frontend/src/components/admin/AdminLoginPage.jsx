import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-3 sm:px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#101010]">
        {/* Panel Kiri: Informasi Otorisasi RBAC & Penjelasan Fitur */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900 dark:bg-[#0c0e14] border-b lg:border-b-0 lg:border-r border-slate-800 dark:border-[#272727] flex flex-col justify-between text-white">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              RBAC Protected Portal
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                Portal Administrator Kurikulum & Evaluasi
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Antarmuka khusus pengelola sistem untuk memelihara materi pasar modal 3 jenjang serta bank soal kuis deterministik dan indikator konsep.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-xs font-bold text-white block">
                  Manajemen Kurikulum Materi (PB-12)
                </span>
                <span className="text-[11px] text-slate-400 leading-relaxed block">
                  Kelola judul, slug URL, tingkat kesulitan (Pemula, Menengah, Mahir), estimasi baca, urutan tampil, dan status terbit.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-xs font-bold text-white block">
                  Manajemen Bank Soal & Kunci Kuis (PB-13)
                </span>
                <span className="text-[11px] text-slate-400 leading-relaxed block">
                  Pilihan ganda A–D, penetapan kunci jawaban resmi deterministik, teks pembahasan, serta pemetaan indikator materi.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Middleware: verifyAdmin (JWT)</span>
            <span className="text-slate-300 font-bold">KNF-01 • KF-16</span>
          </div>
        </div>

        {/* Panel Kanan: Form Autentikasi Administrator */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-mono">
                  Otorisasi Administrator
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Masuk ke Portal Manajemen Konten
                </h2>
              </div>

              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#151822] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2330] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Sistem Utama
                </button>
              )}
            </div>

            {/* Peringatan RBAC jika saat ini sedang login sebagai INVESTOR */}
            {isAuthenticated && !isAdmin && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-[#261c0c] border border-amber-200 dark:border-[#523d18] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    Akses Dibatasi (RBAC Role: INVESTOR)
                  </div>
                  <p className="text-amber-800/90 dark:text-amber-200/80 leading-relaxed text-[11px]">
                    Anda saat ini masuk sebagai <span className="font-mono font-bold">{user?.email}</span> (Investor). Akses modul admin memerlukan hak akses <span className="font-mono font-bold">ADMIN</span>.
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer pt-0.5"
                  >
                    Keluar dari sesi Investor saat ini
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] flex items-start gap-2.5 text-xs text-rose-700 dark:text-[#f87171] font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Administrator
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin.investai@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Administrator
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi administrator"
                    className="w-full pl-9 pr-9 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
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
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isSubmitting ? "Memverifikasi..." : "Masuk ke Portal Administrator"}
              </button>
            </form>
          </div>

          {/* Kredensial Demo Seeder */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#272727]">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
                  Kredensial Administrator Seeder:
                </span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Email: <strong className="text-slate-800 dark:text-white">admin.investai@example.com</strong> • Pass:{" "}
                  <strong className="text-slate-800 dark:text-white">Password123!</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                Isi Otomatis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
