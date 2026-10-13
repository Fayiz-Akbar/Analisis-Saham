import React, { useState } from "react";

const INITIAL_WATCHLIST = [
  { symbol: "BBCA", name: "Bank Central Asia Tbk.", sector: "Financials", price: 10450, change: "+1.21%", isUp: true, pe: 22.4, pbv: 4.8 },
  { symbol: "BBRI", name: "Bank Rakyat Indonesia Tbk.", sector: "Financials", price: 4980, change: "-0.60%", isUp: false, pe: 12.8, pbv: 2.3 },
  { symbol: "BMRI", name: "Bank Mandiri (Persero) Tbk.", sector: "Financials", price: 6850, change: "+0.74%", isUp: true, pe: 11.5, pbv: 2.1 },
  { symbol: "TLKM", name: "Telkom Indonesia Tbk.", sector: "Infrastructures", price: 3120, change: "-1.27%", isUp: false, pe: 13.2, pbv: 2.4 },
  { symbol: "ASII", name: "Astra International Tbk.", sector: "Industrials", price: 5050, change: "+0.50%", isUp: true, pe: 6.8, pbv: 1.0 },
];

export default function WatchlistView({ onSelectStock }) {
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [newTicker, setNewTicker] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    const sym = newTicker.trim().toUpperCase();
    if (watchlist.find((w) => w.symbol === sym)) return;

    setWatchlist([
      ...watchlist,
      {
        symbol: sym,
        name: `${sym} Tbk.`,
        sector: "IDX80",
        price: 5000,
        change: "+0.00%",
        isUp: true,
        pe: 14.0,
        pbv: 1.8,
      },
    ]);
    setNewTicker("");
  };

  const handleRemove = (symbol) => {
    setWatchlist(watchlist.filter((w) => w.symbol !== symbol));
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Personal Watchlist
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Sub-sistem 1 (Fayiz)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar pantau saham pilihan Anda dengan harga real-time dan metrik valuasi cepat.
          </p>
        </div>

        {/* Input Tambah Saham */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            placeholder="Tambah Ticker (e.g. ADRO)"
            className="px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all"
          >
            + Tambah
          </button>
        </form>
      </div>

      {/* Grid Kartu Saham Pantauan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item) => (
          <div
            key={item.symbol}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xl font-black text-slate-900 dark:text-white block">
                  {item.symbol}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-1">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.sector}</span>
              </div>
              <button
                onClick={() => handleRemove(item.symbol)}
                className="text-slate-400 hover:text-rose-500 text-xs cursor-pointer p-1"
                title="Hapus dari watchlist"
              >
                ✕
              </button>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  item.isUp ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {item.change}
              </span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>PER: <strong className="text-slate-800 dark:text-slate-200">{item.pe}x</strong></span>
              <span>PBV: <strong className="text-slate-800 dark:text-slate-200">{item.pbv}x</strong></span>
            </div>

            <button
              onClick={() => onSelectStock && onSelectStock(item.symbol)}
              className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-center"
            >
              Buka Analisis Saham →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
