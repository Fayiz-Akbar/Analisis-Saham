# Architecture Decision Records (ADR): AI-Powered Fundamental Investment Analyzer

---

## D001: Context-Grounded Architecture over Unconstrained LLM Generation

**Date**: 2026-09-05  
**Status**: Approved / Accepted  

### Context
Model bahasa besar (LLM) seperti Google Gemini memiliki pengetahuan umum yang luas tetapi rentan terhadap **halusinasi** (*hallucination*), distorsi data historis, atau ketidakmampuan mengetahui harga saham terkini secara presisi. Dalam domain keuangan pasar modal Indonesia, kesalahan angka (seperti rasio PE, ROE, atau laba bersih) dapat berakibat fatal bagi keputusan investasi pengguna.

### Decision
Sistem mengadopsi pendekatan **Context-Grounded Generation**. LLM sama sekali tidak diperbolehkan mengakses data pasar secara bebas atau menggunakan bobot memori internalnya untuk menjawab angka keuangan. Backend Express.js bertindak sebagai *Context Builder*: mengumpulkan data quote terkini, laporan keuangan, dan berita dari cache lokal/API eksternal, memvalidasinya, dan menyuntikkannya ke dalam prompt sistem sebelum diteruskan ke Gemini API. Respon AI dibatasi secara ketat untuk hanya merujuk pada data konteks yang disediakan dan dilarang memberikan anjuran langsung beli/jual saham.

### Alternatives
1. *Zero-shot Direct Prompting*: Membiarkan LLM menjawab langsung dari memorinya (Ditolak: halusinasi tinggi dan data kadaluarsa).
2. *RAG dengan Vector Database (Pinecone/Chroma)*: Mengindeks dokumen laporan keuangan dalam bentuk embedding vektor (Ditolak untuk fase awal: data fundamental saham berbentuk tabular numerik lebih akurat dikirimkan sebagai structured JSON daripada potongan teks embedding).

### Impact
- Menjamin konsistensi faktual (*Factual Consistency*) mencapai target $\ge 95\%$.
- Menekan tingkat halusinasi angka hingga $< 2\%$.
- Menjadi kontribusi penelitian utama (RQ2 & RQ3) untuk skripsi.

---

## D002: Dual-Audience Product Positioning (Pemula vs Berpengalaman)

**Date**: 2026-09-05  
**Status**: Approved / Accepted  

### Context
Pasar investor ritel di Indonesia terbelah menjadi dua segmen ekstrem: investor pemula yang minim literasi finansial dan investor berpengalaman yang frustrasi karena inefisiensi waktu dalam mengumpulkan data fundamental dari berbagai sumber terpisah. Membangun aplikasi yang hanya menyasar satu segmen akan mempersempit utilitas dan kontribusi sistem.

### Decision
Platform diposisikan secara terintegrasi untuk melayani kedua profil:
1. **Investor Pemula**: Disuguhi kurikulum bertingkat 6 level, kuis pemahaman, AI Investment Tutor dengan analogi sederhana, kartu rasio berwarna intuitif, dan simulasi DCA realistis.
2. **Investor Berpengalaman**: Disediakan Stock Screener multi-indikator, Stock Comparison 2–4 emiten secara *side-by-side*, AI Financial Assistant untuk sintesis emiten cepat, dan audit risiko portofolio (*Investment Health Score*).

### Alternatives
1. *Platform Khusus Edukasi Pemula*: Hanya modul kuis dan tutorial (Ditolak: kehilangan aspek riset data riil).
2. *Platform Khusus Analisis Finansial Lanjutan (Pro Terminal)*: Terlalu rumit dan mengabaikan jutaan investor ritel baru di IDX.

### Impact
- Menjadikan arsitektur sistem komprehensif, relevan secara industri, dan memiliki kontribusi riset yang kaya (RQ6 & RQ7).

---

## D003: Multi-Tier PostgreSQL JSONB Caching Strategy

**Date**: 2026-09-05  
**Status**: Approved / Accepted  

### Context
Penyedia API data pasar saham dan berita pihak ketiga mengenakan batasan ketat (*rate limit*) dan biaya kuota per pemanggilan. Pemanggilan berulang untuk data yang relatif statis (seperti laporan keuangan kuartalan atau data historis harian) menyebabkan pemborosan kuota dan latensi tinggi.

### Decision
Mengimplementasikan tabel `api_cache` dan `news_cache` di database PostgreSQL dengan tipe data `JSONB` dan kolom `expires_at`. Setiap pemanggilan data pasar akan memeriksa cache terlebih dahulu (*Cache-Aside pattern*). Time-to-Live (TTL) dibedakan secara granular:
- Quote harga harian: 1–5 menit.
- Historical data: 24 jam.
- Rasio fundamental: 1–7 hari.
- Berita emiten: 15–60 menit.

### Alternatives
1. *Redis Cache*: Menggunakan Redis in-memory store (Ditolak untuk fase awal demi meminimalkan kompleksitas infrastruktur; PostgreSQL JSONB memiliki performa kueri yang sangat cepat untuk skala ribuan request dan tidak memerlukan service container tambahan).
2. *No Cache*: Langsung memanggil provider setiap saat (Ditolak: memicu error HTTP 429 Too Many Requests dan pembengkakan biaya).

### Impact
- Mengurangi konsumsi kuota API pihak ketiga hingga $\ge 80\%$.
- Menjaga response time sistem di bawah 1.5 detik.
- Menyediakan fallback data ketika provider eksternal mengalami *downtime*.
- Menjawab rumusan masalah penelitian RQ4.

---

## D004: Realistic 100-Shares Lot Mechanism with Cash Rollover for DCA

**Date**: 2026-09-05  
**Status**: Approved / Accepted  

### Context
Sebagian besar kalkulator Dollar-Cost Averaging (DCA) yang tersedia di internet mengasumsikan saham dapat dibeli dalam pecahan fraksional (*fractional shares*). Di Bursa Efek Indonesia (IDX), saham hanya dapat diperdagangkan dalam satuan lot penuh (1 lot = 100 lembar). Jika seorang investor menyisihkan Rp200.000 per bulan untuk saham seharga Rp8.850 per lembar (Rp885.000 per lot), simulasi biasa akan gagal atau memberikan hasil yang tidak realistis.

### Decision
Simulasi DCA pada sistem menerapkan **Realistic Lot Mode**:
- Pembelian hanya dieksekusi jika dana kas yang tersedia cukup untuk membeli minimal 1 lot penuh (kelipatan 100 lembar).
- Sisa dana kas yang belum mencukupi untuk membeli 1 lot tidak hangus, melainkan **diakumulasikan (*cash rollover*)** dan ditambahkan ke alokasi dana bulan berikutnya.
- Nilai portofolio akhir dihitung dari: $(\text{Total Lot Tersimpan} \times 100 \times \text{Harga Terkini}) + \text{Sisa Saldo Kas}$.

### Alternatives
1. *Fractional Share Approximation*: Membeli koma saham (Ditolak: menyesatkan investor ritel karena tidak sesuai fakta pasar IDX).
2. *Disregard Remaining Cash*: Membuang sisa uang kembalian (Ditolak: menghasilkan perhitungan total modal yang cacat secara akuntansi).

### Impact
- Memberikan simulasi investasi berkala yang 100% realistis bagi investor Indonesia.
- Menjawab rumusan masalah penelitian RQ5.

---

## D005: Decoupled Service Layer for Market Data Providers

**Date**: 2026-09-05  
**Status**: Approved / Accepted  

### Context
Ketersediaan dan kebijakan harga provider data saham IDX pihak ketiga (seperti Sectors.app, Twelve Data, Finnhub) dapat berubah sewaktu-waktu. Mengunci logika frontend atau controller ke format provider tertentu (*vendor lock-in*) akan menyulitkan pemeliharaan jangka panjang.

### Decision
Membuat interface standar pada `MarketDataService` dan `FundamentalService` yang mentransformasikan output provider eksternal ke dalam format internal (*Domain Model*) aplikasi Analisis-Saham sebelum dikirim ke client atau AI. Jika provider diganti di kemudian hari, perubahan hanya terjadi pada adapter provider tanpa memengaruhi frontend atau endpoint API.

### Impact
- Memastikan arsitektur sistem scalable, maintainable, dan resilient.

---

## D006: Educational Portfolio Health Scoring Model without Automated Order Signals

**Date**: 2026-09-05  
**Status**: Approved / Accepted  

### Context
Banyak investor ritel pemula menempatkan 100% modalnya pada satu saham berisiko tinggi. Namun, sistem tidak memiliki lisensi broker atau sertifikasi penasihat keuangan formal untuk memberikan instruksi transaksi beli/jual secara hukum.

### Decision
Modul *Investment Health* menghitung skor edukatif 0–100 berdasarkan diversifikasi bobot aset dan sektor (Herfindahl-Hirschman Index / batasan bobot tunggal). Skor ini disajikan murni sebagai **indikator risiko edukatif** yang dilengkapi penjelasan naratif dari AI Assistant mengenai bahaya konsentrasi portofolio, tanpa pernah mengeluarkan instruksi atau sinyal trading otomatis ("Beli", "Jual", atau "Cut Loss").

### Impact
- Mematuhi batasan hukum dan regulasi pasar modal (PRD Section 1 & 6.2).
- Meningkatkan literasi manajemen risiko pengguna tanpa melanggar batasan etika AI.

---

## D007: SwiftBook Neo-Fintech Design System with Dual-Theme Inversion

**Date**: 2026-09-29  
**Status**: Approved / Accepted  

### Context
Aplikasi analisis finansial konvensional seringkali terlihat kaku, padat, dan membosankan, atau hanya menyediakan satu mode tampilan yang menyilaukan mata investor saat menganalisis pasar di malam hari.

### Decision
Mengadopsi sistem desain modern *SwiftBook neo-fintech* dengan dukungan penuh **Dual-Theme (Light & Dark Mode)** yang menerapkan pembalikan kontras (*contrast inversion*) presisi:
- Palet Warna: Aksen utama Fresh Lime `#74AE2D`, wadah AI Soft Sage `#D6E3C0`, aksen moderat Warm Peach `#F2D6A4`, Dark Canvas `#0D0D0D`, Dark Surface `#161616`, Light Canvas `#F8F8F8`, dan Light Surface `#FFFFFF`.
- Geometri Komponen: Menggunakan bentuk kapsul penuh (*full pill* `rounded-full`) untuk seluruh tombol aksi, search bar, filter preset tags, dan status badges, serta kartu sudut membulat `rounded-2xl`.
- Tekstur Visual: Menggunakan pola garis diagonal halus (*diagonal stripes pattern*) pada kartu aksen hero banner mode gelap.

### Impact
- Menghadirkan antarmuka bertaraf institusional yang estetis, modern, dan sangat nyaman bagi investor pemula maupun berpengalaman.

---

## D008: Curated Stock Catalog Scope to Indeks IDX80 with On-Demand Fallback

**Date**: 2026-09-29  
**Status**: Approved / Accepted  

### Context
Terdapat lebih dari 900 emiten tercatat di Bursa Efek Indonesia (BEI/IDX). Mengambil dan menyimpan seluruh data emiten secara berkala akan membebani database dan kuota API eksternal secara tidak efisien, mengingat sebagian besar emiten tidak memiliki likuiditas harian yang memadai. Sebaliknya, hanya membatasi pada LQ45 (45 saham) dirasa terlalu sempit untuk fitur stock screener.

### Decision
Menetapkan **Indeks IDX80** (80 emiten terlikuid dan berfundamental representatif di BEI, termasuk konstituen LQ45 dan IDX30) sebagai basis katalog terkurasi utama untuk *database seeder*, *stock screener*, dan *dashboard*. Untuk emiten IDX lainnya di luar IDX80, sistem mendukung pencarian *on-demand* dinamis ke Yahoo Finance (`${symbol}.JK`) dengan mekanisme *on-demand upsert* ke database lokal.

### Impact
- Menjamin efisiensi penyimpanan database dan utilisasi kuota API.
- Menyediakan katalog saham berfundamental solid bagi pengguna sekaligus mempertahankan fleksibilitas riset tak terbatas untuk seluruh saham IDX.

---

## D009: Integration of Strategic Global Indices, Commodities, and News Sentiment Classification

**Date**: 2026-09-29  
**Status**: Approved / Accepted  

### Context
Pergerakan saham di BEI sangat dipengaruhi oleh sentimen bursa global (Wall Street, Asia) serta harga komoditas ekspor strategis Indonesia (Minyak, Emas, Batubara, Nikel, CPO). Selain itu, daftar berita emiten tanpa klasifikasi sentimen memaksa pengguna membaca seluruh artikel panjang secara manual.

### Decision
1. Menambahkan pemantauan bursa global (S&P 500, Dow Jones, Nasdaq, Nikkei 225, Hang Seng) dan harga komoditas strategis pada modul `market-sentiment`.
2. Menstandarisasikan klasifikasi label sentimen berita (`[Positif]`, `[Netral]`, `[Negatif]`) beserta skor polaritas numerik (`-1.0` s.d. `+1.0`) pada tabel `news_cache` dan komponen tampilan berita Stock Detail.

### Impact
- Memberikan konteks makroekonomi yang komprehensif bagi riset fundamental saham.
- Mempercepat pengguna dalam menyaring berita berdampak positif atau negatif terhadap emiten yang dipantau.
