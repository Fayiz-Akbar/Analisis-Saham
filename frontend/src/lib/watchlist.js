import { useCallback, useEffect, useState } from "react";

export const WATCHLIST_STORAGE_KEY = "investai_watchlist_symbols";
export const DEFAULT_WATCHLIST_SYMBOLS = ["BBCA", "BBRI", "TLKM", "ASII"];
const WATCHLIST_EVENT_NAME = "watchlist-updated";

function normalizeSymbolList(rawList) {
  if (!Array.isArray(rawList)) return [...DEFAULT_WATCHLIST_SYMBOLS];
  const seen = new Set();
  const normalized = [];
  for (const item of rawList) {
    const sym = String(item || "").trim().toUpperCase();
    if (sym && !seen.has(sym)) {
      seen.add(sym);
      normalized.push(sym);
    }
  }
  return normalized;
}

export function readWatchlistSymbols() {
  if (typeof window === "undefined") return [...DEFAULT_WATCHLIST_SYMBOLS];
  try {
    const saved = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!saved) return [...DEFAULT_WATCHLIST_SYMBOLS];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? normalizeSymbolList(parsed) : [...DEFAULT_WATCHLIST_SYMBOLS];
  } catch {
    return [...DEFAULT_WATCHLIST_SYMBOLS];
  }
}

export function writeWatchlistSymbols(symbols) {
  const normalized = normalizeSymbolList(symbols);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new Event(WATCHLIST_EVENT_NAME));
    } catch (err) {
      console.warn("Gagal menyimpan watchlist:", err);
    }
  }
  return normalized;
}

export function toggleWatchlistSymbol(symbol) {
  const normalizedSymbol = String(symbol || "").trim().toUpperCase();
  const current = readWatchlistSymbols();
  if (!normalizedSymbol) return current;

  const updated = current.includes(normalizedSymbol)
    ? current.filter((s) => s !== normalizedSymbol)
    : [...current, normalizedSymbol];

  return writeWatchlistSymbols(updated);
}

/**
 * Hook sinkronisasi daftar Watchlist lintas komponen (StockDetail, Screener, WatchlistView).
 * Semua mutasi localStorage dan event dilakukan di event handler (bukan di dalam React state updater)
 * agar kompatibel penuh dengan React 19 StrictMode.
 */
export function useWatchlist() {
  const [watchlistSymbols, setWatchlistSymbols] = useState(readWatchlistSymbols);

  useEffect(() => {
    const handleSync = () => {
      setWatchlistSymbols(readWatchlistSymbols());
    };
    window.addEventListener(WATCHLIST_EVENT_NAME, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(WATCHLIST_EVENT_NAME, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const toggleWatchlist = useCallback((symbol) => {
    const updated = toggleWatchlistSymbol(symbol);
    setWatchlistSymbols(updated);
    return updated;
  }, []);

  return { watchlistSymbols, toggleWatchlist };
}
