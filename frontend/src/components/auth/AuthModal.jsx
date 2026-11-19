import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4.5 bg-slate-50 dark:bg-[#0c0e14] border-b border-slate-200 dark:border-[#272727] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#161922] flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {mode === "login" ? "Masuk ke Akun InvestAI" : "Daftar Akun Investor"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autentikasi berbasis JWT • Role-Based Access Control
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1a1d26] border border-transparent hover:border-slate-300 dark:hover:border-[#333333] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Switcher Login / Register */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-[#272727]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                resetMessages();
              }}
              className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white dark:bg-[#1a1d26] text-slate-900 dark:text-white border border-slate-200 dark:border-[#333333]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
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
              className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white dark:bg-[#1a1d26] text-slate-900 dark:text-white border border-slate-200 dark:border-[#333333]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-[#2a0e12]/60 border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-rose-300 font-medium">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
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
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
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
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        investorProfile === opt.id
                          ? "border-[#0e4429] bg-[#062c19] text-[#34d399]"
                          : "border-slate-200 dark:border-[#272727] bg-slate-50 dark:bg-[#0c0e14] text-slate-500 dark:text-slate-400"
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
            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting
              ? "Memproses..."
              : mode === "login"
                ? "Masuk Sekarang"
                : "Buat Akun Investor"}
          </button>

          {/* Pintasan Akun Demo untuk Pengujian Cepat */}
          {mode === "login" && (
            <div className="pt-3 border-t border-slate-200 dark:border-[#272727] space-y-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                Akun Demo Pengujian:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill("fayiz.pemula@example.com")}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#062c19] text-[#34d399] border border-[#0e4429] hover:bg-[#0e4429]/60 transition-colors cursor-pointer"
                >
                  Investor Pemula
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("fayiz.expert@example.com")}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-[#1a1d26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#272727] hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer"
                >
                  Investor Expert
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
