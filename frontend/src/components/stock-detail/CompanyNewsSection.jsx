import React, { useState, useEffect } from "react";
import { Clock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { PublisherLogo, SentimentLabel } from "../dashboard/LatestNewsSection";

/**
 * Berita Emiten & Klasifikasi Sentimen
 * Mengikuti referensi visual:
 * - Foto artikel di bagian atas dengan badge sumber & badge sentimen overlay
 * - Badge positif: latar hijau hutan gelap (#062c19) dengan teks/ikon hijau mint (#2fe695)
 * - Badge netral: latar gelap netral dengan teks abu-abu
 * - Badge negatif: latar merah tua (#2a0e12) dengan teks merah muda (#f87171)
 * - Badan kartu: latar hitam (#0c0e14), teks putih, ringkasan slate, footer waktu & link "Baca Berita →"
 * - Tanpa box-shadow, flat border minimalis.
 */
export default function CompanyNewsSection({ symbol, companyName }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSentimentFilter, setActiveSentimentFilter] = useState("ALL");

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/stocks/${symbol}/news?limit=9`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNews(json.data);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error("Gagal memuat berita emiten:", err);
      setError("Tidak dapat memuat arus berita terkini dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [symbol]);

  // Format Waktu Relatif ringkas (e.g. "6 mnt lalu", "2 jam lalu", "1 hari lalu")
  const formatPublishedTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 60 && diffMins >= 0) {
      return `${Math.max(1, diffMins)} mnt lalu`;
    }
    if (diffHours < 24 && diffHours >= 0) {
      return `${diffHours} jam lalu`;
    }
    if (diffDays < 7 && diffDays >= 0) {
      return `${diffDays} hari lalu`;
    }

    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${day} ${months[date.getMonth()]}`;
  };

  // Filter daftar berita
  const filteredNews = news.filter((item) => {
    if (activeSentimentFilter === "ALL") return true;
    const s = (item.sentiment || "neutral").toLowerCase();
    if (activeSentimentFilter === "POSITIVE") return s === "positive" || s === "positif";
    if (activeSentimentFilter === "NEUTRAL") return s === "neutral" || s === "netral";
    if (activeSentimentFilter === "NEGATIVE") return s === "negative" || s === "negatif";
    return true;
  });

  const countPositive = news.filter((n) => (n.sentiment || "").toLowerCase().includes("pos")).length;
  const countNeutral = news.filter((n) => (n.sentiment || "").toLowerCase().includes("neu")).length;
  const countNegative = news.filter((n) => (n.sentiment || "").toLowerCase().includes("neg")).length;

  return (
    <div className="space-y-4">
      {/* Header Bagian Berita */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Berita Emiten & Analisis Sentimen
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arus berita terkini terkait {symbol} ({companyName}) dengan klasifikasi sentimen pasar.
          </p>
        </div>

        {/* Filter Tombol Sentimen */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSentimentFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              activeSentimentFilter === "ALL"
                ? "bg-white text-slate-950 dark:bg-slate-100 dark:text-slate-950 border-transparent"
                : "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            Semua ({news.length})
          </button>
          <button
            onClick={() => setActiveSentimentFilter("POSITIVE")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              activeSentimentFilter === "POSITIVE"
                ? "bg-[#062c19] text-[#2fe695] border-[#0e4429]"
                : "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-[#062c19]/30"
            }`}
          >
            Positif ({countPositive})
          </button>
          <button
            onClick={() => setActiveSentimentFilter("NEUTRAL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              activeSentimentFilter === "NEUTRAL"
                ? "bg-slate-800 text-slate-200 border-slate-600"
                : "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-800/60"
            }`}
          >
            Netral ({countNeutral})
          </button>
          <button
            onClick={() => setActiveSentimentFilter("NEGATIVE")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              activeSentimentFilter === "NEGATIVE"
                ? "bg-[#2a0e12] text-[#f87171] border-[#4c151c]"
                : "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-[#2a0e12]/30"
            }`}
          >
            Negatif ({countNegative})
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800/60"></div>
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
                <div className="h-8 bg-slate-100 dark:bg-slate-800/40 rounded-md w-full"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800/30 rounded-md w-1/3 pt-2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
          <button
            onClick={fetchNews}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat Ulang
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredNews.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] text-slate-500 text-xs">
          Tidak ada berita dengan filter ini untuk emiten {symbol}.
        </div>
      )}

      {/* Grid Kartu Berita Sesuai Foto Referensi */}
      {!isLoading && !error && filteredNews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((item) => {
            const sentiment = (item.sentiment || "neutral").toLowerCase();
            const isPos = sentiment === "positive" || sentiment === "positif";
            const isNeg = sentiment === "negative" || sentiment === "negatif";

            return (
              <article
                key={item.id}
                className="group flex flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] overflow-hidden hover:border-slate-400 dark:hover:border-white/25 transition-colors"
              >
                {/* 1. Gambar Artikel Full Bleed di Bagian Atas */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <img
                    src={
                      item.imageUrl ||
                      "https://foto.kontan.co.id/IiOs-O1hRpgtIi4fFQeI_TpN_cQ=/smart/2025/05/27/15854717p.jpg"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                    onError={(e) => {
                      e.target.src =
                        "https://foto.kontan.co.id/IiOs-O1hRpgtIi4fFQeI_TpN_cQ=/smart/2025/05/27/15854717p.jpg";
                    }}
                  />

                  {/* Overlay Gradient Halus */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none"></div>

                  {/* Badge Sumber di Pojok Kiri Atas dengan Logo Penerbit */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs border border-white/10 select-none">
                    <PublisherLogo source={item.source} className="w-3.5 h-3.5" />
                    <span className="text-white text-[10px] font-semibold">
                      {item.source || "Media Finansial"}
                    </span>
                  </div>

                  {/* Sentimen di Pojok Kanan Atas Sesuai Foto 2 (Tanpa Container Background) */}
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10">
                    <SentimentLabel sentiment={item.sentiment} />
                  </div>

                  {/* Badge Ticker di Pojok Kiri Bawah (Jika ada emiten spesifik) */}
                  {item.symbol && item.symbol !== "IHSG" && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-bold text-[10px] tracking-wide border border-white/20 select-none">
                      {item.symbol}
                    </span>
                  )}
                </div>

                {/* 2. Isi Berita: Judul, Ringkasan, & Footer */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    {/* Judul Berita (Monokrom Hitam / Putih, Tanpa Hover Hijau) */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug transition-colors">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    </h3>

                    {/* Ringkasan Berita */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.description || item.title}
                    </p>
                  </div>

                  {/* Baris Bawah: Waktu & Tombol Baca Berita */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatPublishedTime(item.published_at)}
                    </span>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-xs text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Baca Berita</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
