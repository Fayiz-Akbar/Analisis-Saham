import React from "react";
import SubsystemComingSoonPage from "./SubsystemComingSoonPage";

const EDUCATION_SIMULATION_TABS = [
  { id: "portofolio", label: "Portfolio" },
  { id: "simulasi", label: "Simulasi" },
  { id: "learning", label: "Learning" },
  { id: "ai", label: "AI Assistant" },
];

export function PortfolioComingSoonPage({ onNavigateTab, onBackToDashboard }) {
  return (
    <SubsystemComingSoonPage
      subsystemLabel="Sub-Sistem Simulasi Investasi"
      subtitle="Paper Trading • Portofolio Virtual & PHS"
      title="Portfolio & Investment Health"
      routePath="/portofolio"
      description="Halaman portofolio virtual dan audit kesehatan portofolio sedang dalam tahap pengembangan. Seluruh pencatatan kepemilikan saham berbasis satuan lot (100 lembar), riwayat transaksi virtual, dan skor kesehatan portofolio akan hadir segera."
      roadmapHighlights={[
        {
          code: "01",
          title: "Transaksi Virtual Berbasis Lot",
          desc: "Simulasi beli dan jual emiten BEI menggunakan saldo modal virtual tanpa risiko uang riil.",
        },
        {
          code: "02",
          title: "Kepemilikan & Average Buy Price",
          desc: "Rekapitulasi lot aktif, harga beli rata-rata tertimbang, serta laba/rugi realized dan unrealized.",
        },
        {
          code: "03",
          title: "Portfolio Health Score (PHS)",
          desc: "Evaluasi komposit kesehatan portofolio berdasarkan performa ROI, diversifikasi, dan volatilitas.",
        },
        {
          code: "04",
          title: "Riwayat Transaksi & Alokasi Sektor",
          desc: "Log kronologis transaksi virtual beserta pemetaan komposisi bobot saham dan sektor industri.",
        },
      ]}
      relatedPages={EDUCATION_SIMULATION_TABS}
      activeTabId="portofolio"
      onNavigateTab={onNavigateTab}
      onBackToDashboard={onBackToDashboard}
    />
  );
}

export function SimulationComingSoonPage({ onNavigateTab, onBackToDashboard }) {
  return (
    <SubsystemComingSoonPage
      subsystemLabel="Sub-Sistem Simulasi Investasi"
      subtitle="Backtesting • Realistic Lot Mode"
      title="Simulasi Investasi & DCA"
      routePath="/simulasi"
      description="Halaman simulator strategi investasi berkala (Dollar-Cost Averaging) dan backtesting historis sedang disiapkan. Nantinya Anda dapat menguji skenario akumulasi saham BEI secara terisolasi dari portofolio virtual utama."
      roadmapHighlights={[
        {
          code: "01",
          title: "DCA Realistic Lot Mode",
          desc: "Pembelian rutin kelipatan 100 lembar (1 lot penuh) berbasis data harga historis aktual BEI.",
        },
        {
          code: "02",
          title: "Akumulasi Sisa Kas (Cash Rollover)",
          desc: "Sisa dana bulanan yang belum mencukupi 1 lot diteruskan otomatis ke alokasi periode berikutnya.",
        },
        {
          code: "03",
          title: "Perbandingan DCA vs Lump Sum",
          desc: "Komparasi hasil investasi berkala terhadap pembelian sekaligus pada rentang 6 hingga 36 bulan.",
        },
        {
          code: "04",
          title: "Rincian Timeline & Kurva Akumulasi",
          desc: "Grafik pertumbuhan modal disetor dibanding nilai pasar serta tabel transaksi bulanan lengkap.",
        },
      ]}
      relatedPages={EDUCATION_SIMULATION_TABS}
      activeTabId="simulasi"
      onNavigateTab={onNavigateTab}
      onBackToDashboard={onBackToDashboard}
    />
  );
}

export function LearningComingSoonPage({ onNavigateTab, onBackToDashboard }) {
  return (
    <SubsystemComingSoonPage
      subsystemLabel="Sub-Sistem Edukasi Investasi"
      subtitle="Kurikulum Pasar Modal • 3 Tingkat"
      title="Learning Center"
      routePath="/learning"
      description="Halaman pusat pembelajaran investasi saham berjenjang dan kuis evaluasi sedang dalam tahap penyempurnaan. Materi terstruktur untuk tingkat Pemula, Menengah, hingga Mahir akan segera dapat diakses di sini."
      roadmapHighlights={[
        {
          code: "01",
          title: "Kurikulum Bertingkat 3 Level",
          desc: "Materi terstruktur dari dasar pasar modal & lot, rasio fundamental 4 pilar, hingga manajemen risiko.",
        },
        {
          code: "02",
          title: "Pelacakan Progres Belajar",
          desc: "Pencatatan status penyelesaian setiap materi dan catatan belajar pribadi secara persisten.",
        },
        {
          code: "03",
          title: "Kuis Evaluasi Deterministik",
          desc: "Uji pemahaman pilihan ganda dengan skor objektif instan dan pembahasan resmi setiap butir soal.",
        },
        {
          code: "04",
          title: "Umpan Balik Diagnostik Pemahaman",
          desc: "Ringkasan konsep yang telah dikuasai serta rekomendasi modul rujukan untuk materi yang perlu diulas.",
        },
      ]}
      relatedPages={EDUCATION_SIMULATION_TABS}
      activeTabId="learning"
      onNavigateTab={onNavigateTab}
      onBackToDashboard={onBackToDashboard}
    />
  );
}

export function AiAssistantComingSoonPage({ onNavigateTab, onBackToDashboard }) {
  return (
    <SubsystemComingSoonPage
      subsystemLabel="Sub-Sistem Edukasi Investasi"
      subtitle="Context-Grounded Educational Tutor"
      title="AI Assistant & Investment Tutor"
      routePath="/ai"
      description="Halaman asisten belajar virtual berbasis kecerdasan buatan sedang dalam tahap pengembangan. AI Investment Tutor akan membantu menjelaskan istilah, rasio keuangan, dan konsep analisis fundamental secara terstruktur tanpa rekomendasi jual/beli."
      roadmapHighlights={[
        {
          code: "01",
          title: "Tanya Jawab Konsep Fundamental",
          desc: "Penjelasan terstruktur mulai dari definisi, rumus matematis, analogi, hingga cara membaca rasio.",
        },
        {
          code: "02",
          title: "Terikat Konteks Kurikulum",
          desc: "Jawaban tutor mengacu langsung pada materi pembelajaran dan studi kasus emiten Bursa Efek Indonesia.",
        },
        {
          code: "03",
          title: "Analisis Edukatif Hasil Simulasi",
          desc: "Membantu memahami dampak volatilitas, diversifikasi, dan strategi akumulasi secara objektif.",
        },
        {
          code: "04",
          title: "Guardrail Non-Financial Advice",
          desc: "Fokus murni pada literasi pasar modal tanpa sinyal transaksi spekulatif atau prediksi harga pasti.",
        },
      ]}
      relatedPages={EDUCATION_SIMULATION_TABS}
      activeTabId="ai"
      onNavigateTab={onNavigateTab}
      onBackToDashboard={onBackToDashboard}
    />
  );
}
