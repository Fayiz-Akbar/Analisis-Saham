# MODULE: PORTFOLIO HEALTH SCORE (PHS) & RISK EVALUATION

## Overview
Modul Portfolio Health Score (PHS) and Risk Evaluation bertindak sebagai instrumen evaluasi komposit kesehatan dan profil risiko portofolio virtual pengguna. Mengacu pada prinsip perancangan indeks komposit, PHS mengintegrasikan dua indikator kuantitatif utama: **Return on Investment (ROI)** untuk mengukur performa akumulasi nilai investasi, dan **Volatilitas Imbal Hasil ($s$)** untuk mengukur besarnya fluktuasi imbal hasil periodik portofolio virtual. Modul ini menyajikan nilai mentah indikator, skor komposit, serta analisis naratif edukatif, sekaligus menerapkan aturan ketat kecukupan data ($n \ge 2$) agar estimasi risiko tidak dihasilkan secara prematur.

---

## Objectives
1. Mengukur performa portofolio virtual secara matematis melalui Return on Investment (ROI) terhadap modal awal virtual.
2. Mengukur risiko portofolio virtual melalui simpangan baku (*sample standard deviation*) dari imbal hasil periodik.
3. Menerapkan metodologi indeks komposit: normalisasi skala indikator, penetapan arah kontribusi, pembobotan, dan penggabungan skor.
4. Menegakkan aturan integritas data: jika riwayat pengamatan belum mencukupi ($n < 2$), sistem menampilkan nilai indikator yang tersedia disertai status keterbatasan data tanpa menghasilkan skor akhir komposit PHS.
5. Menyediakan visualisasi dan penjelasan edukatif bahwa keuntungan akhir portofolio perlu dievaluasi bersamaan dengan tingkat fluktuasi risikonya.

---

## Stakeholders
### Investor (End-User / Calon Investor)
Memahami dasar perhitungan evaluasi portofolionya dalam lingkungan virtual, menyadari hubungan antara imbal hasil dan fluktuasi risiko, serta mempelajari prinsip kehati-hatian sebelum berinvestasi dengan uang riil.
### Researcher / Tim Pengembang (Firman Farel Richardo)
Menganalisis perilaku PHS terhadap variasi imbal hasil, sensitivitas perubahan bobot normalisasi, dan ketahanan algoritma saat menghadapi kekurangan data.

---

## Functional Requirements (KF-13, KF-14, PB-07)
- **KF-13**: Sistem menghitung Portfolio Health Score (PHS) berdasarkan dua indikator, yaitu performa portofolio melalui ROI dan risiko portofolio melalui volatilitas imbal hasil, setelah memeriksa ketersediaan, kelengkapan, dan konsistensi interval data pengamatan.
- **KF-14**: Sistem menampilkan nilai ROI mentah (%), volatilitas imbal hasil periodik (%), skor komposit PHS, dan narasi penjelasan. Apabila data riwayat belum memenuhi syarat batas kecukupan estimasi risiko ($n < 2$), sistem tetap menyajikan indikator yang ada beserta status keterbatasan data tanpa memunculkan skor akhir komposit PHS.
- **FR-PHS-003**: Sistem menyimpan snapshot nilai portofolio virtual harian/periodik secara otomatis pada interval yang konsisten.
- **FR-PHS-004**: Sistem menyajikan visualisasi grafik pergerakan nilai portofolio dan tren imbal hasil periodik.

---

## Model Matematika & Formulasi PHS

### 1. Indikator Performa: Return on Investment (ROI)
ROI mengukur perubahan nilai total portofolio terhadap modal awal ($V_0 > 0$):
$$\text{ROI} = \left( \frac{V_t - V_0}{V_0} \right) \times 100\% \quad \text{--- (Rumus 2.1)}$$
- $V_t$: Nilai total portofolio saat evaluasi (meliputi saldo kas virtual ditambah nilai pasar seluruh saham yang dimiliki).
- $V_0$: Modal awal virtual ($V_0 > 0$).
- *Arah Kontribusi*: ROI yang lebih tinggi dipetakan ke skor performa yang lebih tinggi.

### 2. Indikator Risiko: Volatilitas Imbal Hasil Portofolio ($s$)
Volatilitas mengukur fluktuasi imbal hasil antar-periode pengamatan yang konsisten:
$$r_t = \left( \frac{V_t - V_{t-1}}{V_{t-1}} \right) \times 100\% \quad \text{--- (Rumus 2.2)}$$
$$s = \sqrt{\frac{\sum_{t=1}^n (r_t - \bar{r})^2}{n - 1}} \quad \text{--- (Rumus 2.3)}$$
- $r_t$: Imbal hasil periode ke-$t$ terhadap periode sebelumnya ($V_{t-1} > 0$).
- $\bar{r}$: Rata-rata imbal hasil selama periode pengamatan.
- $n$: Jumlah periode imbal hasil yang tercatat (mensyaratkan $n \ge 2$).
- *Arah Kontribusi Terbalik*: Volatilitas yang lebih tinggi menunjukkan fluktuasi yang lebih berisiko, sehingga normalisasi volatilitas menggunakan **arah penilaian terbalik** (fluktuasi rendah menghasilkan skor risiko yang tinggi).

### 3. Agregasi Komposit & Normalisasi
- Indikator ROI dan Volatilitas terlebih dahulu dinormalisasi ke skala acuan [0, 100].
- Skor Komposit PHS dihitung dengan membobotkan skor performa ($w_{\text{roi}}$) dan skor risiko ($w_{\text{vol}}$):
  $$\text{PHS} = (w_{\text{roi}} \times S_{\text{ROI}}) + (w_{\text{vol}} \times S_{\text{Vol}})$$
- Nilai numerik ROI dan Volatilitas mentah selalu disajikan berdampingan dengan skor PHS agar pengguna memahami dasar perhitungannya.

---

## Business Rules & Guardrails
- **BR-PHS-001**: Syarat minimum data untuk menghitung simpangan baku sampel adalah $n \ge 2$ data imbal hasil (membutuhkan minimal 3 titik snapshot nilai portofolio berturut-turut).
- **BR-PHS-002**: Jika $n < 2$, sistem dilarang menggenerasikan skor akhir komposit PHS. Antarmuka menampilkan label: *"Kecukupan Data: Belum Memenuhi Syarat (Minimal 2 periode imbal hasil)"*.
- **BR-PHS-003**: PHS merupakan instrumen pembelajaran dalam lingkungan virtual, bukan indeks baku bursa, bukan jaminan kualitas mutlak keputusan investasi, dan bukan anjuran beli/jual saham.

---

## Workflow Evaluasi PHS

```text
Pengguna Membuka Halaman Portfolio Health Score (/portfolio/health)
                            │
                            ▼
GET /api/portfolio/health-score
                            │
                            ▼
Backend HealthScoreService:
 ├── Ambil Modal Awal Virtual (V0) dan Nilai Portofolio Terkini (Vt)
 ├── Hitung ROI = ((Vt - V0) / V0) * 100
 ├── Ambil Riwayat Snapshot Nilai Portofolio Harian (V1, V2, ..., Vn)
 ├── Periksa Syarat Kecukupan Data (n >= 2):
 │    ├── JIKA n < 2:
 │    │    └── Return status INSUFFICIENT_DATA, tampilkan ROI mentah, skor PHS = null
 │    └── JIKA n >= 2:
 │         ├── Hitung imbal hasil rt untuk setiap periode
 │         ├── Hitung simpangan baku sampel (s)
 │         ├── Normalisasi S_ROI (arah positif) & S_Vol (arah terbalik)
 │         ├── Hitung skor komposit PHS berbobot
 │         └── Format respon lengkap (ROI, Volatilitas, PHS, Status)
                            │
                            ▼
Frontend Merender Antarmuka Health Score:
 ├── Metric Card ROI (%) & Status Keuntungan/Kerugian
 ├── Metric Card Volatilitas (%) & Indikator Stabilitas
 ├── Gauge Meter Skor PHS (0-100) atau Peringatan Data Belum Cukup
 └── Analisis Penjelasan Edukatif
```

---

## Database Design

```sql
-- Snapshot Nilai Portofolio Periodik untuk Menghitung Volatilitas
CREATE TABLE portfolio_daily_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_portfolio_value NUMERIC(15, 2) NOT NULL,
    cash_balance NUMERIC(15, 2) NOT NULL,
    stocks_market_value NUMERIC(15, 2) NOT NULL,
    period_return_pct NUMERIC(8, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_snapshot_date UNIQUE(user_id, snapshot_date)
);
CREATE INDEX idx_snapshots_user_date ON portfolio_daily_snapshots(user_id, snapshot_date ASC);
```

---

## API Endpoints

| Method | Path | Purpose | Authorization | Request Body | Response Status |
|---|---|---|---|---|---|
| `GET` | `/api/portfolio/health-score` | Mengambil metrik ROI, volatilitas, dan skor PHS | Bearer JWT | None | `200 OK` |
| `POST` | `/api/portfolio/snapshots` | Mencatat snapshot harian nilai portofolio (Cron / trigger) | Bearer JWT / Internal | `{ "total_value": 1100000, "cash": 500000 }` | `201 Created` |
