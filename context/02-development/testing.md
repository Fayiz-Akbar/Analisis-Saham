# Strategi & Protokol Pengujian: AI-Powered Fundamental Investment Analyzer

## 1. Unit Test

Unit testing berfokus pada pengujian fungsi logika bisnis murni tanpa ketergantungan jaringan eksternal. Framework yang digunakan: **Jest** / **Vitest**.

### Cakupan Unit Testing Kritis:
1. **DCA Simulator Calculation (`dcaService.test.js`)**:
   - Memastikan pembelian saham hanya terjadi dalam kelipatan 100 lembar (1 lot).
   - Memvalidasi rollover sisa dana kas: Sisa dana bulan $t$ harus ditambahkan ke modal bulan $t+1$.
   - Menguji skenario ketika modal bulanan tidak cukup untuk membeli 1 lot (dana harus tetap tersimpan akumulatif).
   - Menghitung nilai akhir investasi, total modal yang disetor, dan persentase return secara presisi.
2. **Portfolio Metrics Calculation (`portfolioService.test.js`)**:
   - Kalkulasi weighted average price saat terjadi akumulasi transaksi BUY bertahap.
   - Kalkulasi Realized P/L saat eksekusi transaksi SELL parsial.
   - Kalkulasi Unrealized P/L berdasarkan quote harga saham terkini.
3. **Investment Health Score Algorithm (`riskService.test.js`)**:
   - Skenario A (100% 1 saham): Harus menghasilkan skor rendah (High Risk: 0–30).
   - Skenario B (50% Banking, 30% Consumer, 20% Infra): Menghasilkan skor moderat (31–60).
   - Skenario C (Tersebar merata di 5+ sektor berbeda): Menghasilkan skor Well Diversified (81–100).
4. **Cache TTL & Expiration Logic (`cacheService.test.js`)**:
   - Verifikasi apakah cache dianggap invalid ketika `now() > expires_at`.
   - Memastikan fallback berjalan mulus saat cache miss.

---

## 2. Integration Test

Integration testing menguji keterhubungan antar-komponen (Express Controllers, Middleware, Service Layer, dan Database PostgreSQL via Prisma).

### Cakupan Integration Testing:
1. **Auth Flow**:
   - Registrasi user baru -> verifikasi hash password di database -> login -> penerbitan JWT.
   - Proteksi rute privat: Pengujian request dengan token valid, token invalid, dan tanpa token.
2. **Stock & Comparison API**:
   - Pengujian kueri `POST /api/stocks/compare` dengan 2, 3, dan 4 ticker sekaligus.
   - Memastikan respon memuat seluruh metrik komparatif 4 pilar secara paralel.
3. **Database Transaction Integrity**:
   - Menghapus user harus menghapus seluruh watchlist dan transaksinya secara cascading (`ON DELETE CASCADE`).
   - Mencegah penghapusan master emiten jika masih terdapat riwayat transaksi portofolio (`ON DELETE RESTRICT`).

---

## 3. Evaluasi Khusus AI & Riset Akademik (AI Evaluation Protocol)

Sesuai dengan PRD Section 32, kualitas output AI diuji secara terstruktur menggunakan dataset pertanyaan evaluasi finansial terstandarisasi.

### 3.1 Metrik Pengujian Kualitas AI
1. **Factual Consistency (Konsistensi Faktual)**:
   - Mengukur apakah angka, rasio, dan fakta finansial yang disebutkan dalam respon AI sesuai $100\%$ dengan data context yang disuntikkan backend.
   - Formula:
     $$\text{Factual Consistency} = \frac{\text{Jumlah Klaim Faktual Benar}}{\text{Total Klaim Faktual dalam Respon}} \times 100\%$$
   - Target Skripsi: $\ge 95\%$.
2. **Hallucination Rate (Tingkat Halusinasi)**:
   - Mengukur frekuensi kemunculan angka numerik fiktif atau fakta yang tidak ada di dalam context.
   - Target Skripsi: $< 2\%$.
3. **Completeness (Kelengkapan Konteks)**:
   - Mengukur apakah metrik kunci yang diminta dalam pertanyaan (misal: PE, PBV, ROE) benar-benar terbahas dalam sintesis AI.
4. **Educational Clarity (Untuk AI Tutor)**:
   - Mengukur keterbacaan (*readability*) dan kemudahan penjelasan bagi investor pemula tanpa mereduksi esensi keilmuan finansial.

### 3.2 Cache Performance Evaluation Protocol (PRD Section 33)
Pengujian performa caching dilakukan dengan membandingkan 100 request berulang dengan dua kondisi:
- **Kondisi A (Tanpa Cache)**: Mengirim 100 request langsung ke external API provider.
- **Kondisi B (Dengan Cache PostgreSQL JSONB)**: Mengirim 100 request melalui `CacheService`.
- **Parameter yang diukur**:
  - Total External API Requests.
  - Average Latency Response Time (ms).
  - Cache Hit Ratio:
    $$\text{Cache Hit Ratio} = \frac{\text{Cache Hit}}{\text{Total Request}} \times 100\%$$
  - Error rate akibat limit kuota (HTTP 429).

---

## 4. End-to-End (E2E) Test

E2E testing memvalidasi skenario lengkap dari sudut pandang antarmuka pengguna di browser menggunakan **Playwright** / **Cypress**.

### Skenario Kunci E2E:
1. **Alur Investor Pemula**:
   - Buka `/register` -> Daftar akun -> Masuk ke `/dashboard` -> Buka `/learn` -> Baca materi Level 1 -> Kerjakan Kuis -> Verifikasi perolehan skor -> Buka `/dca` -> Lakukan simulasi BBCA -> Lihat hasil simulasi.
2. **Alur Investor Berpengalaman**:
   - Login -> Buka `/screener` -> Terapkan filter ROE > 15% & Sektor Banking -> Pilih 3 saham hasil screener -> Klik "Bandingkan" -> Masuk ke `/compare` -> Periksa grafik komparasi -> Tanyakan AI Assistant -> Tambahkan ke `/watchlist`.

---

## 5. User Acceptance Testing (UAT)

UAT dilakukan terhadap perwakilan target pengguna (minimal 5 investor pemula dan 5 investor berpengalaman):
- **Instrumen**: Kuesioner System Usability Scale (SUS) dan checklist penyelesaian task (*Task Success Rate*).
- **Indikator Sukses**:
  - Task completion rate $\ge 90\%$ untuk seluruh skenario utama.
  - Skor SUS $\ge 75$ (Kategori *Good / Excellent*).

---

## 6. Regression Testing

- Dilakukan setiap kali terjadi penambahan fitur baru atau refactor pada `services/`.
- Memastikan perubahan pada modul portofolio atau DCA tidak merusak konsistensi data pada dashboard atau health score.
- Otomasi regresi dijalankan sebelum merge ke branch `main`.
