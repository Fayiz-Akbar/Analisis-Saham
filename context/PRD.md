# Product Requirements Document (PRD)

## Project Name
**AI-Powered Fundamental Investment Analyzer & Simulation**  
*(Platform Analisis Fundamental & Edukasi Simulasi Investasi Saham IDX Berbasis Web dan Context-Grounded AI)*

---

# 1. Project Overview

## 1.1 Deskripsi Sistem
**AI-Powered Fundamental Investment Analyzer & Simulation** adalah platform web analitik fundamental saham, simulasi transaksi virtual, dan edukasi pasar modal terpadu yang dirancang untuk seluruh spektrum investor ritel di Bursa Efek Indonesia (IDX). Sistem ini menggabungkan integrasi data pasar saham terkini dan historis, rasio keuangan 4 pilar fundamental, sentimen berita pasar, penyaring saham (*Stock Screener*), komparasi multi-saham (*Stock Comparison*), lingkungan perdagangan saham bermodal virtual (*Virtual Trading*), audit kesehatan portofolio (*Portfolio Health Score*), simulasi Dollar-Cost Averaging (DCA) berbasis lot, serta kurikulum edukasi investasi bertingkat yang dilengkapi kuis deterministik dan evaluasi pemahaman berbantuan Large Language Model (LLM).

Sistem mengadopsi arsitektur **Context-Grounded Large Language Model** menggunakan Google Gemini API, di mana model AI hanya menghasilkan sintesis, penjelasan kontekstual, dan umpan balik edukatif setelah disuntikkan konteks data finansial atau materi pembelajaran faktual yang telah divalidasi oleh backend sistem. Sistem berfungsi murni sebagai **Educational & Analytical Investment Platform** (sarana riset dan pembelajaran mandiri), bukan sebagai broker efek, platform transaksi uang riil, pengelola dana nasabah, penyedia sinyal trading otomatis, ataupun pemberi nasihat keuangan berlisensi (*certified financial advisory*).

## 1.2 Struktur Kolaborasi Sub-Sistem Penelitian
Pengembangan platform ini dilaksanakan dalam tim penelitian skripsi terpadu di Jurusan Teknik Elektro, Fakultas Teknik, Universitas Lampung (2026), yang dibagi menjadi dua sub-sistem saling terintegrasi:

| Sub-Sistem | Pengembang Utama | Ruang Lingkup Utama |
|---|---|---|
| **Sub-sistem 1: Analisis Saham & AI Financial Assistant** | **Fayiz Akbar Daifullah** | Integrasi market data IDX, Stock Screener multi-kriteria, Stock Detail candlestick chart & 4 pilar fundamental, Stock Comparison (2–4 saham), agregasi berita berlabel sentimen, Watchlist personal, dan orkestrasi AI Financial Assistant / Co-pilot. |
| **Sub-sistem 2: Edukasi dan Simulasi Investasi Saham Berbasis Web** | **Firman Farel Richardo** *(NPM 2315061099)* | Kurikulum edukasi bertingkat (Pemula, Menengah, Mahir), kuis evaluasi deterministik, evaluasi pemahaman berbantuan LLM, AI Investment Tutor, transaksi virtual berbasis modal virtual, portofolio virtual, riwayat transaksi, Portfolio Health Score (ROI & Volatilitas), simulasi historis, simulasi DCA realistis, dan portal manajemen konten Administrator. |
| **Penjaminan Kualitas (Quality Assurance)** | **Michael Defrans** | Pengujian fungsional dan non-fungsional setiap iterasi Sprint, verifikasi *edge-cases*, pelaporan ketidaksesuaian, dan validasi integrasi lintas sub-sistem. |

## 1.3 Latar Belakang & Problem Statement
1. **Pertumbuhan Investor Ritel vs Kesenjangan Literasi**: Berdasarkan data PT Kustodian Sentral Efek Indonesia (KSEI), jumlah investor pasar modal mencapai 14,87 juta Single Investor Identification (SID) pada Desember 2024 (dengan 6,38 juta SID saham). Pertumbuhan masif ini belum diimbangi dengan literasi keuangan dan kesiapan analisis yang memadai sehingga pemula rentan mengalami kerugian akibat spekulasi dan fenomena FOMO (*fear of missing out*).
2. **Kebutuhan Media Pembelajaran Praktik (Experiential Learning)**: Penyampaian materi investasi secara teoritis pasif kurang efektif. Pengguna membutuhkan media interaktif yang memadukan teori dengan praktik transaksi langsung menggunakan modal virtual tanpa risiko kehilangan uang nyata.
3. **Keterbatasan Evaluasi Kuis Konvensional**: Pada platform edukasi umumnya, nilai kuis hanya disajikan secara agregat (angka/persentase) tanpa menjelaskan indikator konsep mana yang belum dikuasai dan modul materi mana yang harus dipelajari kembali.
4. **Evaluasi Portofolio yang Mengabaikan Fluktuasi Risiko**: Sebagian besar simulator portofolio hanya menampilkan metrik laba/rugi (*Profit/Loss* atau ROI), padahal keuntungan akhir yang positif bisa saja diperoleh dengan fluktuasi/volatilitas ekstrem yang berbahaya. Diperlukan indikator komposit (*Portfolio Health Score*) yang mengevaluasi performa sekaligus risiko fluktuasi imbal hasil.
5. **Inefisiensi Simulasi Berkala Konvensional**: Simulasi investasi berkala (*Dollar-Cost Averaging*) konvensional kerap mengasumsikan pembelian saham fraksional fiktif dan mengabaikan aturan perdagangan bursa Indonesia yang mewajibkan pembelian dalam satuan kelipatan 100 lembar (1 lot) dengan pengelolaan sisa dana kas.
6. **Fragmentasi Data Finansial & Inefisiensi Riset Emiten**: Investor kesulitan mengumpulkan data pasar, grafik candlestick, laporan keuangan, dan berita emiten dari berbagai platform terpisah, serta kesulitan membandingkan fundamental beberapa emiten kompetitor secara tersinkronisasi.
7. **Risiko Halusinasi LLM pada Domain Finansial & Edukasi**: Pemanfaatan AI generatif tanpa pembatasan konteks ketat (*context grounding*) berisiko menghasilkan angka fiktif, mengarang rasio keuangan, atau memberikan penjelasan yang menyesatkan bagi investor pemula.

## 1.4 Objectives (Tujuan Sistem)
### General Objective
Membangun platform web terpadu yang menyediakan perangkat analisis fundamental saham Bursa Efek Indonesia (IDX), lingkungan transaksi dan portofolio virtual berbasis modal simulasi, simulasi strategi investasi berkala realistis, evaluasi kesehatan portofolio berbasis performa dan volatilitas, serta kurikulum edukasi terstruktur dengan evaluasi pemahaman berbantuan LLM yang bebas dari halusinasi data.

### Specific Objectives
1. Mengintegrasikan data harga saham terkini, data historis candlestick, metrik fundamental keuangan, dan berita pasar bursa IDX ke dalam satu antarmuka responsif.
2. Mengembangkan modul pembelajaran investasi saham 3 level (Pemula, Menengah, Mahir) beserta pencatatan progres belajar mandiri.
3. Mengimplementasikan kuis evaluasi pilihan ganda yang dinilai secara deterministik oleh sistem berdasarkan kunci jawaban resmi.
4. Menerapkan model LLM (Google Gemini) untuk menyusun evaluasi pemahaman kuis dan umpan balik belajar berbasis indikator materi serta pembahasan resmi tanpa mengubah nilai kuis deterministik.
5. Membangun AI Investment Tutor berbasis context-grounding materi edukasi untuk menjawab kebingungan konsep pengguna secara interaktif.
6. Mengembangkan lingkungan transaksi virtual (BUY/SELL) berbasis satuan lot (1 lot = 100 lembar) dan saldo kas virtual awal yang memperbarui kepemilikan serta riwayat transaksi.
7. Merancang dan menerapkan **Portfolio Health Score (PHS)** berbasis dua indikator kuantitatif: Return on Investment (ROI) untuk performa dan volatilitas imbal hasil untuk risiko fluktuasi portofolio.
8. Membangun simulator investasi historis dan simulator Dollar-Cost Averaging (DCA) dengan *Realistic Lot Mode* (perhitungan lot penuh dan akumulasi sisa kas bulanan) yang terisolasi dari saldo transaksi virtual utama.
9. Menyediakan portal Administrator untuk mengelola materi pembelajaran (CRUD modul & level) dan kuis evaluasi (CRUD soal, pilihan, kunci, pembahasan, dan indikator materi).
10. Menyediakan Stock Screener multi-kriteria dan fitur Stock Comparison berdampingan (2–4 saham) dengan visualisasi grafik interaktif.
11. Mengimplementasikan strategi multi-tier caching (PostgreSQL JSONB & Redis) guna meminimalkan latensi respons dan menghemat kuota external API.

---

# 2. Research Questions & Kontribusi Akademik

## 2.1 Research Questions (RQ)
- **RQ1**: Bagaimana merancang dan membangun sistem edukasi investasi saham berbasis web yang menyediakan materi bertingkat, kuis evaluasi, dan AI Investment Tutor berbasis context-grounded LLM?
- **RQ2**: Bagaimana menerapkan LLM untuk mengevaluasi pemahaman pengguna berdasarkan hasil kuis yang dinilai oleh sistem secara deterministik, serta menyusun umpan balik sesuai indikator materi dan pembahasan resmi tanpa mengubah nilai kuis?
- **RQ3**: Bagaimana merancang transaksi saham virtual, pengelolaan portofolio virtual, dan simulasi DCA realistis berbasis lot, serta menerapkan Portfolio Health Score (PHS) berdasarkan indikator ROI dan volatilitas imbal hasil?
- **RQ4**: Bagaimana mengintegrasikan market data, historical prices, 4 pilar rasio fundamental, dan berita emiten berlabel sentimen ke dalam antarmuka analisis yang terpadu?
- **RQ5**: Seberapa konsisten dan akurat respons context-grounded AI terhadap data numerik fundamental dan materi pembelajaran yang disuntikkan backend?
- **RQ6**: Bagaimana penerapan strategi caching multi-tier (PostgreSQL JSONB & Redis) dapat menekan latensi respons dan konsumsi kuota API eksternal?
- **RQ7**: Bagaimana fitur Stock Comparison dan Stock Screener multi-kriteria dapat membantu investor dalam melakukan riset komparatif emiten sejenis secara efisien?

## 2.2 Academic & Performance KPI
1. **Factual Consistency AI**: Skor konsistensi faktual $\ge 95\%$ pada pengujian dataset evaluasi finansial dan edukasi terhadap konteks yang disuntikkan.
2. **AI Hallucination Rate**: Tingkat halusinasi angka dan konsep finansial $< 2\%$.
3. **Deterministic Quiz Integrity**: $100\%$ nilai kuis dihasilkan secara konsisten oleh sistem berdasarkan kunci jawaban; LLM tidak pernah mengubah nilai kuis.
4. **Graceful Fallback**: Ketika layanan LLM mengalami gangguan/timeout, sistem tetap menyajikan nilai kuis deterministik dan pembahasan resmi tanpa error sistem ($100\%$ fallback availability).
5. **Cache Hit Ratio**: Rasio cache hit $\ge 80\%$ untuk data harga, fundamental, dan news feed pada beban pengujian simulasi.
6. **Backend Response Time**: Latensi rata-rata backend $< 1.5$ detik untuk data ter-cache, dan $< 4$ detik untuk sintesis AI.

---

# 3. Stakeholders & Peran Sistem

## 3.1 Aktor Sistem (Actors)
1. **Investor (End-User / Mahasiswa / Calon Investor)**:
   - Pengguna aplikasi yang ingin mempelajari mekanisme investasi saham dan mempraktikkannya. Istilah *Investor* merujuk pada peran pengguna di dalam aplikasi simulasi tanpa mensyaratkan rekening investasi nyata.
   - Hak akses: Membaca materi pembelajaran bertingkat, mencatat progres selesai, mengerjakan kuis, melihat nilai & pembahasan resmi, menerima evaluasi pemahaman LLM, bertanya pada AI Investment Tutor, memantau data saham, melakukan transaksi virtual (BUY/SELL), mengelola portofolio virtual, melihat riwayat transaksi, memantau Portfolio Health Score (PHS), serta menjalankan simulasi historis & DCA.
2. **Administrator**:
   - Pengelola konten edukasi dan instrumen evaluasi sistem.
   - Hak akses: Mengelola modul materi pembelajaran (tambah, ubah, hapus, atur urutan dan level pemula/menengah/mahir), mengelola kuis evaluasi (tambah, ubah, hapus soal, pilihan jawaban A-D, kunci jawaban resmi, teks pembahasan resmi, dan pemetaan indikator materi).

## 3.2 Tim Pengembang & Reviewer Akademik
- **Firman Farel Richardo**: Full Stack Developer (Skripsi Sub-sistem Edukasi & Simulasi Investasi).
- **Fayiz Akbar Daifullah**: Full Stack Developer (Sub-sistem Analisis Saham & AI Financial Assistant).
- **Michael Defrans**: Quality Assurance (QA).
- **Dosen Pembimbing & Dosen Penguji**: Reviewer metodologi penelitian, validitas evaluasi LLM, dan arsitektur perangkat lunak.
- **External Providers**: Yahoo Finance API (Market Data), Google AI (Gemini API), News API / RSS Feeds.

---

# 4. Product Boundaries & Scope

## 4.1 In Scope
- Autentikasi berbasis JWT (Investor dan Administrator) serta manajemen profil pengguna.
- Lingkungan transaksi saham virtual menggunakan **Modal Virtual Awal** yang disediakan sistem; eksekusi transaksi BUY/SELL berbasis lot (1 lot = 100 lembar) dengan validasi saldo kas dan kepemilikan saham.
- Portofolio virtual aktif: pencatatan kepemilikan (*holdings*), rata-rata harga beli (*average buy price* tertimbang), nilai pasar aset, saldo kas virtual, realized P/L, unrealized P/L, dan alokasi aset/sektor.
- Riwayat transaksi virtual lengkap (waktu, emiten, jenis BUY/SELL, jumlah lot/lembar, harga acuan, total nilai transaksi).
- Perhitungan dan visualisasi **Portfolio Health Score (PHS)** berbasis ROI dan volatilitas imbal hasil, dilengkapi syarat kecukupan data ($n \ge 2$) dan analisis sensitivitas normalisasi.
- **Simulasi Investasi Historis** (lump sum skenario) berbasis data harga masa lalu yang terisolasi dari saldo transaksi virtual utama.
- **Simulasi Dollar-Cost Averaging (DCA)** dengan *Realistic Lot Mode* (kelipatan 100 lembar, rollover sisa kas bulanan) yang terisolasi dari saldo transaksi virtual utama.
- Kurikulum edukasi pasar modal terstruktur 3 level utama: Level Pemula (*Beginner*), Level Menengah (*Intermediate*), dan Level Mahir (*Advanced*), dilengkapi pelacakan status selesai per modul.
- Kuis evaluasi pilihan ganda dengan penilaian deterministik berbasis kunci jawaban resmi dan pembahasan lengkap.
- Evaluasi pemahaman kuis berbantuan LLM: analisis capaian indikator materi dan umpan balik materi yang perlu dipelajari kembali tanpa mengubah skor nilai kuis.
- AI Investment Tutor interaktif berbasis context grounding materi edukasi sistem.
- Integrasi market data saham IDX (katalog terkurasi konstituen Indeks IDX80, LQ45, IDX30, serta on-demand search) dan candlestick chart interaktif.
- Analisis fundamental 4 pilar (Valuation, Profitability, Growth, Solvability/Leverage).
- Stock Screener multi-kriteria dan Stock Comparison berdampingan (2–4 saham).
- Agregasi berita pasar modal dan emiten dengan label sentimen (`[Positif]`, `[Netral]`, `[Negatif]`).
- Portal Administrator untuk manajemen modul materi dan kuis evaluasi.
- Arsitektur caching multi-tier (PostgreSQL JSONB & Redis) dengan mekanisme graceful fallback.

## 4.2 Out of Scope
- Integrasi ke rekening bank nyata, Rekening Dana Nasabah (RDN), atau broker efek/sekuritas.
- Penyimpanan dana nasabah (*custody of funds*) atau transaksi mata uang riil.
- Eksekusi order di bursa riil secara otomatis atau pembuatan bot trading otomatis (*automated algorithmic trading / HFT*).
- Prediksi kepastian harga saham di masa depan (*guaranteed price forecasting*).
- Pemberian rekomendasi transaksi beli/jual secara mengikat atau jasa penasihat keuangan bersertifikasi (*No Financial Advice Disclaimer* wajib dicantumkan pada seluruh antarmuka dan keluaran AI).

---

# 5. Formulas & Algoritma Inti

## 5.1 Perhitungan Transaksi & Portofolio Virtual
1. **Konversi Satuan Lot**:
   $$\text{Jumlah Lembar} = \text{Jumlah Lot} \times 100$$
2. **Harga Beli Rata-Rata Tertimbang (*Weighted Average Buy Price*)**:
   $$\text{Avg Price}_{\text{baru}} = \frac{(\text{Qty Lama} \times \text{Avg Price Lama}) + (\text{Qty Beli Baru} \times \text{Harga Beli Baru})}{\text{Qty Lama} + \text{Qty Beli Baru}}$$
3. **Realized Profit / Loss (pada saat transaksi SELL)**:
   $$\text{Realized P/L} = \text{Qty Lembar Jual} \times (\text{Harga Jual} - \text{Avg Price Beli})$$
4. **Unrealized Profit / Loss (pada sisa kepemilikan aktif)**:
   $$\text{Unrealized P/L} = \text{Qty Lembar Aktif} \times (\text{Harga Pasar Terkini} - \text{Avg Price Beli})$$
5. **Nilai Total Portofolio ($V_t$)**:
   $$V_t = \text{Saldo Kas Virtual} + \sum_{i=1}^{m} (\text{Qty Lembar}_i \times \text{Harga Pasar Terkini}_i)$$

## 5.2 Portfolio Health Score (PHS)
Portfolio Health Score (PHS) dirancang sebagai indikator komposit edukatif yang mengevaluasi performa dan risiko fluktuasi portofolio virtual berdasarkan prinsip penyusunan indeks komposit:

### a. Indikator Performa: Return on Investment (ROI)
Menunjukkan persentase perubahan nilai total portofolio terhadap modal awal ($V_0 > 0$):
$$\text{ROI} = \left( \frac{V_t - V_0}{V_0} \right) \times 100\% \quad \text{--- (Rumus 2.1)}$$
*Catatan: $V_t$ mencakup saldo kas virtual dan nilai pasar seluruh saham yang dimiliki saat evaluasi.*

### b. Indikator Risiko: Volatilitas Imbal Hasil Portofolio ($s$)
Volatilitas mengukur simpangan baku (*sample standard deviation*) dari imbal hasil periodik portofolio pada interval pencatatan yang konsisten:
$$r_t = \left( \frac{V_t - V_{t-1}}{V_{t-1}} \right) \times 100\% \quad \text{--- (Rumus 2.2)}$$
$$s = \sqrt{\frac{\sum_{t=1}^n (r_t - \bar{r})^2}{n - 1}} \quad \text{--- (Rumus 2.3)}$$
*Di mana $r_t$ adalah imbal hasil periode ke-$t$, $\bar{r}$ adalah rata-rata imbal hasil selama periode pengamatan, dan $n$ adalah jumlah periode pengamatan ($n \ge 2$).*

### c. Normalisasi, Arah Kontribusi & Batas Kecukupan Data
- **Arah Penilaian**: ROI yang lebih tinggi menghasilkan skor performa yang lebih tinggi. Sebaliknya, volatilitas yang lebih tinggi menunjukkan fluktuasi yang lebih berisiko, sehingga normalisasi volatilitas menggunakan **arah penilaian terbalik** (volatilitas rendah menghasilkan skor risiko tinggi).
- **Aturan Kecukupan Data**: Estimasi simpangan baku membutuhkan data historis yang memadai ($n \ge 2$ dengan interval konsisten). Apabila data observasi belum mencukupi batas minimum, sistem **tidak menghasilkan skor akhir komposit PHS**, melainkan hanya menampilkan indikator mentah yang tersedia disertai label status *"Data belum mencukupi untuk evaluasi risiko"*.
- **Transparansi Edukatif**: Nilai mentah ROI (%) dan Volatilitas (%) selalu disajikan berdampingan dengan skor PHS agar pengguna memahami dasar matematis pembentukan skor.

## 5.3 Simulasi Dollar-Cost Averaging (Realistic Lot Mode)
Algoritma DCA realistis mengeksekusi pembelian bulanan dengan pembulatan lot penuh (100 lembar) dan akumulasi saldo kas (*cash rollover*):
1. **Dana Tersedia Bulan ke-$m$**:
   $$\text{Dana Tersedia}_m = \text{Budget Bulanan} + \text{Sisa Kas}_{m-1}$$
2. **Harga Per Lot**:
   $$\text{Harga Lot}_m = \text{Harga Saham}_m \times 100$$
3. **Jumlah Lot Dibeli**:
   $$\text{Lot Dibeli}_m = \left\lfloor \frac{\text{Dana Tersedia}_m}{\text{Harga Lot}_m} \right\rfloor$$
4. **Dana Terpakai & Sisa Kas**:
   $$\text{Dana Terpakai}_m = \text{Lot Dibeli}_m \times \text{Harga Lot}_m$$
   $$\text{Sisa Kas}_m = \text{Dana Tersedia}_m - \text{Dana Terpakai}_m$$
5. **Nilai Akhir DCA**:
   $$\text{Total Nilai Akhir} = (\text{Total Lembar Terkumpul} \times \text{Harga Terkini}) + \text{Sisa Kas Terakhir}$$
*Catatan: Eksekusi simulasi DCA dan simulasi historis murni bersifat komputasi analitik dan sama sekali tidak memotong saldo kas virtual atau mengubah portofolio virtual utama pengguna.*

## 5.4 Evaluasi Pemahaman Kuis Berbantuan LLM
Alur evaluasi pemahaman memisahkan proses deterministik sistem dari sintesis LLM:
1. **Penilaian Deterministik**: Sistem mencocokkan jawaban pengguna terhadap kunci jawaban resmi, menghitung nilai (skala 0–100%), dan menyimpan riwayat pengerjaan di database.
2. **Context Payload Assembly**: Backend menyusun konteks terstruktur yang memuat:
   - Identitas modul dan indikator capaian materi yang diuji.
   - Daftar butir soal, opsi jawaban yang dipilih pengguna, dan kunci jawaban resmi.
   - Teks pembahasan resmi per butir soal.
3. **LLM Reasoning & Feedback Generation**: LLM (Google Gemini) memetakan pola jawaban pengguna terhadap indikator materi dan menyusun umpan balik naratif yang memuat:
   - Ringkasan indikator konsep yang telah dikuasai dengan baik.
   - Ringkasan indikator konsep yang belum dipahami secara akurat.
   - Rekomendasi modul materi spesifik yang perlu dipelajari kembali.
4. **Guardrail Kuis**: LLM secara tegas dilarang memodifikasi nilai angka hasil kuis.
5. **Fallback Safety**: Jika layanan Gemini API mengalami kendala (timeout / HTTP 429 / 503), antarmuka pengguna tetap menampilkan nilai kuis deterministik dan pembahasan resmi secara utuh.

---

# 6. Functional Requirements (Kebutuhan Fungsional)

Tabel berikut menyelaraskan Kebutuhan Fungsional (KF) dari Draf Sempro dengan modul keseluruhan platform:

| Kode | Aktor | Modul Terkait | Deskripsi Kebutuhan Fungsional |
|---|---|---|---|
| **KF-01** | Investor, Admin | Auth & User Management | Sistem menyediakan fitur registrasi, login berbasis kredensial aman, dan logout untuk Investor dan Administrator sesuai hak akses (*Role-Based Access Control*). |
| **KF-02** | Investor | Learning Curriculum | Sistem menyediakan materi pembelajaran investasi saham yang terstruktur dalam 3 tingkat pembelajaran: Level Pemula, Level Menengah, dan Level Mahir. |
| **KF-03** | Investor | Learning Curriculum | Sistem menampilkan materi sesuai level dan menyimpan status progres belajar selesai per modul; pencatatan progres belajar dibedakan secara tegas dari nilai kuis. |
| **KF-04** | Investor | Quiz Evaluation | Sistem menyediakan kuis evaluasi pilihan ganda berdasarkan modul materi pembelajaran yang dipelajari. |
| **KF-05** | Investor | Quiz Evaluation | Sistem menilai jawaban kuis berdasarkan kunci jawaban resmi yang tersimpan, menghitung nilai perolehan (0–100%), dan menyimpan hasil percobaan secara deterministik. |
| **KF-06** | Investor | Quiz Evaluation | Sistem menyediakan dan menampilkan pembahasan resmi untuk setiap butir soal kuis setelah pengguna mengirimkan jawaban. |
| **KF-07** | Investor | AI Investment Tutor | Sistem menyediakan AI Investment Tutor interaktif berbasis Google Gemini API yang menjawab pertanyaan pengguna dengan konteks materi edukasi sistem tanpa memberikan rekomendasi saham. |
| **KF-08** | Investor | Market Data & Info | Sistem menampilkan daftar saham, grafik candlestick historis, harga acuan, sumber data, dan waktu data sebagai referensi analisis dan simulasi investasi. |
| **KF-09** | Investor | Virtual Account | Sistem menyediakan modal virtual awal (saldo kas virtual) pada akun Investor sebagai dasar pelaksanaan simulasi transaksi saham. |
| **KF-10** | Investor | Virtual Trading | Sistem memproses transaksi pembelian (BUY) dan penjualan (SELL) saham virtual dalam satuan lot (1 lot = 100 lembar) sesuai kecukupan saldo kas dan kepemilikan saham (*no short selling*). |
| **KF-11** | Investor | Virtual Portfolio | Sistem menyajikan ringkasan portofolio virtual mencakup saldo kas, daftar kepemilikan saham, jumlah lot/lembar, harga beli rata-rata tertimbang, nilai pasar aset, serta realized & unrealized P/L. |
| **KF-12** | Investor | Transaction History | Sistem mencatat dan menampilkan riwayat transaksi virtual Investor secara kronologis (waktu, saham, tipe BUY/SELL, kuantitas lot/lembar, harga acuan, total nilai transaksi). |
| **KF-13** | Investor | Portfolio Health Score | Sistem menghitung Portfolio Health Score (PHS) berdasarkan indikator performa (ROI) dan indikator risiko (volatilitas imbal hasil) setelah memverifikasi kecukupan dan konsistensi interval data pengamatan ($n \ge 2$). |
| **KF-14** | Investor | Portfolio Health Score | Sistem menampilkan nilai ROI mentah, volatilitas harian/periodik, skor PHS, dan narasi penjelasan; jika riwayat data risiko belum mencukupi, sistem menampilkan indikator yang tersedia tanpa menghasilkan skor akhir komposit PHS. |
| **KF-15** | Investor | DCA Simulator | Sistem menyediakan simulasi Dollar-Cost Averaging (DCA) berbasis saham, alokasi bulanan, interval pembelian, dan durasi simulasi menggunakan Realistic Lot Mode dan rollover sisa kas tanpa mengubah saldo atau kepemilikan transaksi virtual utama. |
| **KF-16** | Administrator | Admin Content Portal | Sistem menyediakan portal Administrator untuk menambah, mengubah, menghapus, dan mengatur modul materi pembelajaran serta mengelola kuis evaluasi (soal, opsi pilihan A-D, kunci jawaban, pembahasan resmi, dan indikator materi). |
| **KF-17** | Investor | LLM Quiz Feedback | Sistem menggunakan LLM untuk menyusun umpan balik pemahaman kuis berdasarkan soal, jawaban pengguna, kunci jawaban, pembahasan resmi, dan indikator materi tanpa mengubah nilai kuis. Apabila pemrosesan LLM gagal, sistem tetap menyajikan nilai deterministik dan pembahasan resmi. |
| **KF-18** | Investor | Historical Simulation | Sistem menyediakan simulasi investasi historis skenario (lump sum) berdasarkan emiten, modal awal, dan rentang tanggal historis tanpa mengubah saldo, kepemilikan, atau riwayat transaksi virtual utama. |
| **KF-19** | Investor | Stock Screener | Sistem menyediakan penyaring saham multi-kriteria berdasarkan sektor, industri, market cap, rasio PER, PBV, ROE, ROA, DER, yield dividen, serta filter katalog indeks (IDX80, LQ45, IDX30). |
| **KF-20** | Investor | Stock Comparison | Sistem menyediakan perbandingan berdampingan (*side-by-side*) untuk 2 hingga 4 emiten saham lintas metrik 4 pilar fundamental dan performa harga historis beserta AI Comparison Co-pilot. |
| **KF-21** | Investor | Market & Sentiment | Sistem menyajikan pemantauan indeks IHSG, bursa global, komoditas strategis, top gainers/losers, serta kurasi berita pasar berlabel sentimen (`[Positif]`/`[Netral]`/`[Negatif]`). |

---

# 7. Non-Functional Requirements (Kebutuhan Non-Fungsional)

Tabel berikut merangkum Kebutuhan Non-Fungsional (KNF) yang ditetapkan pada Draf Sempro:

| Kode | Kategori | Deskripsi Kebutuhan Non-Fungsional |
|---|---|---|
| **KNF-01** | **Keamanan (Security)** | Sistem harus memproteksi kredensial akun menggunakan enkripsi password `bcrypt` (salt rounds $\ge 10$) dan stateless JWT token. Sistem membatasi akses hasil kuis, saldo virtual, transaksi, dan portofolio hanya kepada pemilik akun yang sah, serta memisahkan hak akses Administrator untuk pengelolaan materi dan kuis. Seluruh API keys eksternal tersimpan aman di environment server backend. |
| **KNF-02** | **Kinerja & Skalabilitas (Performance & Scalability)** | Sistem harus mendukung akses multi-user secara bersamaan pada modul materi, kuis, dan simulasi dengan performa stabil. Waktu respons backend untuk permintaan data ter-cache harus $< 1.5$ detik dan respons komputasi AI/simulasi $< 4.0$ detik. |
| **KNF-03** | **Keandalan & Integritas Data (Reliability & Data Integrity)** | Sistem harus menjamin persistensi data pengerjaan kuis dan transaksi virtual menggunakan basis data relasional PostgreSQL dengan transaksi atomic (ACID). Saldo kas virtual, kepemilikan lot, dan riwayat transaksi harus tetap konsisten saat akun diakses kembali atau ketika API data eksternal mengalami gangguan sementara. |
| **KNF-04** | **Kemudahan Penggunaan (Usability)** | Antarmuka pengguna harus memiliki navigasi intuitif, konsistensi terminologi finansial, serta teks materi dan kuis dalam Bahasa Indonesia baku yang jelas. Sistem wajib mencantumkan label visual eksplisit bahwa seluruh saldo, kepemilikan, dan transaksi adalah **Simulasi Virtual Tanpa Dana Nyata**. |
| **KNF-05** | **Kompatibilitas (Compatibility)** | Sistem web harus responsif terhadap berbagai ukuran layar peramban desktop (laptop/PC) maupun perangkat bergerak (*mobile browser*) dengan penyesuaian tata letak yang proporsional. |
| **KNF-06** | **Transparansi Data (Data Transparency)** | Sistem harus secara transparan mencantumkan nama sumber data penyedia harga (misal: Yahoo Finance API), timestamp pembaruan terakhir, dan status ketersediaan data harga pada setiap halaman transaksi dan simulasi. |

---

# 8. Product Backlog & Scrum Planning

## 8.1 Product Backlog (PB-01 s.d. PB-13)
Sesuai rancangan metodologi penelitian Agile/Scrum pada Draf Sempro:

| ID Backlog | Item Product Backlog | Deskripsi Fitur & Fungsionalitas |
|---|---|---|
| **PB-01** | **Login Sistem & Autentikasi** | Memungkinkan Investor dan Administrator masuk ke sistem melalui pemeriksaan kredensial akun dan verifikasi hak akses berbasis JWT agar dapat mengakses fitur sesuai perannya. |
| **PB-02** | **Pembelajaran Materi Investasi Saham** | Menyediakan modul materi pembelajaran investasi saham terstruktur 3 level (Pemula, Menengah, Mahir) serta mencatat dan menyimpan status progres belajar pengguna. |
| **PB-03** | **AI Investment Tutor** | Menyediakan pendamping belajar interaktif berbasis LLM (Gemini API) untuk menjawab pertanyaan dan memberikan penjelasan konseptual berdasarkan konteks materi edukasi sistem. |
| **PB-04** | **Kuis Evaluasi & Umpan Balik LLM** | Memungkinkan Investor mengerjakan kuis evaluasi pilihan ganda per materi, menerima nilai deterministik dan pembahasan resmi dari sistem, serta memperoleh evaluasi pemahaman berbantuan LLM mengenai indikator capaian dan rekomendasi materi tindak lanjut. |
| **PB-05** | **Informasi Saham & Data Pasar** | Menampilkan daftar saham emiten IDX, grafik harga candlestick historis, harga acuan pasar, sumber data, dan timestamp update sebagai acuan transaksi virtual dan simulasi. |
| **PB-06** | **Transaksi Virtual Saham** | Memfasilitasi transaksi beli (BUY) dan jual (SELL) saham virtual berbasis satuan lot (100 lembar) menggunakan modal virtual awal, dengan validasi kecukupan kas dan kepemilikan saham. |
| **PB-07** | **Portfolio Health Score (PHS)** | Menghitung dan menyajikan skor evaluasi komposit portofolio virtual berdasarkan indikator performa (ROI) dan indikator risiko (volatilitas imbal hasil), disertai validasi kecukupan data ($n \ge 2$). |
| **PB-08** | **Portofolio Virtual** | Menampilkan ringkasan portofolio virtual Investor mencakup saldo kas virtual, daftar kepemilikan saham aktif, rata-rata harga beli (*Avg Price*), nilai pasar total, dan akumulasi laba/rugi (P/L). |
| **PB-09** | **Riwayat Transaksi Virtual** | Menampilkan catatan kronologis transaksi virtual Investor (waktu transaksi, simbol emiten, jenis BUY/SELL, jumlah lot/lembar, harga per lembar, dan total nilai transaksi). |
| **PB-10** | **Simulasi Investasi Historis** | Memungkinkan Investor memilih saham, modal virtual, dan rentang tanggal historis untuk menguji skenario investasi masa lalu secara terpisah tanpa mengubah portofolio virtual utama. |
| **PB-11** | **Simulasi Dollar-Cost Averaging (DCA)** | Menyediakan simulasi investasi berkala bulanan menggunakan *Realistic Lot Mode* (kelipatan 100 lembar) dan rollover kas sisa bulanan secara terpisah tanpa mengubah portofolio virtual utama. |
| **PB-12** | **Pengelolaan Materi Pembelajaran** | Menyediakan antarmuka bagi Administrator untuk melihat, menambah, mengubah, menghapus, dan mengatur urutan modul materi pembelajaran investasi saham per level. |
| **PB-13** | **Pengelolaan Kuis Evaluasi** | Menyediakan antarmuka bagi Administrator untuk mengelola instrumen kuis evaluasi mencakup butir soal, pilihan jawaban A-D, kunci jawaban resmi, teks pembahasan, dan indikator materi. |

## 8.2 Sprint Planning (4 Sprint Pelaksanaan)

| Sprint | Item Backlog yang Dikembangkan | Ruang Lingkup & Pekerjaan Utama |
|---|---|---|
| **Sprint 1** | **PB-01, PB-12, PB-13** *(Akses Pengguna & Manajemen Konten)* | - Implementasi arsitektur database awal (PostgreSQL + Prisma ORM).<br>- Autentikasi JWT login/register dan manajemen hak akses (Investor & Administrator).<br>- Portal Administrator: CRUD materi pembelajaran (judul, slug, level, urutan, status terbit).<br>- Portal Administrator: CRUD kuis evaluasi (soal, pilihan A-D, kunci jawaban resmi, pembahasan, indikator materi). |
| **Sprint 2** | **PB-02, PB-03, PB-04** *(Pembelajaran, Evaluasi Kuis & AI Tutor)* | - Penyajian kurikulum pembelajaran 3 level (Pemula, Menengah, Mahir) dan pelacak progres belajar.<br>- Pengerjaan kuis pilihan ganda, penilaian deterministik sistem, dan penyajian pembahasan resmi.<br>- Integrasi LLM Evaluator: Analisis indikator materi dan pembentukan umpan balik belajar personal tanpa mengubah nilai kuis.<br>- Implementasi AI Investment Tutor interaktif berbasis context grounding materi sistem. |
| **Sprint 3** | **PB-05, PB-06, PB-07, PB-08, PB-09** *(Pasar, Transaksi Virtual & Portfolio Health)* | - Integrasi market data saham acuan dan visualisasi chart candlestick.<br>- Inisialisasi modal virtual awal pada akun Investor.<br>- Mesin transaksi virtual BUY & SELL berbasis lot (100 lembar) dengan validasi saldo kas dan kepemilikan lot.<br>- Modul Portofolio Virtual: Ringkasan saldo kas, holdings, avg price, dan realized/unrealized P/L.<br>- Pencatatan kronologis riwayat transaksi virtual.<br>- Implementasi algoritma Portfolio Health Score (PHS) berbasis ROI (Rumus 2.1) dan volatilitas imbal hasil (Rumus 2.2 & 2.3) beserta penanganan ketidakcukupan data. |
| **Sprint 4** | **PB-10, PB-11** *(Simulasi Historis & Dollar-Cost Averaging)* | - Mesin simulasi investasi historis skenario terpisah berdasarkan rentang tanggal masa lalu.<br>- Mesin simulasi DCA Realistic Lot Mode dengan aturan 100 lembar dan perputaran sisa kas bulanan.<br>- Visualisasi kurva pertumbuhan modal vs nilai investasi pada simulasi DCA.<br>- Verifikasi independensi data simulasi agar tidak memengaruhi saldo transaksi virtual utama.<br>- Pengujian menyeluruh (*testing & bug fixing*) dan penyiapan deployment. |

---

# 9. Technical Specifications & Architecture

## 9.1 Hardware & Environment Specification
Sesuai Tabel 4 pada Draf Sempro:
- **Perangkat Komputasi Utama**: ASUS Vivobook 14 A1404ZA
- **Prosesor (CPU)**: Intel Core™ i3-1215U Generasi ke-12 (6 Cores, 8 Threads)
- **Memori Utama (RAM)**: 24 GB DDR4
- **Kartu Grafis (GPU)**: Intel® UHD Graphics
- **Media Penyimpanan**: SSD NVMe M.2 256 GB
- **Sistem Operasi**: Windows 11 Home 64-bit

## 9.2 Software Stack & Libraries
Sesuai Tabel 5 pada Draf Sempro:
- **Runtime Environment**: Node.js (LTS), JavaScript (ES6+)
- **Backend Framework**: Express.js (RESTful API architecture)
- **Object-Relational Mapping (ORM)**: Prisma ORM (schema migrations & queries)
- **Database Management System**: PostgreSQL (relational tables & JSONB cache)
- **In-Memory Cache & Session**: Redis
- **Frontend Framework**: React.js
- **Styling**: Tailwind CSS
- **Data Visualization & Charts**: TradingView Lightweight Charts & Recharts
- **Penyunting Kode**: Visual Studio Code, Antigravity IDE
- **Version Control**: Git & GitHub
- **API Testing**: Postman

## 9.3 External Supporting Services
Sesuai Tabel 6 pada Draf Sempro:
- **Market Data API**: Yahoo Finance API (menyediakan data harga terkini dan data historis OHLCV untuk transaksi virtual, valuasi portofolio, simulasi historis, dan simulasi DCA).
- **Large Language Model API**: Google Gemini API (mendukung AI Investment Tutor interaktif, AI Evaluasi Pemahaman Kuis, AI Financial Assistant, dan AI Comparison Co-pilot).
- **Financial News Feeds**: News API & RSS Feeds portal berita ekonomi Indonesia berlabel sentimen.

## 9.4 Skema Relasi Basis Data Inti (PostgreSQL & Prisma)
Sistem mengelola relasi terstruktur untuk menjaga integritas data transaksi virtual dan edukasi:
- `users`: ID, nama, email, password_hash, role (`INVESTOR` / `ADMIN`), virtual_balance (saldo kas modal virtual), created_at.
- `learning_modules`: ID, title, slug, level (`BEGINNER` / `INTERMEDIATE` / `ADVANCED`), order_index, content_body, is_published.
- `learning_progress`: ID, user_id, module_id, is_completed, completed_at.
- `quiz_questions`: ID, module_id, question_text, option_a, option_b, option_c, option_d, correct_key (`A`/`B`/`C`/`D`), explanation_text, indicator_concept.
- `quiz_attempts`: ID, user_id, module_id, score_percentage, answers_payload (JSON), ai_feedback_text (JSON), created_at.
- `virtual_transactions`: ID, user_id, symbol, transaction_type (`BUY` / `SELL`), lots, shares (lots * 100), price_per_share, total_amount, transaction_date.
- `virtual_holdings`: ID, user_id, symbol, total_shares, avg_buy_price, updated_at.
- `portfolio_snapshots`: ID, user_id, snapshot_date, total_portfolio_value, cash_balance, stock_value.
- `api_cache`: cache_key (hash), data_payload (JSONB), expires_at, updated_at.

---

# 10. Acceptance Criteria (Kriteria Penerimaan)

1. **Autentikasi & Otorisasi Peran**:
   - Investor dapat melakukan registrasi dan login dengan kredensial valid, menerima JWT token, dan diarahkan ke antarmuka utama.
   - Administrator memiliki kredensial khusus yang memberikan akses ke portal pengelolaan materi pembelajaran dan kuis.
2. **Edukasi Bertingkat & Progres Belajar**:
   - Pengguna dapat mengakses materi pembelajaran sesuai level (Pemula, Menengah, Mahir).
   - Menandai materi selesai berhasil menyimpan status `completed` di database tanpa terpengaruh hasil kuis.
3. **Kuis Deterministik & Evaluasi Berbantuan LLM**:
   - Sistem menilai jawaban kuis secara deterministik berdasarkan kunci jawaban resmi dengan akurasi 100%.
   - Pembahasan resmi disajikan untuk setiap butir pertanyaan kuis.
   - LLM menghasilkan evaluasi pemahaman yang memetakan indikator materi yang belum dikuasai dan menyarankan materi peninjauan kembali tanpa mengubah nilai kuis.
   - Jika layanan LLM mengalami kegagalan/timeout, nilai kuis dan pembahasan resmi tetap tampil tanpa memicu error aplikasi.
4. **AI Investment Tutor**:
   - Tutor merespons pertanyaan pengguna berdasarkan materi edukasi yang tersedia.
   - Tutor mematuhi batasan edukatif dan menolak memberikan rekomendasi saham atau prediksi spekulatif harga.
5. **Transaksi Virtual Berbasis Lot & Modal Virtual**:
   - Akun baru menerima saldo modal virtual awal.
   - Pembelian (BUY) hanya dapat dilakukan dalam kelipatan 100 lembar (1 lot) dan memotong saldo kas virtual jika dana mencukupi; pembelian ditolak jika saldo kas tidak mencukupi.
   - Penjualan (SELL) memvalidasi kepemilikan saham; penjualan yang melebihi lot kepemilikan ditolak (*no short selling*). Transaksi SELL berhasil menambah kas virtual dan memperbarui holding saham.
6. **Portofolio Virtual & Riwayat Transaksi**:
   - Portofolio menampilkan ringkasan saldo kas, daftar kepemilikan, harga beli rata-rata tertimbang, nilai pasar terkini, serta realized dan unrealized P/L secara akurat.
   - Riwayat mencatat seluruh transaksi BUY dan SELL secara kronologis dengan data lengkap.
7. **Portfolio Health Score (PHS)**:
   - ROI dihitung akurat berdasarkan formula $\frac{V_t - V_0}{V_0} \times 100\%$.
   - Volatilitas imbal hasil dihitung akurat sebagai simpangan baku imbal hasil harian/periodik portofolio ($n \ge 2$).
   - Jika data historis imbal hasil belum mencapai $n \ge 2$ atau interval belum konsisten, sistem menampilkan indikator yang ada dengan keterangan bahwa data belum memadai, serta menahan keluaran skor komposit akhir PHS.
8. **Simulasi Historis & DCA Terisolasi**:
   - Simulasi DCA Realistic Lot Mode berhasil menghitung lot penuh (100 lembar), memperhitungkan perputaran sisa kas bulanan, dan menampilkan perbandingan terhadap modal disetor.
   - Simulasi DCA dan simulasi historis sama sekali tidak mengubah saldo kas virtual, kepemilikan saham, atau riwayat transaksi virtual utama pengguna.
9. **Portal Administrasi**:
   - Administrator dapat menambah, mengubah, menghapus modul materi edukasi dan soal kuis beserta kunci jawaban dan indikator materi.
10. **Resiliensi Caching & Transparansi Data**:
    - Data harga dan fundamental yang sering diakses disajikan dari cache lokal dengan hit ratio $\ge 80\%$.
    - Setiap tampilan data pasar mencantumkan sumber data (Yahoo Finance), waktu pembaruan, dan disclaimer edukasi investasi.
