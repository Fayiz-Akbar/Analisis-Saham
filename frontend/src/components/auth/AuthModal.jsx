import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AuthModal({ onNavigateToAdmin }) {
  const { authModalMode, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [investorProfile, setInvestorProfile] = useState("BEGINNER");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setErrorMessage("");
      setFieldErrors({});
    }
  }, [authModalMode]);

  if (!authModalMode) return null;

  const resetMessages = () => {
    setErrorMessage("");
    setFieldErrors({});
  };

  const handleQuickFill = (demoEmail) => {
    resetMessages();
    setMode("login");
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (mode === "register") {
      if (password !== confirmPassword) {
        setFieldErrors({ confirmPassword: "Konfirmasi password tidak cocok" });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password, investorProfile });
      }
      closeAuthModal();
    } catch (err) {
      setErrorMessage(err.message || "Gagal memproses autentikasi.");
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        for (const item of err.details) {
          if (item.field) mapped[item.field] = item.message;
        }
        setFieldErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white/10 border border-slate-800 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {mode === "login" ? "Masuk ke Akun InvestAI" : "Daftar Akun Investor"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autentikasi berbasis JWT • Role-Based Access Control
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Switcher Login / Register */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#080808] border border-slate-200 dark:border-slate-800/90">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                resetMessages();
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                resetMessages();
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Firman Farel"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                />
              </div>
              {fieldErrors.name && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.name}</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
              />
            </div>
            {fieldErrors.email && (
              <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min. 8 karakter (huruf & angka)" : "Masukkan kata sandi"}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
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
            {fieldErrors.password && (
              <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.password}</span>
            )}
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Profil Pengalaman Investor
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "BEGINNER", label: "Pemula", sub: "Baru mengenal saham" },
                    { id: "EXPERIENCED", label: "Berpengalaman", sub: "Terbiasa analisis rasio" },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setInvestorProfile(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        investorProfile === opt.id
                          ? "border-emerald-500/60 bg-emerald-500/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080808] text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-xs font-bold block">{opt.label}</span>
                      <span className="text-[10px] opacity-80 block">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {isSubmitting
              ? "Memproses..."
              : mode === "login"
                ? "Masuk Sekarang"
                : "Buat Akun Investor"}
          </button>

          {/* Pintasan Akun Demo untuk Pengujian Cepat */}
          {mode === "login" && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Akun Demo Pengujian Cepat:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill("fayiz.pemula@example.com")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  Investor Pemula
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("fayiz.expert@example.com")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  Investor Expert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    if (onNavigateToAdmin) onNavigateToAdmin();
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Portal Admin →
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

