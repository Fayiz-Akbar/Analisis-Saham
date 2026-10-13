import React, { useState, useMemo } from "react";

// Mock data historis bulanan saham (contoh BBCA 12 bulan terakhir)
const HISTORICAL_MONTHLY_PRICES = [
  { month: "Nov 2023", price: 8900 },
  { month: "Des 2023", price: 9200 },
  { month: "Jan 2024", price: 9550 },
  { month: "Feb 2024", price: 9750 },
  { month: "Mar 2024", price: 10050 },
  { month: "Apr 2024", price: 9800 },
  { month: "Mei 2024", price: 9350 },
  { month: "Jun 2024", price: 9900 },
  { month: "Jul 2024", price: 10200 },
  { month: "Agu 2024", price: 10300 },
  { month: "Sep 2024", price: 10550 },
  { month: "Okt 2024", price: 10450 },
];

export default function DcaSimulatorView({ onSelectStock }) {
  const [ticker, setTicker] = useState("BBCA");
  const [monthlyBudget, setMonthlyBudget] = useState(2500000); // 2.5 juta per bulan
  const [durationMonths, setDurationMonths] = useState(12);

  // Simulasi Realistic Lot Mode (akumulasi sisa dana kas bulan ke bulan) sesuai PRD Module 9
  const simulationResults = useMemo(() => {
    let accumulatedCash = 0;
    let totalLots = 0;
    let totalCapitalInjected = 0;
    const history = [];

    const activePrices = HISTORICAL_MONTHLY_PRICES.slice(0, durationMonths);

    for (let i = 0; i < activePrices.length; i++) {
      const item = activePrices[i];
      const availableFunds = accumulatedCash + monthlyBudget;
      totalCapitalInjected += monthlyBudget;

      const pricePerLot = item.price * 100;
      const lotsPurchased = Math.floor(availableFunds / pricePerLot);
      const totalCostThisMonth = lotsPurchased * pricePerLot;
      const leftoverCash = availableFunds - totalCostThisMonth;

      totalLots += lotsPurchased;
      accumulatedCash = leftoverCash;

      history.push({
        month: item.month,
        price: item.price,
        budget: monthlyBudget,
        availableFunds,
        lotsPurchased,
        totalCostThisMonth,
        leftoverCash,
        cumulativeLots: totalLots,
      });
    }

    const currentPrice = activePrices[activePrices.length - 1].price;
    const stockPortfolioValue = totalLots * 100 * currentPrice;
    const totalEndingValue = stockPortfolioValue + accumulatedCash;
    const netProfit = totalEndingValue - totalCapitalInjected;
    const returnPct = totalCapitalInjected > 0 ? (netProfit / totalCapitalInjected) * 100 : 0;

    // Perbandingan dengan Lump Sum (seluruh modal di awal)
    const lumpSumLots = Math.floor(totalCapitalInjected / (activePrices[0].price * 100));
    const lumpSumEndingValue =
      lumpSumLots * 100 * currentPrice + (totalCapitalInjected - lumpSumLots * 100 * activePrices[0].price);
    const lumpSumProfit = lumpSumEndingValue - totalCapitalInjected;
    const lumpSumReturnPct = (lumpSumProfit / totalCapitalInjected) * 100;

    return {
      history,
      totalCapitalInjected,
      totalLots,
      accumulatedCash,
      stockPortfolioValue,
      totalEndingValue,
      netProfit,
      returnPct,
      lumpSumEndingValue,
      lumpSumProfit,
      lumpSumReturnPct,
      currentPrice,
    };
  }, [monthlyBudget, durationMonths]);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              DCA Simulator (Realistic Lot Mode)
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              Sub-sistem 2 (Firman)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulasi Dollar-Cost Averaging realistis: Hanya membeli kelipatan 100 lembar (1 lot) dengan rollover sisa saldo kas bulanan.
          </p>
        </div>
      </div>

      {/* Simulator Inputs Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Pilih Saham IDX
          </label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold"
          >
            <option value="BBCA">BBCA - Bank Central Asia</option>
            <option value="BBRI">BBRI - Bank Rakyat Indonesia</option>
            <option value="BMRI">BMRI - Bank Mandiri</option>
            <option value="TLKM">TLKM - Telkom Indonesia</option>
            <option value="ASII">ASII - Astra International</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Alokasi Budget Rutin / Bulan (Rp)
          </label>
          <input
            type="number"
            step="100000"
            min="500000"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(Number(e.target.value))}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Durasi Investasi (Bulan)
          </label>
          <select
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold"
          >
            <option value={3}>3 Bulan</option>
            <option value={6}>6 Bulan</option>
            <option value={12}>12 Bulan (1 Tahun)</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Total Modal Disetor</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            Rp {simulationResults.totalCapitalInjected.toLocaleString("id-ID")}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Rp {monthlyBudget.toLocaleString("id-ID")} × {durationMonths} bulan
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Total Nilai Akhir Portofolio</span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            Rp {simulationResults.totalEndingValue.toLocaleString("id-ID")}
          </span>
          <span className="text-[11px] text-purple-400 font-mono mt-1 block">
            Saham: Rp {simulationResults.stockPortfolioValue.toLocaleString("id-ID")} + Sisa Kas: Rp {simulationResults.accumulatedCash.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Hasil DCA (Lot Mode)</span>
          <span
            className={`text-xl font-black font-mono mt-1 block ${
              simulationResults.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {simulationResults.netProfit >= 0 ? "+" : ""}
            Rp {simulationResults.netProfit.toLocaleString("id-ID")}
          </span>
          <span
            className={`text-[11px] font-bold font-mono mt-1 block ${
              simulationResults.returnPct >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {simulationResults.returnPct >= 0 ? "+" : ""}
            {simulationResults.returnPct.toFixed(2)}% Return
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Benchmark vs Lump Sum</span>
          <span
            className={`text-xl font-black font-mono mt-1 block ${
              simulationResults.lumpSumProfit >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {simulationResults.lumpSumProfit >= 0 ? "+" : ""}
            Rp {simulationResults.lumpSumProfit.toLocaleString("id-ID")}
          </span>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            {simulationResults.lumpSumReturnPct.toFixed(2)}% Return jika sekaligus
          </span>
        </div>
      </div>

      {/* Rincian Simulasi Bulanan Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs overflow-x-auto">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Jadwal Eksekusi Pembelian Lot & Akumulasi Kas Sisa
        </h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Periode</th>
              <th className="py-2.5 px-3">Harga Saham</th>
              <th className="py-2.5 px-3">Modal Tersedia</th>
              <th className="py-2.5 px-3">Lot Dibeli</th>
              <th className="py-2.5 px-3">Total Belanja Lot</th>
              <th className="py-2.5 px-3">Sisa Kas Rollover</th>
              <th className="py-2.5 px-3">Akumulasi Lot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {simulationResults.history.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                  {row.month}
                </td>
                <td className="py-2.5 px-3">Rp {row.price.toLocaleString("id-ID")}</td>
                <td className="py-2.5 px-3">Rp {row.availableFunds.toLocaleString("id-ID")}</td>
                <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">
                  {row.lotsPurchased} Lot
                </td>
                <td className="py-2.5 px-3">Rp {row.totalCostThisMonth.toLocaleString("id-ID")}</td>
                <td className="py-2.5 px-3 text-emerald-500 font-bold">
                  Rp {row.leftoverCash.toLocaleString("id-ID")}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                  {row.cumulativeLots} Lot
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
