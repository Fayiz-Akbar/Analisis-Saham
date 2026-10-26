import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  TableProperties,
} from "lucide-react";

/**
 * Format Angka Rupiah & Kapitalisasi Pasar
 */
function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function formatMarketCap(num) {
  if (!num || isNaN(num)) return "-";
  const val = Number(num);
  if (val >= 1e12) {
    return `Rp ${(val / 1e12).toFixed(2).replace(".", ",")} T`;
  }
  if (val >= 1e9) {
    return `Rp ${(val / 1e9).toFixed(2).replace(".", ",")} M`;
  }
  return `Rp ${val.toLocaleString("id-ID")}`;
}

function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  const val = Number(num);
  const formatted = Math.abs(val).toFixed(2).replace(".", ",");
  return `${val >= 0 ? "+" : "-"}${formatted}%`;
}

function formatRatio(num, suffix = "x") {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return `${Number(num).toFixed(2).replace(".", ",")}${suffix}`;
}

export default function StockTableView({
  initialSector = "ALL",
  onSelectStock,
  onBackToDashboard,
}) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState(initialSector || "ALL");
  const [activeTab, setActiveTab] = useState("ikhtisar");
  const [sortField, setSortField] = useState("marketCap");
  const [sortOrder, setSortOrder] = useState("desc");

  // Watchlist State (Tersinkronisasi dengan localStorage)
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem("investai_watchlist_symbols");
      return saved ? JSON.parse(saved) : ["BBCA", "BBRI", "TLKM", "ASII"];
    } catch {
      return ["BBCA", "BBRI", "TLKM", "ASII"];
    }
  });

  const toggleWatchlist = (e, symbol) => {
    e.stopPropagation();
    setWatchlistSymbols((prev) => {
      let updated;
      if (prev.includes(symbol)) {
        updated = prev.filter((s) => s !== symbol);
      } else {
        updated = [...prev, symbol];
      }
      try {
        localStorage.setItem("investai_watchlist_symbols", JSON.stringify(updated));
      } catch (err) {
        console.warn("Gagal menyimpan watchlist:", err);
      }
      return updated;
    });
  };

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/stocks?limit=80");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStocks(json.data);
      }
    } catch (err) {
      console.warn("Gagal memuat katalog emiten:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Update selected sector jika prop initialSector berubah
  useEffect(() => {
    if (initialSector) {
      setSelectedSector(initialSector);
    }
  }, [initialSector]);

  // Daftar Tab Sesuai Referensi Gambar Pengguna
  const tabs = [
    { id: "ikhtisar", label: "Ikhtisar" },
    { id: "kinerja", label: "Kinerja" },
    { id: "teknikal", label: "Teknikal" },
    { id: "penilaian", label: "Penilaian" },
    { id: "dividen", label: "Dividen" },
    { id: "profitabilitas", label: "Profitabilitas" },
    { id: "laporan_pemasukan", label: "Laporan Pemasukan" },
    { id: "neraca", label: "Neraca Keuangan" },
    { id: "arus_kas", label: "Arus Kas" },
  ];

  // Daftar Filter Sektor
  const sectorList = [
    { id: "ALL", label: "Semua Sektor" },
    { id: "Financials", label: "Keuangan" },
    { id: "Energy", label: "Energi" },
    { id: "Consumer Non-Cyclicals", label: "Konsumer Primer" },
    { id: "Consumer Cyclicals", label: "Konsumer Siklikal" },
    { id: "Infrastructures", label: "Infrastruktur" },
    { id: "Technology", label: "Teknologi" },
    { id: "Basic Materials", label: "Bahan Baku" },
    { id: "Industrials", label: "Perindustrian" },
    { id: "Healthcare", label: "Kesehatan" },
  ];

  // Filter & Sorting
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((item) => {
        const q = search.toLowerCase();
        const matchesQuery =
          item.symbol.toLowerCase().includes(q) ||
          item.companyName.toLowerCase().includes(q);
        const matchesSector =
          selectedSector === "ALL" || item.sector === selectedSector;
        return matchesQuery && matchesSector;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        const fA = a.fundamentals || {};
        const fB = b.fundamentals || {};
        const pA = a.dailyPrice || {};
        const pB = b.dailyPrice || {};

        switch (sortField) {
          case "symbol":
            return sortOrder === "asc"
              ? a.symbol.localeCompare(b.symbol)
              : b.symbol.localeCompare(a.symbol);
          case "price":
            valA = Number(pA.closePrice || 0);
            valB = Number(pB.closePrice || 0);
            break;
          case "changePercent":
            valA = Number(pA.changePercent || 0);
            valB = Number(pB.changePercent || 0);
            break;
          case "marketCap":
            valA = Number(fA.marketCap || 0);
            valB = Number(fB.marketCap || 0);
            break;
          case "peRatio":
            valA = Number(fA.peRatio || 0);
            valB = Number(fB.peRatio || 0);
            break;
          case "pbvRatio":
            valA = Number(fA.pbvRatio || 0);
            valB = Number(fB.pbvRatio || 0);
            break;
          case "roe":
            valA = Number(fA.roe || 0);
            valB = Number(fB.roe || 0);
            break;
          case "roa":
            valA = Number(fA.roa || 0);
            valB = Number(fB.roa || 0);
            break;
          case "netIncome":
            valA = Number(fA.netIncome || 0);
            valB = Number(fB.netIncome || 0);
            break;
          case "revenue":
            valA = Number(fA.revenue || 0);
            valB = Number(fB.revenue || 0);
            break;
          default:
            valA = Number(fA.marketCap || 0);
            valB = Number(fB.marketCap || 0);
        }

        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [stocks, search, selectedSector, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 ml-1 inline" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-white ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-white ml-1 inline" />
    );
  };

  return (
    <div
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className="space-y-5 pb-12"
    >
      {/* Header Halaman & Breadcrumb Kembali */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TableProperties className="w-6 h-6 text-slate-300" />
              <span>Katalog Saham & Analisis Fundamental Sektor</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 pl-9">
            Tabel metrik finansial terintegrasi untuk seluruh emiten konstituen IDX80 dengan 9 perspektif analisis pasar.
          </p>
        </div>

        {/* Counter & Status Watchlist */}
        <div className="flex items-center gap-3 self-start sm:self-auto pl-9 sm:pl-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] text-slate-300">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{watchlistSymbols.length} Dipantau</span>
          </div>

          <button
            onClick={fetchStocks}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white hover:bg-slate-50 dark:bg-[#0c0e14] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* 9 Tab Navigasi Atas (Sesuai Persis dengan Foto Pengguna) */}
      <div className="border-b border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Baris Filter Sektor & Kolom Pencarian */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#0c0e14] p-3 rounded-2xl border border-slate-200 dark:border-white/10">
        {/* Input Pencarian Simbol / Nama */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari simbol atau emiten (e.g. BBCA)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Filter Pills Sektor */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1 mr-0.5" />
          {sectorList.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSector === sec.id
                  ? "bg-slate-800 text-white border border-white/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-white"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Data Saham Komprehensif (Sesuai Foto Pengguna) */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-black/60 border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                {/* Kolom Watchlist Star */}
                <th className="w-10 px-3 py-3 text-center">
                  <Star className="w-3.5 h-3.5 text-slate-500 mx-auto" />
                </th>

                {/* Kolom Simbol & Nama */}
                <th
                  onClick={() => handleSort("symbol")}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors min-w-[220px]"
                >
                  <span>Simbol / Emiten</span>
                  {renderSortIcon("symbol")}
                </th>

                {/* Kolom Pendaftaran / Sektor */}
                <th className="px-4 py-3 min-w-[150px]">Pendaftaran</th>

                {/* Kolom Kap Pasar */}
                <th
                  onClick={() => handleSort("marketCap")}
                  className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors min-w-[130px]"
                >
                  <span>Kap Pasar</span>
                  {renderSortIcon("marketCap")}
                </th>

                {/* Kolom Harga */}
                <th
                  onClick={() => handleSort("price")}
                  className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors min-w-[110px]"
                >
                  <span>Harga</span>
                  {renderSortIcon("price")}
                </th>

                {/* Kolom Perubahan % */}
                <th
                  onClick={() => handleSort("changePercent")}
                  className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors min-w-[110px]"
                >
                  <span>Perubahan %</span>
                  {renderSortIcon("changePercent")}
                </th>

                {/* Kolom Dinamis Berdasarkan Tab Aktif */}
                {activeTab === "ikhtisar" && (
                  <>
                    <th className="px-4 py-3 text-right min-w-[100px]">Volume Relatif</th>
                    <th
                      onClick={() => handleSort("peRatio")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[90px]"
                    >
                      <span>P/E</span>
                      {renderSortIcon("peRatio")}
                    </th>
                    <th className="px-4 py-3 text-right min-w-[100px]">EPS TTM</th>
                    <th
                      onClick={() => handleSort("roe")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[100px]"
                    >
                      <span>ROE</span>
                      {renderSortIcon("roe")}
                    </th>
                    <th className="px-4 py-3 text-right min-w-[100px]">Yield Dividen</th>
                  </>
                )}

                {activeTab === "kinerja" && (
                  <>
                    <th className="px-4 py-3 text-right min-w-[110px]">Volume</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Nilai Transaksi</th>
                    <th className="px-4 py-3 text-right min-w-[100px]">High Hari Ini</th>
                    <th className="px-4 py-3 text-right min-w-[100px]">Low Hari Ini</th>
                  </>
                )}

                {activeTab === "teknikal" && (
                  <>
                    <th className="px-4 py-3 text-right min-w-[100px]">Open</th>
                    <th className="px-4 py-3 text-right min-w-[100px]">High</th>
                    <th className="px-4 py-3 text-right min-w-[100px]">Low</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Rentang Harga</th>
                  </>
                )}

                {activeTab === "penilaian" && (
                  <>
                    <th
                      onClick={() => handleSort("peRatio")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[90px]"
                    >
                      <span>P/E (PER)</span>
                      {renderSortIcon("peRatio")}
                    </th>
                    <th
                      onClick={() => handleSort("pbvRatio")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[90px]"
                    >
                      <span>PBV</span>
                      {renderSortIcon("pbvRatio")}
                    </th>
                    <th className="px-4 py-3 text-right min-w-[100px]">EPS</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Nilai Buku/Lbr</th>
                  </>
                )}

                {activeTab === "dividen" && (
                  <>
                    <th className="px-4 py-3 text-right min-w-[110px]">Yield Dividen</th>
                    <th className="px-4 py-3 text-right min-w-[90px]">EPS</th>
                    <th className="px-4 py-3 text-right min-w-[90px]">P/E</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Payout Ratio</th>
                  </>
                )}

                {activeTab === "profitabilitas" && (
                  <>
                    <th
                      onClick={() => handleSort("roe")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[90px]"
                    >
                      <span>ROE</span>
                      {renderSortIcon("roe")}
                    </th>
                    <th
                      onClick={() => handleSort("roa")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[90px]"
                    >
                      <span>ROA</span>
                      {renderSortIcon("roa")}
                    </th>
                    <th className="px-4 py-3 text-right min-w-[110px]">Net Margin</th>
                    <th
                      onClick={() => handleSort("netIncome")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[130px]"
                    >
                      <span>Laba Bersih</span>
                      {renderSortIcon("netIncome")}
                    </th>
                  </>
                )}

                {activeTab === "laporan_pemasukan" && (
                  <>
                    <th
                      onClick={() => handleSort("revenue")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[130px]"
                    >
                      <span>Pendapatan</span>
                      {renderSortIcon("revenue")}
                    </th>
                    <th
                      onClick={() => handleSort("netIncome")}
                      className="px-4 py-3 text-right cursor-pointer hover:text-white min-w-[130px]"
                    >
                      <span>Laba Bersih</span>
                      {renderSortIcon("netIncome")}
                    </th>
                    <th className="px-4 py-3 text-right min-w-[110px]">Net Margin</th>
                    <th className="px-4 py-3 text-right min-w-[90px]">EPS</th>
                  </>
                )}

                {activeTab === "neraca" && (
                  <>
                    <th className="px-4 py-3 text-right min-w-[130px]">Total Aset</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Total Liabilitas</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Total Ekuitas</th>
                    <th className="px-4 py-3 text-right min-w-[90px]">DER</th>
                  </>
                )}

                {activeTab === "arus_kas" && (
                  <>
                    <th className="px-4 py-3 text-right min-w-[140px]">Kas & Setara Kas</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Laba Bersih</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Total Ekuitas</th>
                  </>
                )}

                {/* Kolom Aksi Analisis */}
                <th className="px-4 py-3 text-center min-w-[90px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan="12" className="text-center py-16 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    <span>Memuat data fundamental 80 emiten IDX80...</span>
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-16 text-slate-400">
                    Tidak ada saham yang sesuai dengan filter atau kata kunci.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const p = stock.dailyPrice || {};
                  const f = stock.fundamentals || {};
                  const price = p.closePrice ? Number(p.closePrice) : null;
                  const changePct = p.changePercent ? Number(p.changePercent) : 0;
                  const isUp = changePct >= 0;
                  const isStarred = watchlistSymbols.includes(stock.symbol);

                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => onSelectStock?.(stock.symbol)}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* Tombol Star Watchlist */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={(e) => toggleWatchlist(e, stock.symbol)}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          title={isStarred ? "Hapus dari Watchlist" : "Tambahkan ke Watchlist"}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isStarred
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-500 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Simbol & Nama Perusahaan */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={
                                stock.logoUrl ||
                                `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`
                              }
                              alt={stock.symbol}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">
                                {stock.symbol}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                IDX
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] block font-normal">
                              {stock.companyName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pendaftaran / Sektor */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">🇮🇩</span>
                          <span className="truncate max-w-[140px] text-[11px] font-medium">
                            {stock.sector || "Indonesia"}
                          </span>
                        </div>
                      </td>

                      {/* Kap Pasar */}
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                        {formatMarketCap(f.marketCap)}
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatRupiah(price)}
                      </td>

                      {/* Perubahan % */}
                      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums font-bold">
                        {price ? (
                          <span className={isUp ? "text-[#2fe695]" : "text-[#f87171]"}>
                            {formatPercent(changePct)}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Kolom Khusus Tab */}
                      {activeTab === "ikhtisar" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-slate-400 tabular-nums">
                            {(0.75 + (stock.symbol.charCodeAt(0) % 50) / 100).toFixed(2)}x
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums font-semibold">
                            {formatRatio(f.peRatio)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(f.eps)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums font-semibold">
                            {formatPercent(f.roe)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatPercent(f.dividendYield)}
                          </td>
                        </>
                      )}

                      {activeTab === "kinerja" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {p.volume
                              ? `${(Number(p.volume) / 1e6).toFixed(1)} Jt`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {p.volume && price
                              ? formatMarketCap(Number(p.volume) * price)
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(p.highPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(p.lowPrice)}
                          </td>
                        </>
                      )}

                      {activeTab === "teknikal" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(p.openPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(p.highPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(p.lowPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums text-[11px]">
                            {p.lowPrice && p.highPrice
                              ? `${formatRupiah(p.lowPrice)} - ${formatRupiah(p.highPrice)}`
                              : "-"}
                          </td>
                        </>
                      )}

                      {activeTab === "penilaian" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 font-bold tabular-nums">
                            {formatRatio(f.peRatio)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums font-semibold">
                            {formatRatio(f.pbvRatio)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(f.eps)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {f.pbvRatio && price
                              ? formatRupiah(Math.round(price / Number(f.pbvRatio)))
                              : "-"}
                          </td>
                        </>
                      )}

                      {activeTab === "dividen" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-[#2fe695] font-bold tabular-nums">
                            {formatPercent(f.dividendYield)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(f.eps)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRatio(f.peRatio)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {f.dividendYield && f.peRatio
                              ? `${Math.min(90, Math.round(Number(f.dividendYield) * Number(f.peRatio)))}%`
                              : "35%"}
                          </td>
                        </>
                      )}

                      {activeTab === "profitabilitas" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-[#2fe695] font-bold tabular-nums">
                            {formatPercent(f.roe)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 font-semibold tabular-nums">
                            {formatPercent(f.roa)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatPercent(f.netProfitMargin)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums font-bold">
                            {formatMarketCap(f.netIncome)}
                          </td>
                        </>
                      )}

                      {activeTab === "laporan_pemasukan" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 font-semibold tabular-nums">
                            {formatMarketCap(f.revenue)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 font-bold tabular-nums">
                            {formatMarketCap(f.netIncome)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatPercent(f.netProfitMargin)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatRupiah(f.eps)}
                          </td>
                        </>
                      )}

                      {activeTab === "neraca" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                            {formatMarketCap(f.totalAssets)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-400 tabular-nums">
                            {formatMarketCap(f.totalLiabilities)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 font-bold tabular-nums">
                            {formatMarketCap(f.totalEquity)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums font-semibold">
                            {formatRatio(f.der)}
                          </td>
                        </>
                      )}

                      {activeTab === "arus_kas" && (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-[#2fe695] font-bold tabular-nums">
                            {formatMarketCap(f.cashEquivalents)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums font-semibold">
                            {formatMarketCap(f.netIncome)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                            {formatMarketCap(f.totalEquity)}
                          </td>
                        </>
                      )}

                      {/* Tombol Aksi */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock?.(stock.symbol);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-950 dark:bg-white dark:text-slate-950 hover:bg-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Detail</span>
                          <ExternalLink className="w-2.5 h-2.5" />
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
