import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
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
  const [justAutoFilled, setJustAutoFilled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setIsSubmitting(true);
      const adminUser = await loginAdmin({ email, password });
      if (onLoginSuccess) onLoginSuccess(adminUser);
    } catch (err) {
      setErrorMessage(
        err.message || "Kredensial tidak valid. Periksa email dan password administrator Anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setErrorMessage("");
    setEmail("admin.investai@example.com");
    setPassword("Password123!");
    setJustAutoFilled(true);
    setTimeout(() => setJustAutoFilled(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow & subtle grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.08),rgba(99,102,241,0.05)_40%,transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c1017]/95 backdrop-blur-xl shadow-2xl shadow-black/70 ring-1 ring-white/[0.04] relative z-10">
        
        {/* Panel Kiri: Institutional Authority & System Governance */}
        <div className="lg:col-span-5 p-7 sm:p-9 bg-gradient-to-b from-[#111723] via-[#0d121c] to-[#090d14] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle accent blur in corner */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Investpedia Security Core</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Portal Administrator Kurikulum & Evaluasi
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Konsol otoritas terpadu untuk tata kelola modul edukasi pasar modal 3 jenjang, bank soal evaluasi deterministik, dan parameter analitik platform.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-100 block">
                    Manajemen Modul & Kurikulum
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Susun kurikulum 3 jenjang kompetensi (Pemula, Menengah, Mahir) dengan kalkulasi estimasi baca deterministik.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-100 block">
                    Bank Soal & Kunci Evaluasi
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Penyusunan butir soal pilihan ganda, penetapan kunci jawaban resmi deterministik, serta pemetaan konsep materi.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Info */}
          <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Protokol JWT HS256
            </span>
            <span className="font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Role: SYSTEM ADMIN
            </span>
          </div>
        </div>

        {/* Panel Kanan: Form Autentikasi Administrator */}
        <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between bg-[#0e121a] relative">
          <div className="space-y-5">
            {/* Header Form */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase block">
                  Otorisasi Pengelola
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                  Masuk ke Portal Administrator
                </h2>
              </div>

              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Peringatan RBAC jika saat ini sedang login sebagai INVESTOR */}
            {isAuthenticated && !isAdmin && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs space-y-1">
                  <div className="font-semibold text-amber-300">
                    Sesi Investor Terdeteksi ({user?.email})
                  </div>
                  <p className="text-amber-200/80 leading-relaxed text-[11px]">
                    Anda sedang masuk dengan hak akses Investor. Masuk dengan akun Administrator untuk mengelola kurikulum dan bank soal.
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline cursor-pointer mt-1"
                  >
                    Keluar dari sesi Investor saat ini
                  </button>
                </div>
              </div>
            )}

            {/* Pesan Kesalahan Autentikasi */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 font-medium animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Administrator
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin.investai@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-[#131722] border border-white/10 hover:border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata Sandi Administrator
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium bg-[#131722] border border-white/10 hover:border-white/20 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Memverifikasi Otoritas Administrator...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-slate-950" />
                    <span>Masuk ke Portal Administrator</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Kredensial Pengujian Administrator (Seeder)
                </span>
                <div className="text-[11px] text-slate-400 font-mono tracking-tight">
                  <span className="text-slate-500">Email:</span>{" "}
                  <strong className="text-slate-200 font-semibold">admin.investai@example.com</strong>
                  <span className="mx-1.5 text-slate-600">/</span>
                  <span className="text-slate-500">Pass:</span>{" "}
                  <strong className="text-slate-200 font-semibold">Password123!</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
              >
                {justAutoFilled ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Isi Otomatis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
