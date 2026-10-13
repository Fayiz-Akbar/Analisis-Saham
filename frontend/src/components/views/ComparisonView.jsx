import React, { useState } from "react";

// Mock perbandingan data fundamental emiten IDX80 terpopuler
const COMPARISON_PRESETS = {
  BBCA: {
    symbol: "BBCA",
    name: "Bank Central Asia Tbk.",
    sector: "Financials",
    price: 10450,
    change: "+1.21%",
    isUp: true,
    pe: 22.4,
    pbv: 4.8,
    roe: 21.8,
    roa: 3.4,
    der: 4.2,
    npm: 41.5,
    divYield: 2.1,
    marketCap: "1,288 T",
    rating: "Strong Buy",
  },
  BBRI: {
    symbol: "BBRI",
    name: "Bank Rakyat Indonesia Tbk.",
    sector: "Financials",
    price: 4980,
    change: "-0.60%",
    isUp: false,
    pe: 12.8,
    pbv: 2.3,
    roe: 18.2,
    roa: 2.8,
    der: 5.1,
    npm: 34.2,
    divYield: 6.4,
    marketCap: "755 T",
    rating: "Buy",
  },
  BMRI: {
    symbol: "BMRI",
    name: "Bank Mandiri (Persero) Tbk.",
    sector: "Financials",
    price: 6850,
    change: "+0.74%",
    isUp: true,
    pe: 11.5,
    pbv: 2.1,
    roe: 19.4,
    roa: 2.6,
    der: 4.8,
    npm: 36.8,
    divYield: 5.2,
    marketCap: "639 T",
    rating: "Buy",
  },
  BBNI: {
    symbol: "BBNI",
    name: "Bank Negara Indonesia Tbk.",
    sector: "Financials",
    price: 5400,
    change: "+0.47%",
    isUp: true,
    pe: 9.8,
    pbv: 1.3,
    roe: 14.5,
    roa: 2.0,
    der: 4.5,
    npm: 28.6,
    divYield: 5.8,
    marketCap: "201 T",
    rating: "Moderate Buy",
  },
  TLKM: {
    symbol: "TLKM",
    name: "Telkom Indonesia Tbk.",
    sector: "Infrastructures",
    price: 3120,
    change: "-1.27%",
    isUp: false,
    pe: 13.2,
    pbv: 2.4,
    roe: 17.5,
    roa: 8.4,
    der: 0.8,
    npm: 16.5,
    divYield: 5.4,
    marketCap: "309 T",
    rating: "Hold",
  },
  ASII: {
    symbol: "ASII",
    name: "Astra International Tbk.",
    sector: "Industrials",
    price: 5050,
    change: "+0.50%",
    isUp: true,
    pe: 6.8,
    pbv: 1.0,
    roe: 15.2,
    roa: 7.1,
    der: 0.9,
    npm: 10.4,
    divYield: 8.5,
    marketCap: "204 T",
    rating: "Buy",
  },
};

export default function ComparisonView({ onSelectStock }) {
  const [selectedTickers, setSelectedTickers] = useState(["BBCA", "BBRI", "BMRI"]);
  const [activeMetricGroup, setActiveMetricGroup] = useState("all");

  const availableTickers = Object.keys(COMPARISON_PRESETS);

  const toggleTicker = (symbol) => {
    if (selectedTickers.includes(symbol)) {
      if (selectedTickers.length > 2) {
        setSelectedTickers(selectedTickers.filter((s) => s !== symbol));
      }
    } else {
      if (selectedTickers.length < 4) {
        setSelectedTickers([...selectedTickers, symbol]);
      }
    }
  };

  const metrics = [
    { key: "pe", label: "P/E Ratio", unit: "x", group: "valuation", benchmark: "< 15x Murah" },
    { key: "pbv", label: "PBV Ratio", unit: "x", group: "valuation", benchmark: "< 2.0x Wajar" },
    { key: "roe", label: "ROE", unit: "%", group: "profitability", benchmark: "> 15% Prima" },
    { key: "roa", label: "ROA", unit: "%", group: "profitability", benchmark: "> 2.5% Sehat" },
    { key: "npm", label: "Net Profit Margin", unit: "%", group: "profitability", benchmark: "Tinggi Baik" },
    { key: "der", label: "Debt to Equity (DER)", unit: "x", group: "leverage", benchmark: "< 5x untuk Bank" },
    { key: "divYield", label: "Dividend Yield", unit: "%", group: "dividend", benchmark: "> 4% Tinggi" },
  ];

  const filteredMetrics =
    activeMetricGroup === "all"
      ? metrics
      : metrics.filter((m) => m.group === activeMetricGroup);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Stock Comparison (Head-to-Head)
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Sub-sistem 1 (Fayiz)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Komparasi fundamental 2–4 emiten sejenis secara simultan lintas 4 pilar fundamental (Valuation, Profitability, Solvency, Dividend).
          </p>
        </div>

        {/* Ticker Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Pilih 2–4 Saham:</span>
          {availableTickers.map((t) => {
            const isSelected = selectedTickers.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTicker(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Group Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "Semua Metrik" },
          { id: "valuation", label: "Valuasi (PER, PBV)" },
          { id: "profitability", label: "Profitabilitas (ROE, ROA, NPM)" },
          { id: "leverage", label: "Solvabilitas (DER)" },
          { id: "dividend", label: "Dividen Yield" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveMetricGroup(btn.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeMetricGroup === btn.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Comparison Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {selectedTickers.map((ticker) => {
          const data = COMPARISON_PRESETS[ticker];
          if (!data) return null;
          return (
            <div
              key={ticker}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xl font-black text-slate-900 dark:text-white block">
                      {data.symbol}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {data.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {data.sector}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    Rp {data.price.toLocaleString("id-ID")}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      data.isUp ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {data.change}
                  </span>
                </div>
              </div>

              {/* Ratios List */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                {filteredMetrics.map((m) => (
                  <div key={m.key} className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {data[m.key]} {m.unit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSelectStock && onSelectStock(data.symbol)}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Analisis Mendalam {data.symbol} →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm overflow-x-auto">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Tabel Matriks Perbandingan Komprehensif
        </h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Indikator Fundamental</th>
              <th className="py-2.5 px-3">Benchmark Sehat</th>
              {selectedTickers.map((t) => (
                <th key={t} className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {metrics.map((m) => (
              <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-700 dark:text-slate-300">
                  {m.label}
                </td>
                <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{m.benchmark}</td>
                {selectedTickers.map((t) => {
                  const val = COMPARISON_PRESETS[t]?.[m.key];
                  return (
                    <td key={t} className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                      {val} {m.unit}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
