import React, { useState, useEffect } from "react";

export default function ScreenerView({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStocks() {
      try {
        const res = await fetch("http://localhost:5000/api/stocks?limit=80");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setStocks(json.data);
        }
      } catch (err) {
        console.warn("Gagal memuat katalog screener:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStocks();
  }, []);

  const sectors = [
    "ALL",
    "Financials",
    "Basic Materials",
    "Energy",
    "Consumer Non-Cyclicals",
    "Consumer Cyclicals",
    "Industrials",
    "Healthcare",
    "Infrastructures",
    "Technology",
  ];

  const filtered = stocks.filter((s) => {
    const matchSearch =
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.companyName.toLowerCase().includes(search.toLowerCase());
    const matchSector = selectedSector === "ALL" || s.sector === selectedSector;
    return matchSearch && matchSector;
  });

  return (
    <div className="space-y-6">
      {/* Title & Deskripsi Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Stock Screener IDX80
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Sub-sistem 1 (Fayiz)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Penyaring 80 konstituen likuid Bursa Efek Indonesia berdasarkan sektor, profil kapitalisasi, dan kriteria fundamental.
          </p>
        </div>

        {/* Counter Results */}
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
          Menampilkan <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{filtered.length}</span> dari {stocks.length} emiten
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search input */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ticker atau nama..."
            className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full scrollbar-none pb-1 md:pb-0">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSector === sec
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {sec === "ALL" ? "Semua Sektor" : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Screener Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3">Emiten</th>
                <th className="px-5 py-3">Sektor & Industri</th>
                <th className="px-5 py-3 text-right">Harga Terakhir</th>
                <th className="px-5 py-3 text-right">Perubahan</th>
                <th className="px-5 py-3 text-center">Status IDX</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    Memuat data emiten IDX80...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    Tidak ada saham yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((stock) => {
                  const dp = stock.dailyPrice;
                  const price = dp?.closePrice ? `Rp ${Number(dp.closePrice).toLocaleString("id-ID")}` : "-";
                  const change = dp?.changeAmount || 0;
                  const pct = dp?.changePercent || 0;
                  const isUp = change >= 0;

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                            <img
                              src={stock.logoUrl || `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`}
                              alt={stock.symbol}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">
                              {stock.symbol}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                              {stock.companyName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        <div className="font-medium">{stock.sector}</div>
                        <div className="text-[11px] text-slate-400">{stock.industry}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {price}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs tabular-nums">
                        {dp ? (
                          <span className={isUp ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
                            {isUp ? "+" : ""}{change} ({isUp ? "+" : ""}{pct}%)
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          IDX80
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => onSelectStock(stock.symbol)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                        >
                          Analisis
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
