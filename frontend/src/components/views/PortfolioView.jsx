import React, { useState } from "react";

// Mock data portofolio berbasis lot (1 lot = 100 lembar) sesuai PRD Module 8 Firman
const INITIAL_HOLDINGS = [
  {
    symbol: "BBCA",
    name: "Bank Central Asia Tbk.",
    sector: "Financials",
    lots: 15,
    avgPrice: 9800,
    currentPrice: 10450,
  },
  {
    symbol: "BBRI",
    name: "Bank Rakyat Indonesia Tbk.",
    sector: "Financials",
    lots: 25,
    avgPrice: 5200,
    currentPrice: 4980,
  },
  {
    symbol: "TLKM",
    name: "Telkom Indonesia Tbk.",
    sector: "Infrastructures",
    lots: 20,
    avgPrice: 3350,
    currentPrice: 3120,
  },
  {
    symbol: "ASII",
    name: "Astra International Tbk.",
    sector: "Industrials",
    lots: 10,
    avgPrice: 4850,
    currentPrice: 5050,
  },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, date: "2024-09-15", type: "BUY", symbol: "BBCA", lots: 10, price: 9700 },
  { id: 2, date: "2024-09-22", type: "BUY", symbol: "BBCA", lots: 5, price: 10000 },
  { id: 3, date: "2024-09-28", type: "BUY", symbol: "BBRI", lots: 25, price: 5200 },
  { id: 4, date: "2024-10-02", type: "BUY", symbol: "TLKM", lots: 20, price: 3350 },
  { id: 5, date: "2024-10-08", type: "BUY", symbol: "ASII", lots: 10, price: 4850 },
];

export default function PortfolioView({ onSelectStock }) {
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Form input transaksi baru
  const [newSymbol, setNewSymbol] = useState("BMRI");
  const [newLots, setNewLots] = useState(5);
  const [newPrice, setNewPrice] = useState(6850);

  // Kalkulasi Total Nilai & P/L
  const totalCost = holdings.reduce((sum, h) => sum + h.lots * 100 * h.avgPrice, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.lots * 100 * h.currentPrice, 0);
  const unrealizedPL = totalValue - totalCost;
  const returnPct = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const lotsNum = Number(newLots);
    const priceNum = Number(newPrice);
    if (!lotsNum || !priceNum) return;

    const newTx = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: "BUY",
      symbol: newSymbol.toUpperCase(),
      lots: lotsNum,
      price: priceNum,
    };
    setTransactions([newTx, ...transactions]);

    // Update holdings
    const existing = holdings.find((h) => h.symbol === newSymbol.toUpperCase());
    if (existing) {
      const newTotalLots = existing.lots + lotsNum;
      const newWeightedAvg =
        (existing.lots * existing.avgPrice + lotsNum * priceNum) / newTotalLots;
      setHoldings(
        holdings.map((h) =>
          h.symbol === newSymbol.toUpperCase()
            ? { ...h, lots: newTotalLots, avgPrice: Math.round(newWeightedAvg) }
            : h
        )
      );
    } else {
      setHoldings([
        ...holdings,
        {
          symbol: newSymbol.toUpperCase(),
          name: `${newSymbol.toUpperCase()} Tbk.`,
          sector: "Others",
          lots: lotsNum,
          avgPrice: priceNum,
          currentPrice: priceNum,
        },
      ]);
    }
    setShowBuyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Portfolio Tracking & Transactions
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              Sub-sistem 2 (Firman)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pencatatan kepemilikan dan transaksi bursa berbasis lot (1 lot = 100 lembar), weighted average buy price, dan kalkulasi P/L otomatis.
          </p>
        </div>

        <button
          onClick={() => setShowBuyModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          + Tambah Transaksi Lot
        </button>
      </div>

      {/* Ringkasan Portofolio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Total Nilai Portofolio</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            Rp {totalValue.toLocaleString("id-ID")}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Modal: Rp {totalCost.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Unrealized P/L</span>
          <span
            className={`text-xl font-black font-mono mt-1 block ${
              unrealizedPL >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {unrealizedPL >= 0 ? "+" : ""}Rp {unrealizedPL.toLocaleString("id-ID")}
          </span>
          <span
            className={`text-[11px] font-bold font-mono mt-1 block ${
              returnPct >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {returnPct >= 0 ? "+" : ""}
            {returnPct.toFixed(2)}% Return
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Total Kepemilikan Lot</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            {holdings.reduce((sum, h) => sum + h.lots, 0)} Lot
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {holdings.reduce((sum, h) => sum + h.lots * 100, 0).toLocaleString("id-ID")} Lembar Saham
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Diversifikasi Emiten</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            {holdings.length} Saham
          </span>
          <span className="text-[11px] text-purple-400 mt-1 block">
            Tersebar di {new Set(holdings.map((h) => h.sector)).size} Sektor IDX
          </span>
        </div>
      </div>

      {/* Tabel Kepemilikan Saham Saat Ini */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs overflow-x-auto">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Daftar Posisi Saham (Holdings)
        </h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Emiten</th>
              <th className="py-2.5 px-3">Sektor</th>
              <th className="py-2.5 px-3">Jumlah Lot</th>
              <th className="py-2.5 px-3">Harga Rata-rata (Avg)</th>
              <th className="py-2.5 px-3">Harga Terkini</th>
              <th className="py-2.5 px-3">Nilai Pasar</th>
              <th className="py-2.5 px-3">Unrealized P/L</th>
              <th className="py-2.5 px-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {holdings.map((h) => {
              const cost = h.lots * 100 * h.avgPrice;
              const val = h.lots * 100 * h.currentPrice;
              const pl = val - cost;
              const plPct = (pl / cost) * 100;
              const isProfit = pl >= 0;

              return (
                <tr key={h.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{h.symbol}</span>
                    <span className="font-sans text-[11px] text-slate-500 line-clamp-1">{h.name}</span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-500">{h.sector}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {h.lots} Lot <span className="text-slate-400 font-normal">({h.lots * 100} lembar)</span>
                  </td>
                  <td className="py-3 px-3">Rp {h.avgPrice.toLocaleString("id-ID")}</td>
                  <td className="py-3 px-3">Rp {h.currentPrice.toLocaleString("id-ID")}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    Rp {val.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${isProfit ? "text-emerald-500" : "text-rose-500"}`}>
                      {isProfit ? "+" : ""}Rp {pl.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`block text-[11px] ${
                        isProfit ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      ({isProfit ? "+" : ""}
                      {plPct.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <button
                      onClick={() => onSelectStock && onSelectStock(h.symbol)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Riwayat Transaksi */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs overflow-x-auto">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Riwayat Transaksi Terakhir (Transaction Ledger)
        </h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Tipe</th>
              <th className="py-2.5 px-3">Emiten</th>
              <th className="py-2.5 px-3">Jumlah Lot</th>
              <th className="py-2.5 px-3">Harga Eksekusi</th>
              <th className="py-2.5 px-3">Total Transaksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 text-slate-500 font-sans">{t.date}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
                    {t.type}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.symbol}</td>
                <td className="py-2.5 px-3">{t.lots} Lot</td>
                <td className="py-2.5 px-3">Rp {t.price.toLocaleString("id-ID")}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                  Rp {(t.lots * 100 * t.price).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Beli / Tambah Transaksi */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Catat Transaksi Lot Baru
              </h3>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Ticker Saham</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  placeholder="Contoh: BBCA"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Jumlah Lot (1 lot = 100 lembar)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newLots}
                  onChange={(e) => setNewLots(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Harga per Lembar (Rp)</label>
                <input
                  type="number"
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Total Lembar:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {(Number(newLots) || 0) * 100} lembar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Modal:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    Rp {((Number(newLots) || 0) * 100 * (Number(newPrice) || 0)).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
