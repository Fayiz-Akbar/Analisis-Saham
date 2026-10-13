import React from "react";
import idxCircleImg from "../../assets/idx-circle.png";

/**
 * SearchResultItem: Komponen baris hasil pencarian saham bergaya TradingView
 * dengan logo sirkular emiten, ticker biru/putih, dan badge resmi IDX (logo bulat marun).
 */
export default function SearchResultItem({
  stock,
  isSelected,
  onSelect,
  darkMode,
}) {
  return (
    <div
      onClick={() => onSelect(stock.symbol)}
      className={`px-5 py-2.5 flex items-center justify-between gap-4 cursor-pointer transition-colors border-b last:border-b-0 ${
        darkMode
          ? isSelected
            ? "bg-[#2a2e39] border-[#2a2e39]"
            : "hover:bg-[#2a2e39]/50 border-[#2a2e39]/40 text-[#d1d4dc]"
          : isSelected
          ? "bg-blue-50/80 border-slate-100 text-slate-900"
          : "hover:bg-slate-50 border-slate-100 text-slate-800"
      }`}
    >
      {/* Kolom Kiri: Logo Bundar + Ticker + Nama Perusahaan */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Logo Lingkaran Sesuai Referensi TradingView */}
        <div className="w-7 h-7 rounded-full bg-white p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
          <img
            src={stock.logoUrl || `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`}
            alt={stock.symbol}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.innerText = stock.symbol.slice(0, 2);
            }}
          />
        </div>

        {/* Ticker Simbol (Biru di Light Mode / Putih di Dark Mode) */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span
            className={`font-mono font-bold text-sm tracking-tight w-16 sm:w-20 shrink-0 ${
              darkMode ? "text-white" : "text-[#2962ff]"
            }`}
          >
            {stock.symbol}
          </span>

          {/* Nama Lengkap Perusahaan */}
          <span
            className={`text-xs truncate ${
              darkMode ? "text-[#d1d4dc]" : "text-slate-700"
            }`}
          >
            {stock.companyName}
          </span>
        </div>
      </div>

      {/* Kolom Kanan: Tag 'stock' + Badge 'IDX' Berlogo Bulat Marun Resmi BEI */}
      <div className="flex items-center gap-2.5 shrink-0 text-xs select-none">
        {/* Tag Tipe Instrumen (stock) */}
        <span
          className={`text-[11px] font-medium lowercase ${
            darkMode ? "text-[#787b86]" : "text-slate-400"
          }`}
        >
          {stock.type || "stock"}
        </span>

        {/* Badge Bursa Efek Indonesia (IDX + Logo Bulat Marun) Sesuai Referensi Pengguna */}
        <div className="flex items-center gap-1.5 font-bold tracking-wider">
          <span
            className={`text-xs font-semibold ${
              darkMode ? "text-[#d1d4dc]" : "text-slate-800"
            }`}
          >
            IDX
          </span>

          {/* Ikon Bulat Marun Resmi Bursa Efek Indonesia */}
          <img
            src={idxCircleImg}
            alt="Bursa Efek Indonesia"
            className="w-4 h-4 rounded-full object-cover shadow-2xs shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
