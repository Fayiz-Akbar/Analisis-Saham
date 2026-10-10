import React, { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Sparkles, Building2 } from "lucide-react";

export default function SearchBar({ onSelectStock, selectedSymbol = "BBCA" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStocks(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchStocks = async (searchQuery) => {
    try {
      setIsLoading(true);
      const url = searchQuery
        ? `http://localhost:5000/api/stocks/search?q=${encodeURIComponent(searchQuery)}`
        : `http://localhost:5000/api/stocks/search`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setResults(data.data);
      }
    } catch (err) {
      console.warn("Gagal mencari saham:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (stock) => {
    onSelectStock(stock.symbol);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (results.length === 0) fetchStocks("");
          }}
          placeholder="Cari kode ticker atau nama emiten IDX80..."
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
        />

        {query ? (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Konstituen Indeks IDX80</span>
            {isLoading && <span className="animate-spin text-blue-500">⏳</span>}
          </div>

          {results.length > 0 ? (
            results.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 transition-colors ${
                  selectedSymbol === stock.symbol ? "bg-blue-50/80 dark:bg-slate-800/80" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <img
                      src={stock.logoUrl || `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`}
                      alt={stock.symbol}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerText = stock.symbol;
                      }}
                    />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {stock.companyName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {stock.sector}
                      </span>
                    </div>
                  </div>
                </div>

                {stock.isIdx80 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex-shrink-0">
                    IDX80
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              Tidak ada emiten yang cocok dengan "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
