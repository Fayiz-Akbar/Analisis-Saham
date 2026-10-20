import React, { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/**
 * Fallback topic image jika foto berita gagal dimuat
 */
const DEFAULT_FALLBACK_IMAGE =
  "https://foto.kontan.co.id/IiOs-O1hRpgtIi4fFQeI_TpN_cQ=/smart/2025/05/27/15854717p.jpg";

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
 * Logo Penerbit Media Otentik (CNBC Indonesia, Kontan, detikFinance)
 * Sesuai foto referensi pengguna: mini brand avatar bundar di samping nama publisher.
 */
export function PublisherLogo({ source, className = "w-4 h-4" }) {
  const s = (source || "").toLowerCase();

  if (s.includes("cnbc")) {
    return (
      <div
        className={`${className} rounded-full bg-[#cc0000] inline-flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white/10`}
        title="CNBC Indonesia"
      >
        <span className="text-[7px] font-black tracking-tighter text-white font-sans leading-none">
          CNBC
        </span>
      </div>
    );
  }

  if (s.includes("kontan")) {
    return (
      <div
        className={`${className} rounded-full bg-[#f59e0b] inline-flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-amber-400/30`}
        title="Kontan"
      >
        <span className="text-[9px] font-black text-slate-950 font-serif leading-none">
          K
        </span>
      </div>
    );
  }

  if (s.includes("detik")) {
    return (
      <div
        className={`${className} rounded-full bg-[#0055aa] inline-flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-blue-400/30`}
        title="detikFinance"
      >
        <span className="text-[6.5px] font-extrabold text-white leading-none tracking-tight">
          detik
        </span>
      </div>
    );
  }

  // Fallback untuk media lainnya
  return (
    <div
      className={`${className} rounded-full bg-slate-800 inline-flex items-center justify-center shrink-0 ring-1 ring-slate-700 text-slate-300 text-[8px] font-bold leading-none`}
      title={source || "Media Finansial"}
    >
      {source ? source.slice(0, 2).toUpperCase() : "NW"}
    </div>
  );
}

/**
 * Label Polaritas Sentimen (Sesuai Foto ke-2 Pengguna)
 * Teks & ikon langsung di atas latar belakang gelap/hitam:
 * - TANPA background container (bukan pill/box)
 * - Positif: Grafik panah naik (#2fe695) + "Positif"
 * - Negatif: Grafik panah turun (#f87171) + "Negatif"
 * - Netral: Tanda minus / netral (#94a3b8) + "Netral"
 */
export function SentimentLabel({ sentiment, className = "" }) {
  const norm = (sentiment || "neutral").toLowerCase();

  if (norm === "positive" || norm === "positif") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold text-[#2fe695] select-none ${className}`}
      >
        <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Positif</span>
      </span>
    );
  }

  if (norm === "negative" || norm === "negatif") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold text-[#f87171] select-none ${className}`}
      >
        <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Negatif</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold text-slate-400 select-none ${className}`}
    >
      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>Netral</span>
    </span>
  );
}

export default function LatestNewsSection({ className = "" }) {
  const [allNews, setAllNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const breakingScrollRef = useRef(null);

  const fetchNewsData = async (limit = 20) => {
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
    fetchNewsData(20).then((data) => {
      if (isMounted) {
        setAllNews(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await fetchNewsData(20);
    setAllNews(data);
    setIsRefreshing(false);
  };

  const handleOpenAllModal = async () => {
    setShowAllModal(true);
    if (allNews.length < 30) {
      const fullData = await fetchNewsData(40);
      setAllNews(fullData);
    }
  };

  // Helper scroll horizontal
  const handleScroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Pembagian Berita:
  // 1. Breaking News: 5 berita utama di slider horizontal (lebar 4 grid, ke-4 setengah terlihat sampai ke-5)
  const breakingArticles = allNews.slice(0, 5);

  // 2. Latest News: Berita format ringkas horizontal dengan foto full bleed di sebelah kiri
  const latestArticles = allNews.slice(5, 13);

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
      className={`space-y-8 ${className}`}
    >
      {/* ========================================================
          HEADER UTAMA ARUS BERITA FINANSIAL TERKINI
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Berita Pasar Saham
          </h2>
        </div>

        {/* Tombol Refresh & Tombol "Lihat Semua" */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white hover:bg-slate-50 dark:bg-[#0c0e14] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Muat Ulang Berita"
            aria-label="Muat Ulang Berita"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-slate-300" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenAllModal}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/10 bg-white hover:bg-slate-50 dark:bg-[#0c0e14] dark:hover:bg-slate-900 text-slate-900 dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer group hover:border-slate-400 dark:hover:border-white/25"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="flex gap-4 overflow-hidden">
            <div className="h-56 w-72 shrink-0 bg-slate-200 dark:bg-[#0c0e14] rounded-2xl border border-slate-200 dark:border-white/10" />
            <div className="h-56 w-72 shrink-0 bg-slate-200 dark:bg-[#0c0e14] rounded-2xl border border-slate-200 dark:border-white/10" />
            <div className="h-56 w-72 shrink-0 bg-slate-200 dark:bg-[#0c0e14] rounded-2xl border border-slate-200 dark:border-white/10" />
            <div className="h-56 w-72 shrink-0 bg-slate-200 dark:bg-[#0c0e14] rounded-2xl border border-slate-200 dark:border-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-200 dark:bg-[#0c0e14] rounded-2xl border border-slate-200 dark:border-white/10" />
            <div className="h-28 bg-slate-200 dark:bg-[#0c0e14] rounded-2xl border border-slate-200 dark:border-white/10" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ========================================================
              BAGIAN 1: BREAKING NEWS (SLIDER HORIZONTAL, KE-4 SETENGAH SAMPAI KE-5)
              ======================================================== */}
          {breakingArticles.length > 0 && (
            <div className="space-y-3">
              {/* Header Breaking News dengan Link "View More" & Navigasi Geser */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Breaking News
                </h3>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenAllModal}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View More</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* Tombol Panah Geser Breaking News */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleScroll(breakingScrollRef, "left")}
                      className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Geser ke kiri"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleScroll(breakingScrollRef, "right")}
                      className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Geser ke kanan"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider Horizontal Breaking News: Lebar 4 Grid, Ke-4 Setengah Terlihat sampai Ke-5 */}
              <div
                ref={breakingScrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
              >
                {breakingArticles.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-[80%] sm:w-[46%] md:w-[32%] lg:w-[calc((100%-3rem)/3.45)] shrink-0 snap-start rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] overflow-hidden flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/25 transition-colors cursor-pointer"
                  >
                    <div>
                      {/* Foto Thumbnail Berita: FULL BLEED DI ATAS (Tanpa Margin/Container) */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                        <img
                          src={item.imageUrl || DEFAULT_FALLBACK_IMAGE}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                          loading="lazy"
                        />

                        {item.symbol && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white border border-white/20 select-none">
                              {item.symbol}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Konten Teks di Bawah Foto dengan Padding */}
                      <div className="p-4 pb-2">
                        {/* Baris Kategori Monokrom & Waktu */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] truncate uppercase tracking-wider">
                            {item.symbol ? `${item.symbol} • Emiten` : "Pasar Modal"}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(item.published_at)}
                          </span>
                        </div>

                        {/* Judul Berita Tebal Monokrom (Hitam di Light, Putih di Dark, Tanpa Hijau) */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mt-2 mb-1 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Baris Bawah: Logo Penerbit & Label Sentimen (Sesuai Foto 2: Tanpa Container) */}
                    <div className="p-4 pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <PublisherLogo source={item.source} className="w-4 h-4" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                          {item.source}
                        </span>
                      </div>

                      {/* Sentimen Langsung Di Latar Gelap (Sesuai Foto 2) */}
                      <SentimentLabel sentiment={item.sentiment} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              BAGIAN 3: LATEST NEWS (FOTO KIRI FULL GAMBAR TANPA CONTAINER)
              ======================================================== */}
          {latestArticles.length > 0 && (
            <div className="space-y-3">
              {/* Header Latest news */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Latest news
                </h3>
              </div>

              {/* Format List Horizontal: Foto Kiri Full Bleed Tanpa Container, Teks di Kanan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestArticles.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] overflow-hidden flex items-stretch hover:border-slate-400 dark:hover:border-white/25 transition-colors cursor-pointer"
                  >
                    {/* Thumbnail Foto di Kiri: FULL GAMBAR TANPA CONTAINER */}
                    <div className="relative w-32 sm:w-36 md:w-44 shrink-0 overflow-hidden bg-slate-900">
                      <img
                        src={item.imageUrl || DEFAULT_FALLBACK_IMAGE}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                        loading="lazy"
                      />
                    </div>

                    {/* Informasi Berita di Kanan dengan Padding */}
                    <div className="min-w-0 flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
                      <div>
                        {/* Kategori Monokrom & Waktu */}
                        <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                          <span className="font-semibold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">
                            {item.symbol ? `${item.symbol}` : "Pasar Modal"}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimeAgo(item.published_at)}
                          </span>
                        </div>

                        {/* Judul Berita Monokrom (Hitam di Light, Putih di Dark, Tanpa Hijau) */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      {/* Baris Footer: Logo Penerbit & Sentimen (Sesuai Foto 2) */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/10 mt-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <PublisherLogo source={item.source} className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                            {item.source}
                          </span>
                        </div>

                        {/* Label Sentimen Sesuai Foto 2: Tanpa Container Background */}
                        <SentimentLabel sentiment={item.sentiment} />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL "LIHAT SEMUA" BERITA KEUANGAN TERKINI
          ======================================================== */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            className="w-full max-w-5xl max-h-[88vh] bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-slate-300" />
                  <span>Seluruh Arus Berita Finansial</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Katalog lengkap berita pasar modal BEI dan emiten IDX80 dengan foto artikel dan label sentimen.
                </p>
              </div>

              <button
                onClick={() => setShowAllModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-black/40 flex flex-col sm:flex-row items-center gap-3">
              {/* Filter Tabs Sentimen */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl self-stretch sm:self-auto border border-slate-300/50 dark:border-white/10">
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
                        ? "bg-white text-slate-900 dark:bg-[#1a1f2c] dark:text-white"
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#080808] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Konten Daftar Berita di Modal (Foto Full di Kiri) */}
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
                      className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 hover:bg-white dark:bg-[#0c0e14] dark:hover:bg-[#121620] overflow-hidden flex items-stretch hover:border-slate-400 dark:hover:border-white/25 transition-colors cursor-pointer"
                    >
                      {/* Thumbnail Foto Full Bleed di Kiri */}
                      <div className="relative w-28 sm:w-32 shrink-0 overflow-hidden bg-slate-900">
                        <img
                          src={item.imageUrl || DEFAULT_FALLBACK_IMAGE}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                          loading="lazy"
                        />
                      </div>

                      {/* Detail Berita */}
                      <div className="min-w-0 flex-1 p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <PublisherLogo source={item.source} className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                {item.source}
                              </span>
                            </div>
                            {/* Sentimen Sesuai Foto 2 (Tanpa Container) */}
                            <SentimentLabel sentiment={item.sentiment} />
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(item.published_at)}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-0.5">
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
