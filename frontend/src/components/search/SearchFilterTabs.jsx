import React from "react";

/**
 * SearchFilterTabs: Komponen tab kategori utama dan filter instrumen bergaya TradingView
 */
export default function SearchFilterTabs({
  primaryTab,
  setPrimaryTab,
  activeCategory,
  setActiveCategory,
  darkMode,
}) {
  const primaryTabs = [
    { id: "symbols", label: "Simbol-Simbol" },
    { id: "ideas", label: "Ide-Ide" },
    { id: "scripts", label: "Skrip" },
    { id: "news", label: "Berita" },
  ];

  const categories = [
    { id: "ALL", label: "Seluruhnya" },
    { id: "STOCKS", label: "Saham" },
    { id: "FINANCIALS", label: "Perbankan" },
    { id: "ENERGY", label: "Energi" },
    { id: "CONSUMER", label: "Konsumer" },
    { id: "TECH", label: "Teknologi" },
    { id: "INFRA", label: "Infrastruktur" },
    { id: "BASIC", label: "Bahan Baku" },
    { id: "INDEX", label: "Indeks" },
  ];

  return (
    <div className="space-y-3 px-5 pt-3 pb-2 select-none">
      {/* 1. Primary Tabs (Simbol-Simbol, Ide-Ide, Skrip, Berita) */}
      <div
        className={`flex items-center gap-6 border-b text-xs font-semibold ${
          darkMode ? "border-[#2a2e39] text-[#787b86]" : "border-slate-200 text-slate-500"
        }`}
      >
        {primaryTabs.map((tab) => {
          const isActive = primaryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPrimaryTab(tab.id)}
              className={`pb-2.5 transition-colors relative cursor-pointer ${
                isActive
                  ? darkMode
                    ? "text-white font-bold"
                    : "text-slate-900 font-bold"
                  : darkMode
                  ? "hover:text-[#d1d4dc]"
                  : "hover:text-slate-700"
              }`}
            >
              {tab.label}
              {/* Active Indicator Underline */}
              {isActive && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                    darkMode ? "bg-white" : "bg-blue-600"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Filter Category Pills (Seluruhnya, Saham, Perbankan, dll.) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? darkMode
                    ? "bg-white text-slate-950 shadow-xs"
                    : "bg-slate-900 text-white shadow-xs"
                  : darkMode
                  ? "bg-[#2a2e39]/60 hover:bg-[#2a2e39] text-[#d1d4dc]"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
