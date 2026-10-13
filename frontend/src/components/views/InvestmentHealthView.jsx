import React from "react";

export default function InvestmentHealthView({ onSelectStock }) {
  // Mock data skor audit portofolio sesuai PRD Module 10 Firman
  const healthData = {
    overallScore: 84,
    grade: "Sangat Sehat (Terdiversifikasi)",
    dimensions: [
      {
        name: "Diversifikasi Emiten",
        score: 85,
        status: "Baik",
        desc: "Portofolio terdiri dari 4 emiten IDX80 dengan bobot berimbang.",
      },
      {
        name: "Konsentrasi Aset Tunggal",
        score: 78,
        status: "Cukup",
        desc: "Bobot terbesar di BBCA (34%), mendekati batas aman rekomendasi (maks. 35%).",
      },
      {
        name: "Eksposur Sektoral",
        score: 82,
        status: "Baik",
        desc: "Sektor perbankan (Financials) dominan 58%, diimbangi Infrastruktur dan Industri.",
      },
      {
        name: "Kualitas Fundamental Emiten",
        score: 92,
        status: "Sangat Baik",
        desc: "Seluruh emiten konstituen memiliki ROE > 15% dan rekam jejak dividen solid.",
      },
    ],
    risks: [
      {
        level: "Sedang",
        title: "Ketergantungan Sektor Perbankan (Financials)",
        desc: "Lebih dari 50% alokasi berada pada sektor finansial (BBCA & BBRI). Fluktuasi suku bunga acuan BI Rate dapat memberikan dampak signifikan.",
        recommendation: "Pertimbangkan diversifikasi ke sektor Consumer Non-Cyclicals atau Komoditas Energi.",
      },
      {
        level: "Rendah",
        title: "Likuiditas Saham Sangat Tinggi",
        desc: "Seluruh saham portofolio berada dalam indeks konstituen likuid IDX80 sehingga risiko likuiditas saat likuidasi posisi sangat rendah.",
        recommendation: "Pertahankan alokasi pada saham-saham likuid berkapitalisasi pasar besar.",
      },
    ],
    allocations: [
      { sector: "Financials (Perbankan)", pct: 58, color: "bg-blue-500" },
      { sector: "Infrastructures (Telekomunikasi)", pct: 24, color: "bg-emerald-500" },
      { sector: "Industrials (Konglomerasi)", pct: 18, color: "bg-purple-500" },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Investment Health & Risk Analysis
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              Sub-sistem 2 (Firman)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit risiko konsentrasi portofolio, evaluasi bobot sektoral, dan skor kesehatan investasi (Skor 0–100).
          </p>
        </div>
      </div>

      {/* Main Score & Gauge Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 rounded-full border-4 border-purple-500/20 dark:border-purple-500/30 flex items-center justify-center bg-purple-50/50 dark:bg-purple-950/20">
            <div className="text-center">
              <span className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400 block">
                {healthData.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Skor / 100
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Status Kesehatan Portofolio
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {healthData.grade}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Portofolio Anda memiliki skor diversifikasi yang baik dengan dominasi emiten berfundamental prima di Bursa Efek Indonesia.
            </p>
          </div>
        </div>

        {/* Breakdown 4 Pilar Skor */}
        <div className="w-full md:w-80 space-y-2.5 text-xs">
          {healthData.dimensions.map((dim) => (
            <div key={dim.name} className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{dim.name}</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {dim.score} / 100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600 dark:bg-purple-400"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alokasi Sektor & Audit Konsentrasi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bobot Sektor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Distribusi Eksposur Sektoral
          </h3>
          <div className="space-y-3">
            {healthData.allocations.map((item) => (
              <div key={item.sector} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{item.sector}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{item.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temuan Risiko & Rekomendasi Edukasi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Temuan Risiko & Rekomendasi Portofolio
          </h3>
          <div className="space-y-2.5">
            {healthData.risks.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{r.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.level === "Sedang"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    Risiko {r.level}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  {r.desc}
                </p>
                <p className="text-purple-600 dark:text-purple-400 text-[11px] font-medium pt-1">
                  Saran: {r.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
