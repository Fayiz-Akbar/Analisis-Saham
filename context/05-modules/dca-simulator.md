# MODULE: DOLLAR-COST AVERAGING (DCA) SIMULATOR

## Overview
Modul DCA Simulator menyediakan simulasi investasi berkala (*Dollar-Cost Averaging*) berbasis data harga pasar historis aktual emiten Bursa Efek Indonesia (IDX). Simulator ini mengimplementasikan **Realistic Lot Mode**, yaitu membatasi pembelian saham hanya dalam satuan kelipatan 100 lembar (1 lot penuh) dan mengakumulasikan sisa dana kas yang belum cukup membeli lot (*cash rollover*) ke alokasi bulan berikutnya. Fitur ini memecahkan kelemahan kalkulator investasi konvensional yang kerap mengasumsikan pembelian saham fraksional fiktif di pasar modal Indonesia.

---

## Objectives
1. Mensimulasikan akumulasi saham secara berkala (bulanan) menggunakan data historis candlestick aktual.
2. Menerapkan mekanisme perdagangan riil bursa Indonesia: satuan perdagangan minimal 1 lot (100 lembar).
3. Mengelola sisa dana kas bulanan secara akumulatif (*cash balance rollover*).
4. Menyajikan perbandingan kinerja strategi DCA terhadap total modal disetor, nilai akhir portofolio, dan perbandingan terhadap pembelian sekaligus (*Lump Sum*).
5. Menyediakan penjelasan edukatif dari **AI DCA Assistant** mengenai profil imbal hasil dan volatilitas yang terjadi selama periode simulasi.

---

## Stakeholders
### Investor Pemula
Menguji seberapa efektif strategi menyisihkan dana rutin (misal: Rp200.000, Rp500.000, atau Rp1.000.000 per bulan) pada saham tertentu sebelum mempraktikkannya dengan uang riil di pasar modal.
### Investor Berpengalaman
Melakukan *backtesting* kuantitatif strategi akumulasi jangka panjang (6, 12, 24, atau 36 bulan) untuk mengevaluasi *drawdown* dan harga perolehan rata-rata saat pasar sedang fluktuatif.

---

## Functional Requirements
- **FR-DCA-001**: Sistem harus menyediakan form input parameter simulasi:
  - Simbol Saham Ticker (contoh: "BBCA").
  - Alokasi Investasi Bulanan (Rupiah, misal: Rp500.000).
  - Periode Simulasi (6 bulan, 12 bulan, 24 bulan, 36 bulan, atau kustom tanggal).
  - Tanggal Eksekusi Pembelian Bulanan (contoh: tanggal 1, 15, atau 25 setiap bulan).
  - Mode Simulasi: `Realistic Lot Mode` (default) atau `Fractional Mode` (komparatif).
- **FR-DCA-002**: Sistem harus mengambil data harga historis harian dari tabel `api_cache` sesuai rentang tanggal yang dipilih.
- **FR-DCA-003**: Sistem harus mengeksekusi algoritma pembelian bulanan:
  - Hitung dana tersedia bulan ini: $\text{Dana Tersedia} = \text{Budget Bulanan} + \text{Sisa Kas Bulan Lalu}$.
  - Hitung harga 1 lot: $\text{Harga Lot} = \text{Harga Saham Hari Eksekusi} \times 100$.
  - Hitung lot yang dapat dibeli: $\text{Lot Dibeli} = \lfloor \frac{\text{Dana Tersedia}}{\text{Harga Lot}} \rfloor$.
  - Hitung dana terpakai: $\text{Dana Terpakai} = \text{Lot Dibeli} \times \text{Harga Lot}$.
  - Hitung sisa kas bulan ini: $\text{Sisa Kas} = \text{Dana Tersedia} - \text{Dana Terpakai}$.
- **FR-DCA-004**: Sistem harus menyajikan ringkasan hasil simulasi:
  - Total Modal Disetor (Total Budget yang disisihkan).
  - Total Lot Terkumpul & Total Lembar Saham.
  - Sisa Saldo Kas Terakhir (*Remaining Cash*).
  - Rata-rata Harga Pembelian (*Average Cost per Share*).
  - Nilai Investasi Saham Terkini ($Total Lembar \times Harga Terkini$).
  - Total Nilai Portofolio Akhir ($Nilai Saham + Sisa Kas$).
  - Total Laba/Rugi Bersih (Nominal Rp dan Persentase Return %).
- **FR-DCA-005**: Sistem harus menampilkan grafik visual perkembangan akumulasi portofolio (Garis Modal Disetor vs Garis Nilai Pasar Portofolio dari bulan ke bulan).
- **FR-DCA-006**: Sistem harus menyediakan tabel detail rincian transaksi per bulan: Bulan, Tanggal, Harga Saham, Dana Tersedia, Lot Dibeli, Dana Terpakai, Sisa Kas, dan Akumulasi Lot.
- **FR-DCA-007**: Sistem harus menyediakan tombol aksi **"Tanyakan AI tentang Hasil Simulasi Ini"** (`POST /api/ai/dca-analysis`).

---

## Business Rules
- **BR-DCA-001**: Dalam *Realistic Lot Mode*, pembelian saham hanya dapat bernilai bilangan bulat non-negatif ($0, 1, 2, \dots$ lot). Jika dana tersedia kurang dari harga 1 lot, jumlah lot dibeli adalah 0, dan seluruh dana menjadi sisa kas yang diteruskan ke bulan berikutnya.
- **BR-DCA-002**: Jika tanggal eksekusi jatuh pada hari libur bursa (Sabtu, Minggu, atau hari libur nasional), sistem menggunakan harga penutupan hari bursa aktif berikutnya (*next trading day*).
- **BR-DCA-003**: Nilai akhir portofolio wajib memasukkan sisa saldo kas yang belum terpakai secara akuntabel.

---

## Workflow
```text
User Submits DCA Form (Symbol: BBCA, Budget: Rp500.000/bln, Period: 12 bln, Date: Tgl 1)
           │
           ▼
POST /api/dca/simulate
           │
           ▼
Backend DCAService:
 ├── Fetch Historical OHLCV BBCA untuk 12 Bulan Terakhir
 ├── Loop Setiap Bulan (Bulan 1 s.d. Bulan 12):
 │    ├── Tentukan Tanggal Beli & Ambil Close Price
 │    ├── Hitung Lot Dibeli & Sisa Kas Rollover
 │    └── Catat Snapshot Bulan ke Array Rincian
 ├── Hitung Nilai Akhir Berdasarkan Harga Terkini
 └── Format Response Lengkap (Summary, Timeline, Chart Data)
           │
           ▼
Frontend Merender Hasil Simulasi:
 ├── Metric Cards (Modal Disetor, Nilai Akhir, Return %, Sisa Kas)
 ├── Timeline Area Chart (Modal vs Nilai Portofolio)
 ├── Detail Monthly Breakdown Table
 └── AI DCA Assistant Narrative Summary
```

---

## Backend Design
- **Services**:
  - `DCAService.js`:
    - `simulateDca({ symbol, monthlyAmount, periodMonths, executionDay, mode })`
    - `calculateMonthlyLots(price, availableBudget)`
  - `AIService.js`: `explainDcaResult(simulationData)`.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `POST` | `/api/dca/simulate` | Menjalankan kalkulasi simulasi DCA | Public / Bearer | `{ symbol, monthly_amount, period_months, execution_day }` | `200 OK` |
| `POST` | `/api/ai/dca-analysis` | Analisis edukatif hasil simulasi AI | Bearer JWT | `{ simulation_result }` | `200 OK` |

### Sample JSON Request (`POST /api/dca/simulate`)
```json
{
  "symbol": "BBCA",
  "monthly_amount": 1000000,
  "period_months": 12,
  "execution_day": 1
}
```

### Sample JSON Response (`POST /api/dca/simulate`)
```json
{
  "success": true,
  "message": "Simulasi DCA berhasil dihitung",
  "data": {
    "symbol": "BBCA",
    "summary": {
      "total_invested_budget": 12000000,
      "total_lots_acquired": 13,
      "total_shares_acquired": 1300,
      "remaining_cash": 425000,
      "stock_market_value": 11505000,
      "total_portfolio_value": 11930000,
      "net_profit_loss": -70000,
      "return_percent": -0.58,
      "average_cost_per_share": 8903.85,
      "current_price": 8850
    },
    "monthly_records": [
      {
        "month": 1,
        "date": "2025-09-01",
        "price": 8600,
        "available_budget": 1000000,
        "lot_purchased": 1,
        "shares_purchased": 100,
        "cost": 860000,
        "remaining_cash": 140000,
        "cumulative_lots": 1
      },
      {
        "month": 2,
        "date": "2025-10-01",
        "price": 8700,
        "available_budget": 1140000,
        "lot_purchased": 1,
        "shares_purchased": 100,
        "cost": 870000,
        "remaining_cash": 270000,
        "cumulative_lots": 2
      }
    ]
  }
}
```

---

## Frontend Design
- **Pages**: `DcaSimulatorPage.jsx` (`/dca`).
- **Components**:
  - `DcaConfigForm.jsx`: Slider dan input nominal budget bulanan, dropdown pilihan periode dan saham.
  - `DcaResultMetrics.jsx`: Kartu ringkasan hasil simulasi (Modal, Nilai Akhir, Lot, Sisa Kas, Return).
  - `DcaPerformanceChart.jsx`: Grafik area interaktif membandingkan akumulasi modal vs nilai portofolio.
  - `MonthlyBreakdownTable.jsx`: Tabel perincian transaksi bulanan dengan pagination/scroll.
  - `AiDcaInsightCard.jsx`: Kartu penjelasan naratif dari AI mengenai hasil simulasi.

---

## Testing Scenarios (PRD Section 34)
### Unit Test
- **Skenario A (Budget Rendah)**: Budget Rp100.000/bulan untuk saham harga Rp8.000/lembar (Rp800.000/lot) -> Bulan 1–7 beli 0 lot (dana terakumulasi Rp700.000). Pada bulan ke-8 (dana Rp800.000), sistem berhasil membeli 1 lot dan sisa kas menjadi Rp0.
- **Skenario B (Budget Moderat)**: Budget Rp1.000.000/bulan -> Memastikan sisa dana selalu bergulir dan tercatat di laporan akhir.
### Integration Test
- Menjalankan endpoint simulasi untuk emiten LQ45 dengan rentang waktu 6, 12, dan 24 bulan.

---

## AI Agent Instructions
- **Backend Agent**: Pastikan penanganan hari libur bursa tidak menyebabkan *array index out of bound*. Ambil bar candlestick terdekat berikutnya jika tanggal eksekusi adalah hari libur.
- **AI Service Agent**: Analisis AI DCA harus menyoroti efektivitas *averaging down* ketika harga pasar sedang turun dan mengedukasi pengguna mengenai pentingnya konsistensi jangka panjang.
