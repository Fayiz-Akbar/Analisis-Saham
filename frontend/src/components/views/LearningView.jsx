import React, { useState } from "react";

const LEARNING_MODULES = [
  {
    level: 1,
    title: "Pengenalan Pasar Modal & Saham",
    category: "Level 1 • Fondasi Dasar",
    summary: "Memahami konsep saham sebagai bukti kepemilikan bisnis, mekanisme Bursa Efek Indonesia (IDX), dan satuan perdagangan lot.",
    quiz: {
      question: "Berapa jumlah lembar saham yang terkandung dalam 1 lot di Bursa Efek Indonesia (IDX)?",
      options: ["10 lembar", "50 lembar", "100 lembar", "500 lembar"],
      correct: 2,
      explanation: "Berdasarkan peraturan resmi BEI (IDX), 1 satuan lot setara dengan tepat 100 lembar saham.",
    },
  },
  {
    level: 2,
    title: "Membaca Laporan Keuangan",
    category: "Level 2 • Analisis Keuangan",
    summary: "Membedah Neraca (Balance Sheet), Laporan Laba Rugi (Income Statement), dan Arus Kas (Cash Flow) perusahaan.",
    quiz: {
      question: "Laporan keuangan mana yang menyajikan aset, liabilitas, dan ekuitas emiten pada suatu titik waktu tertentu?",
      options: ["Laporan Arus Kas", "Laporan Neraca (Balance Sheet)", "Laporan Laba Rugi", "Catatan Kaki"],
      correct: 1,
      explanation: "Neraca (Balance Sheet) mencerminkan posisi aset, hutang (liabilitas), dan modal bersih (ekuitas) perusahaan pada tanggal pelaporan.",
    },
  },
  {
    level: 3,
    title: "4 Pilar Analisis Fundamental",
    category: "Level 3 • Rasio Inti",
    summary: "Kupas tuntas rasio Valuasi (PER, PBV), Profitabilitas (ROE, ROA), Solvabilitas (DER), dan Dividen Yield.",
    quiz: {
      question: "Rasio mana yang mengukur seberapa efisien manajemen menghasilkan laba bersih dari modal ekuitas pemegang saham?",
      options: ["Price to Book Value (PBV)", "Debt to Equity Ratio (DER)", "Return on Equity (ROE)", "Price to Earnings Ratio (PER)"],
      correct: 2,
      explanation: "ROE (Return on Equity) mengukur persentase laba bersih yang dihasilkan dari total modal ekuitas investor.",
    },
  },
  {
    level: 4,
    title: "Strategi Dollar-Cost Averaging (DCA)",
    category: "Level 4 • Strategi Akumulasi",
    summary: "Manajemen disiplin investasi berkala, mitigasi volatilitas harga jangka pendek, dan mekanisme sisa kas lot.",
    quiz: {
      question: "Apa keuntungan utama dari strategi investasi rutin Dollar-Cost Averaging (DCA)?",
      options: [
        "Selalu membeli di harga terendah pasar",
        "Menghilangkan risiko psikologis dan meratakan harga beli rata-rata",
        "Menjamin return 100% dalam satu tahun",
        "Bebas dari biaya transaksi broker",
      ],
      correct: 1,
      explanation: "DCA meratakan harga perolehan rata-rata (averaging) serta menghindari jebakan emosional timing pasar.",
    },
  },
  {
    level: 5,
    title: "Manajemen Portofolio & Audit Risiko",
    category: "Level 5 • Alokasi & Diversifikasi",
    summary: "Diversifikasi sektoral, pembatasan alokasi saham tunggal, dan cara menghitung skor kesehatan investasi.",
    quiz: {
      question: "Mengapa investor sebaiknya tidak menempatkan 100% modal portofolio hanya pada 1 saham saja?",
      options: [
        "Karena dilarang oleh bursa",
        "Untuk memitigasi risiko kegagalan bisnis spesifik (unsystematic risk)",
        "Agar mendapatkan dividen lebih banyak",
        "Supaya bisa trading setiap hari",
      ],
      correct: 1,
      explanation: "Diversifikasi bertujuan menurunkan risiko spesifik perusahaan (unsystematic risk) sehingga jika 1 emiten bermasalah, portofolio tetap terlindungi.",
    },
  },
  {
    level: 6,
    title: "Investasi Lanjutan & Psikologi Pasar",
    category: "Level 6 • Masteri Investor",
    summary: "Mengendalikan bias emosional (FOMO, Greed, Fear) serta mengevaluasi konsistensi faktual informasi pasar.",
    quiz: {
      question: "Perilaku membeli saham secara terburu-buru hanya karena harga sedang melonjak tinggi disebut?",
      options: ["Value Investing", "FOMO (Fear of Missing Out)", "Cut Loss", "Rebalancing"],
      correct: 1,
      explanation: "FOMO (Fear of Missing Out) adalah bias emosional di mana investor takut tertinggal reli harga tanpa melakukan riset fundamental mendalam.",
    },
  },
];

export default function LearningView() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState({});

  const currentModule = LEARNING_MODULES.find((m) => m.level === activeLevel);

  const handleSelectOption = (lvl, optIdx) => {
    setSelectedAnswers({ ...selectedAnswers, [lvl]: optIdx });
  };

  const handleSubmitQuiz = (lvl) => {
    setSubmittedQuiz({ ...submittedQuiz, [lvl]: true });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Investment Learning & Quiz Curriculum
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              Sub-sistem 2 (Firman)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kurikulum edukasi pasar modal terstruktur 6 level berjenjang dengan evaluasi kuis interaktif per materi.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
          Progres Belajar: <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{Object.keys(submittedQuiz).length}</span> dari 6 Modul Selesai
        </div>
      </div>

      {/* 6-Level Step Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LEARNING_MODULES.map((m) => {
          const isSelected = activeLevel === m.level;
          const isPassed = submittedQuiz[m.level];
          return (
            <button
              key={m.level}
              onClick={() => setActiveLevel(m.level)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Level {m.level}</span>
                {isPassed && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
                    Selesai
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold mt-1 block line-clamp-1">
                {m.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Module Content & Interactive Quiz Card */}
      {currentModule && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              {currentModule.category}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentModule.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {currentModule.summary}
            </p>
          </div>

          {/* Interactive Quiz Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Kuis Evaluasi Pemahaman Modul
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                1 Soal Interaktif
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentModule.quiz.question}
            </p>

            {/* Pilihan Jawaban */}
            <div className="space-y-2">
              {currentModule.quiz.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentModule.level] === idx;
                const isSubmitted = submittedQuiz[currentModule.level];
                const isCorrect = idx === currentModule.quiz.correct;

                let optStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400";
                if (isSelected && !isSubmitted) {
                  optStyle = "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 font-bold";
                } else if (isSubmitted) {
                  if (isCorrect) {
                    optStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                  } else if (isSelected && !isCorrect) {
                    optStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(currentModule.level, idx)}
                    className={`w-full p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && isCorrect && (
                      <span className="text-[10px] font-bold text-emerald-500">Benar</span>
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <span className="text-[10px] font-bold text-rose-500">Salah</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tombol Submit & Hasil Penjelasan */}
            {!submittedQuiz[currentModule.level] ? (
              <div className="pt-2">
                <button
                  disabled={selectedAnswers[currentModule.level] === undefined}
                  onClick={() => handleSubmitQuiz(currentModule.level)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all cursor-pointer"
                >
                  Kirim Jawaban Kuis
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs space-y-1">
                <span className="font-bold text-purple-900 dark:text-purple-300 block">
                  Penjelasan Konsep Finansial:
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {currentModule.quiz.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
