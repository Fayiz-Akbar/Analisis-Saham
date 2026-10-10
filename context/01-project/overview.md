# Overview: AI-Powered Fundamental Investment Analyzer

## 1. Ringkasan Sistem
Pasar modal Indonesia melalui Bursa Efek Indonesia (IDX) mengalami lonjakan signifikan partisipasi investor ritel dalam beberapa tahun terakhir. Namun, tingginya minat ini belum diimbangi dengan literasi keuangan yang memadai dan ketersediaan perangkat riset yang efisien. Data pasar modal tersebar di berbagai platform terpisah—mulai dari dokumen PDF laporan keuangan emiten, aplikasi ringkasan harga saham, portal berita ekonomi, hingga spreadsheet manual untuk komparasi kompetitor.

**AI-Powered Fundamental Investment Analyzer** dikembangkan sebagai solusi terpadu berbasis web yang mengintegrasikan:
- Data harga real-time dan candlestick historis emiten IDX berbasis katalog terkurasi konstituen **Indeks IDX80** (serta pencarian on-demand untuk seluruh emiten IDX).
- Rasio dan metrik fundamental keuangan 4 pilar (Valuation, Profitability, Growth, Solvability/Leverage).
- Agregasi berita emiten dan pasar modal dengan klasifikasi label sentimen otomatis (`[Positif]`, `[Netral]`, `[Negatif]`).
- Indeks bursa global (S&P 500, Nikkei 225) dan harga komoditas strategis (Minyak, Emas, Batubara, Nikel, CPO).
- Filter saham otomatis (*Stock Screener*) dengan preset indeks (IDX80, LQ45, IDX30) dan komparasi multi-saham (*Stock Comparison*) berdampingan.
- Pencatatan portofolio transaksi dengan perhitungan keuntungan/kerugian (*Realized & Unrealized P/L*).
- Simulasi Dollar-Cost Averaging (DCA) realistis berbasis satuan lot (1 lot = 100 lembar).
- Pengukuran tingkat diversifikasi dan audit risiko konsentrasi (*Investment Health*).
- Kurikulum edukasi investasi bertingkat (6 level) dilengkapi kuis interaktif.
- Antarmuka web responsif dan modern dengan dukungan tema Light Mode & Dark Mode.

Platform ini menempatkan diri sebagai **Educational & Analytical Investment Platform** yang melayani dua spektrum investor: membimbing investor pemula memahami konsep dasar serta memangkas waktu riset bagi investor ritel berpengalaman.

---

## 2. Target Pengguna & Karakteristik Kebutuhan

### 2.1 Investor Ritel Pemula (Beginner Retail Investors)
- **Profil**: Individu atau mahasiswa yang baru memulai investasi saham atau ingin memperdalam literasi pasar modal.
- **Tantangan**: Kesulitan memahami jargon finansial dan rumus rasio, tidak terbiasa menganalisis laporan keuangan, belum memahami bahaya konsentrasi portofolio.
- **Solusi Sistem**: 
  - Kurikulum edukasi bertahap (Level 1 Pengantar s.d. Level 6 Strategi).
  - *AI Investment Tutor* yang menjelaskan istilah finansial dengan analogi sederhana dan bahasa yang ramah.
  - Kartu indikator metrik dengan kode warna dan penjelasan intuitif.
  - Simulasi DCA realistis untuk menguji strategi investasi berkala sebelum terjun ke pasar nyata.

### 2.2 Investor Ritel Berpengalaman (Experienced Retail Investors)
- **Profil**: Investor yang telah aktif bertransaksi dan memiliki kemampuan menganalisis laporan keuangan serta valuasi emiten.
- **Tantangan**: Inefisiensi waktu akibat fragmentasi data dari berbagai sumber, kesulitan melakukan komparasi multi-emiten sejenis secara cepat dan terpadu, membutuhkan audit risiko portofolio objektif.
- **Solusi Sistem**:
  - *Stock Screener* fleksibel berbasis multi-filter indikator fundamental.
  - *Stock Comparison* multi-emiten (2–4 saham) secara *side-by-side* mencakup metrik dan perbandingan historis.
  - *AI Financial Assistant* sebagai *co-pilot* riset untuk sintesis ringkas highlight keuangan dan korelasi sentimen berita secara cepat.
  - Audit *Investment Health* untuk mendeteksi over-konsentrasi sektoral maupun aset tunggal.

---

## 3. Batasan Sistem (Product Boundaries)
Sistem ini secara tegas **BUKAN**:
- Broker efek atau perusahaan sekuritas.
- Platform eksekusi transaksi trading langsung.
- Robo-advisor yang mengelola dana nasabah.
- Penasihat keuangan profesional formal (*licensed financial advisor*).
- Sistem pembuat sinyal beli/jual otomatis (*automated trading signals*).

Alur interaksi sistem membantu pengguna melalui tahapan:
```text
Learn  ──>  Search  ──>  Analyze  ──>  Compare  ──>  Simulate  ──>  Track  ──>  Understand
```

---

## 4. Scope Proyek

### 4.1 In Scope
- Autentikasi pengguna berbasis JWT dan manajemen profil.
- Tampilan dashboard terpadu (ringkasan portofolio, snapshot pasar IHSG, bursa global & komoditas, berita berlabel sentimen, watchlist).
- Pemantauan indeks IHSG, indeks global, komoditas strategis, top gainers, top losers, dan ringkasan sentimen makro.
- Penyaring saham (*Stock Screener*) berbasis preset indeks (IDX80, LQ45, IDX30) dan filter sektor, industri, PE, PBV, ROE, ROA, DER, market cap, dan yield dividen.
- Analisis detail saham (*Stock Detail*) dengan chart candlestick interaktif (TradingView Lightweight Charts), 4 pilar rasio keuangan, dan ringkasan berita berlabel sentimen (`[Positif]`/`[Netral]`/`[Negatif]`).
- Komparasi berdampingan (*Stock Comparison*) untuk 2 hingga 4 saham.
- Manajemen watchlist personal.
- Pencatatan transaksi portofolio dengan kalkulasi harga beli rata-rata (*weighted average buy price*) dan P/L (realized & unrealized).
- Simulasi DCA realistis berbasis 100 lembar/lot dengan rollover kas sisa bulanan.
- Evaluasi risiko portofolio (*Investment Health Score* 0–100).
- Modul edukasi investasi 6 level berjenjang beserta kuis pemahaman dan pelacakan kemajuan.
- Orkestrasi context-grounded AI (Google Gemini API) untuk analisis emiten, komparasi, makro, dan tutor belajar.
- Mekanisme caching multi-tier berbasis PostgreSQL JSONB.
- Kerangka pengujian evaluasi AI (Factual consistency, relevance, completeness, hallucination).

### 4.2 Out of Scope
- Integrasi API koneksi RDN atau broker efek.
- Penyimpanan dan pengelolaan dana tunai pengguna.
- Eksekusi order riil di pasar bursa.
- Pemodelan *high-frequency trading* (HFT) dan *tick-by-tick real-time feed*.
- Prediksi kepastian harga saham masa depan.
- Otomasi rekomendasi beli/jual saham.

---

## 5. Konteks Akademik & Research Contributions (Skripsi)

### 5.1 Kontribusi Penelitian Utama
1. **Data Integration**: Menyatukan heterogenitas market data, historical price, data fundamental terstruktur, sentimen berita, dan catatan transaksi portofolio ke dalam satu arsitektur platform web.
2. **Context-Grounded LLM**: Mengubah data finansial terstruktur menjadi payload konteks sistem sebelum diserahkan ke Gemini API untuk memastikan respon AI faktual dan terbebas dari halusinasi data numerik.
3. **Multi-Stock Comparison Engine**: Membangun mekanisme analisis komparatif multi-emiten komprehensif lintas pilar fundamental dan performa historis.
4. **API Caching Strategy**: Mengimplementasikan dan menganalisis dampak caching PostgreSQL JSONB terhadap efisiensi kuota API eksternal, response time sistem, dan ketahanan aplikasi.
5. **Realistic Lot-Based Investment Simulation**: Memodelkan simulasi akumulasi berkala (DCA) yang akurat sesuai aturan pasar bursa Indonesia (satuan lot 100 lembar dan perputaran sisa kas).

### 5.2 Research Questions (RQ)
- **RQ1**: Bagaimana mengimplementasikan integrasi market data, historical data, fundamental data, dan company news ke dalam aplikasi analisis investasi saham berbasis web?
- **RQ2**: Bagaimana penerapan context-grounded Large Language Model dapat digunakan untuk menghasilkan penjelasan fundamental saham berdasarkan data yang tersedia pada sistem?
- **RQ3**: Seberapa konsisten respons AI terhadap data fundamental, historical data, dan berita yang diberikan sebagai context?
- **RQ4**: Bagaimana penerapan mekanisme caching dapat mengurangi jumlah request terhadap API eksternal dan meningkatkan performa aplikasi?
- **RQ5**: Bagaimana sistem dapat melakukan simulasi investasi berkala menggunakan historical market data dengan mempertimbangkan mekanisme perdagangan berbasis lot?
- **RQ6**: Bagaimana sistem dapat membantu pengguna (baik pemula maupun yang telah berpengalaman) menganalisis perbedaan fundamental beberapa saham melalui fitur stock comparison yang terintegrasi?
- **RQ7**: Bagaimana fitur edukasi dan AI Investment Tutor dapat digunakan untuk membantu investor pemula memahami konsep dasar investasi dan analisis fundamental saham secara terstruktur?
