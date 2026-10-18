import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  X,
  Search,
  RefreshCw,
  Newspaper,
  ExternalLink,
} from "lucide-react";

/**
 * Fallback topic image jika foto berita gagal dimuat
 */
const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80";

/**
 * Format waktu publikasi relatif (contoh: "15 mnt lalu", "2 jam lalu", "Kemarin")
 */
function formatTimeAgo(dateString) {
  if (!dateString) return "Baru saja";
  try {
    const published = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - published.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return published.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Baru saja";
  }
}

/**
 * Badge sentimen polaritas (Hijau Positif, Abu-abu Netral, Merah Negatif)
 * Menggunakan glassmorphism pill agar kontras dan elegan di atas foto berita.
 */
function SentimentBadge({ sentiment, isOverlay = false }) {
  const norm = (sentiment || "neutral").toLowerCase();

  if (norm === "positive" || norm === "positif") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm transition-transform ${
          isOverlay
            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md"
            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50"
        }`}
      >
        <TrendingUp className="w-3 h-3 stroke-[2.5]" />
        <span>Positif</span>
      </span>
    );
  }

  if (norm === "negative" || norm === "negatif") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm transition-transform ${
          isOverlay
            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md"
            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/50"
        }`}
      >
        <TrendingDown className="w-3 h-3 stroke-[2.5]" />
        <span>Negatif</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm transition-transform ${
        isOverlay
          ? "bg-slate-900/80 text-slate-200 border border-slate-600/50 backdrop-blur-md"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
      }`}
    >
      <Minus className="w-3 h-3 stroke-[2.5]" />
      <span>Netral</span>
    </span>
  );
}

export default function LatestNewsSection({ className = "" }) {
  const [news, setNews] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNewsData = async (limit = 6) => {
    try {
      const res = await fetch(`http://localhost:5000/api/news/latest?limit=${limit}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.warn("Gagal mengambil data berita:", err.message);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchNewsData(6).then((data) => {
      if (isMounted) {
        setNews(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await fetchNewsData(6);
    setNews(data);
    setIsRefreshing(false);
  };

  const handleOpenAllModal = async () => {
    setShowAllModal(true);
    if (allNews.length === 0) {
      const fullData = await fetchNewsData(30);
      setAllNews(fullData);
    }
  };

  // Filter berita di dalam Modal "Lihat Semua"
  const modalFilteredNews = allNews.filter((item) => {
    const matchesSentiment =
      selectedSentiment === "all" ||
      (item.sentiment || "").toLowerCase() === selectedSentiment;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.source || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.symbol || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSentiment && matchesSearch;
  });

  return (
    <section
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className={`space-y-4 ${className}`}
    >
      {/* Header Bagian: Judul, Deskripsi & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Arus Berita Finansial Terkini
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Daftar ringkasan artikel berita keuangan dan emiten terbaru dengan foto, rangkuman, dan label polaritas sentimen.
          </p>
        </div>

        {/* Tombol Refresh & Tombol "Lihat Semua" */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
            title="Muat Ulang Berita"
            aria-label="Muat Ulang Berita"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenAllModal}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white flex items-center gap-1.5 transition-all shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Grid Kartu Berita Format Showcase (Sesuai Referensi Desain Pengguna) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12151e] overflow-hidden animate-pulse flex flex-col"
              >
                {/* Skeleton Gambar */}
                <div className="aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800" />
                {/* Skeleton Konten */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-3/5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mt-3" />
                    <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            ))
          : news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#141721] overflow-hidden shadow-2xs hover:shadow-xl dark:hover:shadow-indigo-950/30 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none"
              >
                {/* Bagian Atas: Foto / Thumbnail Berita dengan Overlay Badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/60">
                  <img
                    src={item.imageUrl || DEFAULT_FALLBACK_IMAGE}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Gradient Overlay Halus */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/40 pointer-events-none" />

                  {/* Badge Sumber Media (Pojok Kiri Atas) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/65 backdrop-blur-md text-white border border-white/15 shadow-sm">
                      {item.source}
                    </span>
                  </div>

                  {/* Badge Sentimen Polaritas (Pojok Kanan Atas) */}
                  <div className="absolute top-3 right-3">
                    <SentimentBadge sentiment={item.sentiment} isOverlay={true} />
                  </div>

                  {/* Ticker Saham (Pojok Kiri Bawah Gambar, jika ada) */}
                  {item.symbol && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-600/90 backdrop-blur-md text-white border border-indigo-400/30 uppercase shadow-xs">
                        {item.symbol}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bagian Bawah: Judul Berita, Rangkuman Teks & Tombol Aksi */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-white dark:bg-[#141721]">
                  <div>
                    {/* Judul Berita */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug tracking-tight mb-2.5">
                      {item.title}
                    </h3>

                    {/* Ringkasan Berita (Excerpt / Snippet) */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
                      {item.description || item.title}
                    </p>
                  </div>

                  {/* Footer Kartu: Waktu Publikasi & Aksi Baca Berita */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.published_at)}</span>
                    </span>

                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                      <span>Baca Berita</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
      </div>

      {/* ========================================================
          MODAL "LIHAT SEMUA" BERITA KEUANGAN TERKINI
          ======================================================== */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            className="w-full max-w-5xl max-h-[88vh] bg-white dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-indigo-500" />
                  <span>Seluruh Arus Berita Finansial</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Katalog lengkap berita pasar modal BEI dan emiten IDX80 dengan foto artikel dan analisis sentimen.
                </p>
              </div>

              <button
                onClick={() => setShowAllModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center gap-3">
              {/* Filter Tabs Sentimen */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800/90 p-1 rounded-xl self-stretch sm:self-auto">
                {[
                  { id: "all", label: "Semua" },
                  { id: "positive", label: "Positif" },
                  { id: "neutral", label: "Netral" },
                  { id: "negative", label: "Negatif" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSentiment(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSentiment === tab.id
                        ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Input Pencarian */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik berita, emiten, atau media..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Konten Daftar Berita di Modal (Grid 2 Kolom dengan Foto) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {modalFilteredNews.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Tidak ada berita yang cocok dengan filter pencarian.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modalFilteredNews.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 hover:bg-white dark:bg-[#151824] dark:hover:bg-[#1a1e2d] p-3.5 flex gap-3.5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer"
                    >
                      {/* Thumbnail Foto Kecil */}
                      <div className="relative w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900">
                        <img
                          src={item.imageUrl || DEFAULT_FALLBACK_IMAGE}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Detail Berita */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                              {item.source}
                            </span>
                            <SentimentBadge sentiment={item.sentiment} />
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(item.published_at)}
                          </span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                            <span>Baca</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
