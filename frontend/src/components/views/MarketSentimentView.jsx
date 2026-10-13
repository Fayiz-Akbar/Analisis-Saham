import React from "react";

export default function MarketSentimentView({ onSelectStock }) {
  const globalIndices = [
    { name: "IHSG (Indonesia)", value: "7,520.60", change: "+0.42%", isUp: true, region: "Domestik" },
    { name: "S&P 500 (US)", value: "5,815.03", change: "+0.77%", isUp: true, region: "Amerika" },
    { name: "NASDAQ (US)", value: "18,342.94", change: "+0.91%", isUp: true, region: "Amerika" },
    { name: "Nikkei 225 (Jepang)", value: "39,605.80", change: "+0.57%", isUp: true, region: "Asia" },
    { name: "Hang Seng (Hong Kong)", value: "21,092.87", change: "-1.38%", isUp: false, region: "Asia" },
    { name: "Straits Times (Singapura)", value: "3,584.74", change: "+0.28%", isUp: true, region: "Asia" },
  ];

  const commodities = [
    { name: "Minyak Mentah (Brent)", price: "$79.04 / bbl", change: "-0.45%", isUp: false },
    { name: "Emas (Gold)", price: "$2,657.20 / oz", change: "+0.62%", isUp: true },
    { name: "Batubara (Newcastle)", price: "$146.50 / ton", change: "+1.10%", isUp: true },
    { name: "CPO Kelapa Sawit (MYR)", price: "4,280 / ton", change: "+0.85%", isUp: true },
    { name: "Nikel (LME)", price: "$17,520 / ton", change: "-0.92%", isUp: false },
    { name: "Tembaga (Copper)", price: "$4.42 / lb", change: "+0.34%", isUp: true },
  ];

  const marketNews = [
    {
      id: 1,
      title: "Bank Indonesia Pertahankan BI-Rate di Level 6.00% untuk Jaga Stabilitas Rupiah",
      source: "IDX Channel",
      time: "2 jam lalu",
      sentiment: "Netral",
      summary: "Keputusan RDG BI konsisten dengan penguatan stabilitas nilai tukar Rupiah dan sasaran inflasi 2024–2025.",
    },
    {
      id: 2,
      title: "Laba Bersih Perbankan Big 4 Tumbuh Dobel Digit Didorong Efisiensi dan Pertumbuhan Kredit",
      source: "Bisnis Indonesia",
      time: "4 jam lalu",
      sentiment: "Positif",
      summary: "BBCA, BMRI, dan BBRI mencatatkan pertumbuhan kredit yang solid di tengah suku bunga tinggi.",
    },
    {
      id: 3,
      title: "Harga Minyak Dunia Terkoreksi Pasca Rilis Proyeksi Permintaan Energi Global",
      source: "Kontan",
      time: "6 jam lalu",
      sentiment: "Negatif",
      summary: "Pasar energi mencermati kekhawatiran pelambatan konsumsi bahan bakar di pasar manufaktur global.",
    },
    {
      id: 4,
      title: "Arus Dana Asing (Net Foreign Inflow) Masuk Rp 1.4 Triliun ke Saham Finansial IDX",
      source: "CNBC Indonesia",
      time: "7 jam lalu",
      sentiment: "Positif",
      summary: "Investor asing memborong saham likuid berfundamental defensif pada perdagangan bursa hari ini.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Global Market & Sentiment Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pemantauan pergerakan indeks IHSG, bursa saham global, komoditas strategis acuan, dan ringkasan sentimen berita pasar modal.
        </p>
      </div>

      {/* 1. Indeks Saham Utama & Global */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Indeks Bursa Utama & Global
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {globalIndices.map((idx) => (
            <div
              key={idx.name}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase block">{idx.region}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                {idx.name}
              </span>
              <div className="flex items-baseline justify-between pt-1 font-mono">
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{idx.value}</span>
                <span
                  className={`text-xs font-bold ${
                    idx.isUp ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {idx.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Komoditas Acuan Strategis */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Komoditas Strategis Acuan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {commodities.map((item) => (
            <div
              key={item.name}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate">
                {item.name}
              </span>
              <div className="flex items-baseline justify-between pt-1 font-mono">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.price}</span>
                <span
                  className={`text-[11px] font-bold ${
                    item.isUp ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Ringkasan Sentimen Berita Pasar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Umpan Berita & Klasifikasi Sentimen Pasar
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Sentimen Rata-rata Pasar: <strong className="text-emerald-500">Cenderung Positif</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketNews.map((news) => (
            <div
              key={news.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    news.sentiment === "Positif"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60"
                      : news.sentiment === "Negatif"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  [{news.sentiment}]
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {news.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {news.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
