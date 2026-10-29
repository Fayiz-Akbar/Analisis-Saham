# Overview: AI-Powered Fundamental Investment Analyzer & Simulation

## 1. Ringkasan Sistem
Pasar modal Indonesia melalui Bursa Efek Indonesia (IDX) mengalami lonjakan signifikan partisipasi investor ritel dalam beberapa tahun terakhir (mencapai 14,87 juta SID pada Desember 2024 berdasarkan data KSEI). Namun, tingginya minat ini belum diimbangi dengan literasi keuangan yang memadai dan ketersediaan media praktik yang aman. Data pasar modal tersebar di berbagai platform terpisah, rasio finansial sulit dipahami oleh pemula, evaluasi kuis edukasi konvensional tidak memetakan indikator konsep yang belum dikuasai, dan evaluasi portofolio kerap mengabaikan fluktuasi risiko imbal hasil.

**AI-Powered Fundamental Investment Analyzer & Simulation** dikembangkan sebagai platform web terpadu hasil kolaborasi tim penelitian skripsi Teknik Informatika Universitas Lampung 2026 yang mengintegrasikan dua sub-sistem utama:
1. **Sub-sistem Analisis Saham & AI Financial Assistant (Fayiz Akbar Daifullah)**: Riset fundamental emiten IDX berbasis katalog Indeks IDX80/LQ45/IDX30, chart candlestick interaktif (Lightweight Charts), 4 pilar rasio keuangan, filter saham multi-kriteria (*Stock Screener*), komparasi multi-saham berdampingan (*Stock Comparison*), agregasi berita berlabel sentimen, dan orkestrasi AI Financial Assistant.
2. **Sub-sistem Edukasi dan Simulasi Investasi Saham Berbasis Web (Firman Farel Richardo, NPM 2315061099)**: Kurikulum edukasi pasar modal 3 level bertingkat (Pemula, Menengah, Mahir), kuis evaluasi deterministik berbasis kunci jawaban resmi, evaluasi pemahaman kuis berbantuan Large Language Model (LLM) untuk analisis indikator konsep dan umpan balik materi tanpa mengubah nilai kuis, asisten belajar interaktif *AI Investment Tutor*, lingkungan perdagangan saham bermodal virtual (*Virtual Trading*) dalam satuan lot (1 lot = 100 lembar), ringkasan portofolio virtual, riwayat transaksi, evaluasi komposit **Portfolio Health Score (PHS)** berbasis Return on Investment (ROI) dan volatilitas imbal hasil ($n \ge 2$), simulasi investasi historis, simulasi Dollar-Cost Averaging (DCA) dengan *Realistic Lot Mode* dan rollover kas bulanan, serta portal Administrator untuk manajemen modul materi dan kuis.

Platform ini menempatkan diri secara tegas sebagai **Educational & Analytical Investment Platform** (sarana riset dan pembelajaran mandiri) yang melayani seluruh spektrum investor tanpa risiko kehilangan uang nyata.

---

## 2. Target Pengguna & Karakteristik Kebutuhan

### 2.1 Investor Ritel Pemula (Beginner Retail Investors)
- **Profil**: Mahasiswa, pelajar, atau calon investor yang ingin membangun literasi pasar modal dan berlatih sebelum menggunakan uang riil.
- **Tantangan**: Kesulitan memahami istilah teknis rasio keuangan, tidak terbiasa membaca laporan keuangan, belum menyadari bahaya fluktuasi risiko portofolio.
- **Solusi Sistem**: 
  - Kurikulum edukasi bertahap 3 level (Pemula, Menengah, Mahir).
  - *AI Investment Tutor* berbasis materi untuk menjawab kebingungan konsep tanpa anjuran spekulatif.
  - Kuis interaktif dengan pembahasan resmi dan evaluasi pemahaman berbasis LLM.
  - Simulasi transaksi saham dengan **Modal Virtual Awal** dan satuan lot realistis.
  - Evaluasi *Portfolio Health Score* (PHS) untuk memahami korelasi imbal hasil dan volatilitas risiko.
  - Simulasi DCA realistis untuk mempelajari strategi investasi berkala.

### 2.2 Investor Ritel Berpengalaman (Experienced Retail Investors)
- **Profil**: Investor yang telah aktif bertransaksi dan membutuhkan efisiensi waktu dalam riset fundamental dan komparasi emiten.
- **Tantangan**: Fragmentasi data, inefisiensi perbandingan multi-emiten sejenis secara serentak, perlunya audit kuantitatif terhadap portofolio.
- **Solusi Sistem**:
  - *Stock Screener* fleksibel multi-indikator dengan preset indeks.
  - *Stock Comparison* (2–4 saham) secara *side-by-side* lintas metrik dan visual perbandingan.
  - *AI Financial Assistant* sebagai *co-pilot* riset untuk sintesis ringkas highlight keuangan dan sentimen berita.
  - Pelacakan dan audit portofolio berbasis PHS.

### 2.3 Administrator Konten
- **Profil**: Pengelola materi edukasi dan instrumen evaluasi sistem.
- **Kebutuhan**: Mengelola modul pembelajaran per level dan bank soal kuis (soal, opsi A-D, kunci jawaban, pembahasan, dan indikator materi).

---

## 3. Batasan Sistem (Product Boundaries)
Sistem ini secara tegas **BUKAN**:
- Broker efek atau perusahaan sekuritas.
- Platform eksekusi order saham di pasar modal riil.
- Pengelola rekening dana nasabah (RDN) atau penyimpan dana tunai pengguna.
- Robo-advisor atau bot trading otomatis (*automated algorithmic trading*).
- Penasihat keuangan profesional berlisensi (*certified financial advisor*).

Alur interaksi sistem:
```text
Learn  ──>  Quiz & Feedback  ──>  Analyze  ──>  Compare  ──>  Virtual Trade  ──>  PHS & DCA
```

---

## 4. Scope Proyek

### 4.1 In Scope
- Autentikasi berbasis JWT (Investor dan Administrator) serta manajemen hak akses.
- Dashboard terpadu (ringkasan portofolio, snapshot pasar IHSG, bursa global, komoditas, berita berlabel sentimen, watchlist).
- Penyaring saham (*Stock Screener*) berbasis preset indeks (IDX80, LQ45, IDX30) dan multi-filter indikator fundamental.
- Analisis detail saham (*Stock Detail*) dengan chart candlestick interaktif (Lightweight Charts), 4 pilar rasio keuangan, dan ringkasan berita berlabel sentimen.
- Komparasi berdampingan (*Stock Comparison*) untuk 2 hingga 4 saham.
- Lingkungan transaksi saham virtual berbasis modal virtual awal dan satuan lot (100 lembar).
- Portofolio virtual dengan pencatatan kepemilikan, average buy price tertimbang, dan P/L (realized & unrealized).
- Riwayat transaksi virtual kronologis.
- Evaluasi **Portfolio Health Score (PHS)** berbasis ROI dan volatilitas imbal hasil ($n \ge 2$) dengan graceful data adequacy handling.
- Simulasi investasi historis dan simulasi DCA Realistic Lot Mode (terisolasi dari portofolio utama).
- Kurikulum edukasi investasi bertingkat 3 level (Pemula, Menengah, Mahir) beserta pelacakan progres belajar.
- Kuis evaluasi pilihan ganda dinilai secara deterministik oleh sistem berdasarkan kunci jawaban resmi.
- Evaluasi pemahaman kuis berbantuan LLM (indikator capaian & umpan balik materi tanpa mengubah nilai kuis).
- AI Investment Tutor interaktif berbasis context grounding materi edukasi.
- Portal Administrator untuk pengelolaan modul materi dan kuis evaluasi.
- Multi-tier caching (PostgreSQL JSONB & Redis) untuk optimasi API eksternal.

### 4.2 Out of Scope
- Integrasi ke rekening bank atau rekening dana nasabah (RDN).
- Eksekusi transaksi di bursa efek riil.
- Penyimpanan dan penarikan uang nyata.
- Sinyal beli/jual otomatis (*automated trading signals*).
- Prediksi kepastian harga saham di masa depan (*guaranteed price forecasting*).

---

## 5. Konteks Akademik & Research Contributions (Skripsi)

### 5.1 Kontribusi Penelitian Utama
1. **Data Integration**: Mengintegrasikan market data, historical prices, rasio fundamental terstruktur, berita bersentimen, dan catatan transaksi virtual ke dalam satu platform web.
2. **Context-Grounded LLM & Feedback Evaluator**: Menggunakan model LLM (Gemini API) untuk menyusun evaluasi pemahaman kuis dan AI Tutor berbasis konteks materi faktual tanpa risiko halusinasi atau pengubahan nilai deterministik.
3. **Portfolio Health Score (PHS)**: Mengembangkan indikator komposit evaluasi portofolio virtual berdasarkan kombinasi Return on Investment (ROI) untuk performa dan volatilitas imbal hasil untuk risiko fluktuasi, dilengkapi aturan kecukupan data ($n \ge 2$).
4. **Realistic Lot-Based Investment Simulation**: Memodelkan simulasi akumulasi berkala (DCA) yang akurat sesuai aturan satuan lot 100 lembar dan perputaran sisa kas bulanan (*cash rollover*).
5. **Multi-Tier API Caching Strategy**: Menganalisis dampak caching PostgreSQL JSONB & Redis terhadap konsumsi kuota API eksternal (Yahoo Finance) dan latensi respons backend.

### 5.2 Research Questions (RQ)
- **RQ1**: Bagaimana merancang dan membangun sistem edukasi investasi saham berbasis web yang menyediakan materi bertingkat, kuis evaluasi, dan AI Investment Tutor berbasis context-grounded LLM?
- **RQ2**: Bagaimana menerapkan LLM untuk mengevaluasi pemahaman pengguna berdasarkan hasil kuis yang dinilai oleh sistem secara deterministik, serta menyusun umpan balik sesuai indikator materi dan pembahasan resmi tanpa mengubah nilai kuis?
- **RQ3**: Bagaimana merancang transaksi saham virtual, pengelolaan portofolio virtual, dan simulasi DCA realistis berbasis lot, serta menerapkan Portfolio Health Score (PHS) berdasarkan indikator ROI dan volatilitas imbal hasil?
- **RQ4**: Bagaimana mengintegrasikan market data, historical data, 4 pilar rasio fundamental, dan company news ke dalam antarmuka web analisis investasi saham terpadu?
- **RQ5**: Seberapa konsisten respons AI terhadap data fundamental dan materi pembelajaran yang diberikan sebagai konteks?
- **RQ6**: Bagaimana penerapan mekanisme caching multi-tier dapat mengurangi jumlah request ke API eksternal dan meningkatkan performa aplikasi?
- **RQ7**: Bagaimana fitur Stock Comparison dan Stock Screener terintegrasi dapat membantu investor menganalisis perbedaan fundamental beberapa emiten secara efisien?
