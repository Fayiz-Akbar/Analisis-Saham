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
