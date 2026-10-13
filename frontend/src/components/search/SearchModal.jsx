import React, { useState, useEffect, useRef } from "react";
import SearchFilterTabs from "./SearchFilterTabs";
import SearchResultItem from "./SearchResultItem";

export default function SearchModal({
  isOpen,
  onClose,
  onSelectStock,
  darkMode,
}) {
  const [query, setQuery] = useState("");
  const [primaryTab, setPrimaryTab] = useState("symbols");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const listRef = useRef(null);

  // Auto focus input saat modal terbuka & reset query
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      fetchStocks("");
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard: Escape untuk close, ArrowUp / ArrowDown untuk navigasi, Enter untuk pilih
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        onSelectStock(filteredResults[selectedIndex].symbol);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, results, activeCategory]);

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchStocks(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch stocks dari backend
  const fetchStocks = async (searchQuery) => {
    try {
      setIsLoading(true);
      const url = searchQuery
        ? `http://localhost:5000/api/stocks/search?q=${encodeURIComponent(searchQuery)}`
        : `http://localhost:5000/api/stocks?limit=80`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setResults(data.data);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.warn("Gagal mencari saham:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter hasil berdasarkan kategori yang dipilih
  const filteredResults = results.filter((item) => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "STOCKS") return true;
    if (activeCategory === "FINANCIALS") return item.sector === "Financials";
    if (activeCategory === "ENERGY") return item.sector === "Energy";
    if (activeCategory === "CONSUMER") return item.sector?.includes("Consumer");
    if (activeCategory === "TECH") return item.sector === "Technology";
    if (activeCategory === "INFRA") return item.sector === "Infrastructures";
    if (activeCategory === "BASIC") return item.sector === "Basic Materials";
    if (activeCategory === "INDEX") return item.symbol.includes("IDX") || item.symbol === "COMPOSITE";
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4">
      {/* Modal Container Bergaya TradingView */}
      <div
        ref={modalRef}
        className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden transition-colors ${
          darkMode
            ? "bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* ========================================================
            1. BAGIAN ATAS: Input Kolom Pencarian + Tombol Hapus & Close
            ======================================================== */}
        <div
          className={`flex items-center gap-3 px-5 py-3.5 border-b ${
            darkMode ? "border-[#2a2e39] bg-[#1e222d]" : "border-slate-200 bg-white"
          }`}
        >
          {/* Ikon Kaca Pembesar */}
          <svg
            className={`w-5 h-5 shrink-0 stroke-2 fill-none ${
              darkMode ? "stroke-[#787b86]" : "stroke-slate-400"
            }`}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
          </svg>

          {/* Kolom Input Teks */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Simbol, ISIN, atau CUSIP..."
            className={`flex-1 text-sm bg-transparent focus:outline-none font-medium placeholder:font-normal ${
              darkMode
                ? "text-white placeholder-[#787b86]"
                : "text-slate-900 placeholder-slate-400"
            }`}
          />

          {/* Tombol Hapus (jika query ada isi) */}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                darkMode
                  ? "text-[#787b86] hover:text-white"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Hapus
            </button>
          )}

          {/* Tombol Tutup Modal (✕) */}
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              darkMode
                ? "text-[#787b86] hover:text-white hover:bg-[#2a2e39]"
                : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Tutup (Esc)"
          >
            ✕
          </button>
        </div>

        {/* ========================================================
            2. TAB KATEGORI UTAMA & PILLS FILTER
            ======================================================== */}
        <SearchFilterTabs
          primaryTab={primaryTab}
          setPrimaryTab={setPrimaryTab}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          darkMode={darkMode}
        />

        {/* ========================================================
            3. DAFTAR HASIL PENCARIAN (Scrollable List)
            ======================================================== */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto divide-y divide-transparent min-h-[280px] max-h-[460px] custom-scrollbar"
        >
          {isLoading ? (
            <div className="p-8 text-center text-xs space-y-2 opacity-60">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <span>Memuat instrumen bursa...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-12 text-center text-xs space-y-1">
              <span className="font-bold block text-sm">Tidak ada simbol yang cocok</span>
              <span className="text-slate-400 block">
                Coba gunakan kode ticker seperti BBCA, BBRI, BMRI, atau TLKM
              </span>
            </div>
          ) : (
            filteredResults.map((stock, index) => (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                isSelected={selectedIndex === index}
                onSelect={(sym) => {
                  onSelectStock(sym);
                  onClose();
                }}
                darkMode={darkMode}
              />
            ))
          )}
        </div>

        {/* ========================================================
            4. FOOTER INFORMASI TRADINGVIEW STYLE
            ======================================================== */}
        <div
          className={`px-5 py-3 border-t text-center text-[11px] select-none ${
            darkMode
              ? "border-[#2a2e39] bg-[#1e222d] text-[#787b86]"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <span>Gunakan ticker konstituen IDX80, nama perusahaan, atau sektor bisnis</span>
        </div>
      </div>
    </div>
  );
}
