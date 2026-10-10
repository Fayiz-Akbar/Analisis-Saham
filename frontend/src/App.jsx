import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Search,
  SlidersHorizontal,
  Bot,
  Newspaper,
  Moon,
  Sun,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    // Check Backend API Health
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") setBackendStatus("connected");
        else setBackendStatus("disconnected");
      })
      .catch(() => setBackendStatus("offline"));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} transition-colors duration-200`}>
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block">InvestAI Analyzer</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1 block">Indeks IDX80 • Skripsi Sub-sistem 1</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Backend Connectivity Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : backendStatus === "checking"
                    ? "bg-amber-500 animate-ping"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-slate-600 dark:text-slate-300">
                Backend: {backendStatus === "connected" ? "Aktif (Port 5000)" : backendStatus === "checking" ? "Mengecek..." : "Offline (Jalankan server)"}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Tema"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl shadow-indigo-950/20">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sprint 1 • Scaffolding & Foundation Ready</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              AI-Powered Fundamental Investment Analyzer
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Platform analisis fundamental dan sentimen pasar modal berbasis <strong>Indeks IDX80</strong> dengan dukungan <strong>Context-Grounded Google Gemini AI</strong>.
            </p>
          </div>
        </section>

        {/* 4 Pillars of Sprint Deliverables */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Cakupan Pengembangan Sub-sistem (Fayiz)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Sprint 1 */}
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase block">Sprint 1</span>
              <h3 className="font-bold text-base">IDX80 & TradingView Chart</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pencarian 80 emiten saham, quote harga real-time, data candlestick historis OHLCV, dan ringkasan dashboard.
              </p>
            </div>

            {/* Sprint 2 */}
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase block">Sprint 2</span>
              <h3 className="font-bold text-base">Screener & Komparasi Saham</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Filter multi-indikator 4 pilar fundamental (PER, PBV, ROE, DER) dan visualisasi komparasi 2–4 emiten berdampingan.
              </p>
            </div>

            {/* Sprint 3 */}
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Newspaper className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wider uppercase block">Sprint 3</span>
              <h3 className="font-bold text-base">Sentimen & Pasar Global</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Agregasi berita berlabel sentimen [Positif]/[Netral]/[Negatif], serta pemantauan indeks dunia dan komoditas.
              </p>
            </div>

            {/* Sprint 4 */}
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wider uppercase block">Sprint 4</span>
              <h3 className="font-bold text-base">Grounded AI Copilot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Asisten AI Gemini berbasis data faktual anti-halusinasi dengan mode profil Pemula vs Berpengalaman dan evaluasi skripsi.
              </p>
            </div>
          </div>
        </section>

        {/* System Stack Verification Box */}
        <section className="p-6 rounded-2xl border bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Spesifikasi Lingkungan Terverifikasi (Tabel 5 & 6 Naskah Skripsi)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Runtime</span>
              <span className="font-semibold">Node.js (LTS)</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Backend</span>
              <span className="font-semibold">Express.js (ES6+)</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Frontend</span>
              <span className="font-semibold">React.js + Tailwind</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Database</span>
              <span className="font-semibold">PostgreSQL 17</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">ORM</span>
              <span className="font-semibold">Prisma ORM</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Charts</span>
              <span className="font-semibold">TradingView + Recharts</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
