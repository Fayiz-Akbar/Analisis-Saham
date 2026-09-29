# MODULE: PORTFOLIO & TRANSACTION TRACKING

## Overview
Modul Portfolio and Transaction Tracking menyediakan fungsi pencatatan portofolio investasi saham riil maupun simulasi berbasis transaksi lot (1 lot = 100 lembar). Modul ini mengotomatisasi kalkulasi *weighted average buy price*, keuntungan/kerugian belum terealisasi (*unrealized P/L*), keuntungan/kerugian terealisasi (*realized P/L*), serta menyajikan komposisi alokasi aset per emiten dan per sektor industri dalam diagram interaktif.

---

## Objectives
1. Memungkinkan pengguna mencatat riwayat transaksi beli (*BUY*) dan jual (*SELL*) saham IDX berbasis satuan lot secara presisi.
2. Mengkalkulasi harga perolehan rata-rata tertimbang (*weighted average buy price*) secara matematis akurat.
3. Menghitung nilai investasi total, nilai pasar terkini, dan akumulasi laba/rugi (nominal dan persentase).
4. Memvisualisasikan diversifikasi dan alokasi portofolio per saham dan per sektor.

---

## Stakeholders
### Investor Berpengalaman
Memerlukan pencatatan multi-transaksi yang akurat dengan kalkulasi realized P/L saat melakukan *profit taking* atau *rebalancing* parsial.
### Investor Pemula
Mempelajari bagaimana transaksi bertahap mempengaruhi harga beli rata-rata (*averaging up / averaging down*) dan memantau kinerja portofolionya.

---

## Functional Requirements
- **FR-PTF-001**: Sistem harus menyediakan form pencatatan transaksi dengan field input: Simbol Saham, Tipe Transaksi (`BUY` / `SELL`), Harga per lembar (Rp), Jumlah Lot, dan Tanggal Transaksi (`POST /api/portfolio/transactions`).
- **FR-PTF-002**: Sistem harus secara otomatis mengkonversi satuan lot ke jumlah lembar saham ($1\text{ lot} = 100\text{ lembar}$).
- **FR-PTF-003**: Sistem harus menghitung ringkasan portofolio: Total Modal Diinvestasikan, Total Nilai Pasar Terkini, Total Unrealized P/L (Rp), Total Realized P/L (Rp), dan Total Return (%).
- **FR-PTF-004**: Sistem harus menyajikan tabel kepemilikan saham aktif (*Holdings*) mencakup: Simbol, Nama Perusahaan, Total Lot, Total Lembar, Harga Beli Rata-Rata (*Avg Price*), Harga Terkini, Nilai Modal, Nilai Pasar, P/L Nominal, dan Return (%).
- **FR-PTF-005**: Sistem harus menampilkan diagram pie/donat komposisi alokasi portofolio berdasarkan saham individual dan sektor industri.
- **FR-PTF-006**: Sistem harus menyediakan tabel riwayat seluruh transaksi (*Transaction History*) dengan opsi menghapus entri transaksi tertentu (`DELETE /api/portfolio/transactions/:id`).
- **FR-PTF-007**: Sistem harus memvalidasi agar transaksi `SELL` tidak melebihi jumlah lot yang sedang dimiliki (*no short selling*).

---

## Business Rules & Formulas
- **BR-PTF-001**: Minimum jumlah lot transaksi adalah 1 lot (bilangan bulat positif).
- **BR-PTF-002**: Formula Kalkulasi Average Buy Price (Averaging):
  $$\text{Avg Price}_{\text{baru}} = \frac{(\text{Qty Lama} \times \text{Avg Price Lama}) + (\text{Qty Beli Baru} \times \text{Harga Beli Baru})}{\text{Qty Lama} + \text{Qty Beli Baru}}$$
- **BR-PTF-003**: Formula Realized P/L (pada transaksi `SELL`):
  $$\text{Realized P/L} = \text{Qty Jual} \times (\text{Harga Jual} - \text{Avg Price Beli})$$
- **BR-PTF-004**: Formula Unrealized P/L (pada sisa kepemilikan aktif):
  $$\text{Unrealized P/L} = \text{Sisa Qty Lembar} \times (\text{Harga Pasar Terkini} - \text{Avg Price Beli})$$
- **BR-PTF-005**: Penjualan saham mengurangi kuantitas lot kepemilikan tanpa mengubah harga beli rata-rata (*Avg Buy Price*) dari sisa saham yang masih ada.

---

## Workflow
```text
User Submits Transaction Modal
(e.g., Symbol: BBCA, Type: BUY, Price: Rp8.000, Lots: 2, Date: 2026-08-20)
           │
           ▼
POST /api/portfolio/transactions
           │
           ▼
Backend Validation:
 ├── Jumlah lot > 0?
 ├── Jika SELL: Apakah user memiliki lot >= Qty Jual?
           │
           ▼
Insert ke Tabel `portfolio_transactions`
           │
           ▼
Recalculate User Portfolio Summary & Holdings
           │
           ▼
Return 201 Created ──> Refresh Portfolio UI & Allocation Chart
```

---

## Database Design

### Table `portfolio_transactions`
```sql
CREATE TABLE portfolio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE RESTRICT,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    price NUMERIC(15, 2) NOT NULL CHECK (price > 0),
    lot_quantity INTEGER NOT NULL CHECK (lot_quantity > 0),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_portfolio_user_id ON portfolio_transactions(user_id);
CREATE INDEX idx_portfolio_symbol ON portfolio_transactions(symbol);
```

---

## Backend Design
- **Services**: `PortfolioService.js`:
  - `addTransaction(userId, transactionData)`
  - `deleteTransaction(userId, transactionId)`
  - `getUserHoldings(userId)`
  - `getPortfolioSummary(userId)`
  - `getTransactionHistory(userId)`
- **Calculation Engine**: `portfolioCalculator.js` memproses deretan transaksi berurutan berdasarkan tanggal untuk menyusun saldo kepemilikan akhir.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/portfolio` | Ringkasan, holdings & alokasi | Bearer JWT | None | `200 OK` |
| `POST` | `/api/portfolio/transactions`| Tambah transaksi BUY/SELL | Bearer JWT | `{ symbol, transaction_type, price, lot_quantity, transaction_date }` | `201 Created` |
| `DELETE`| `/api/portfolio/transactions/:id`| Hapus catatan transaksi | Bearer JWT | None | `200 OK` |
| `GET` | `/api/portfolio/transactions`| Riwayat seluruh transaksi | Bearer JWT | None | `200 OK` |

### Sample JSON Response (`GET /api/portfolio`)
```json
{
  "success": true,
  "message": "Data portofolio berhasil diambil",
  "data": {
    "summary": {
      "total_invested": 1600000,
      "total_current_value": 1770000,
      "total_unrealized_pl": 170000,
      "total_realized_pl": 0,
      "total_return_percent": 10.63
    },
    "holdings": [
      {
        "symbol": "BBCA",
        "company_name": "PT Bank Central Asia Tbk",
        "sector": "Financials",
        "total_lots": 2,
        "total_shares": 200,
        "avg_buy_price": 8000,
        "current_price": 8850,
        "invested_value": 1600000,
        "current_value": 1770000,
        "unrealized_pl": 170000,
        "return_percent": 10.63,
        "weight_percent": 100.0
      }
    ],
    "allocation": {
      "by_stock": [ { "symbol": "BBCA", "percentage": 100.0 } ],
      "by_sector": [ { "sector": "Financials", "percentage": 100.0 } ]
    }
  }
}
```

---

## Frontend Design
- **Pages**: `PortfolioPage.jsx` (`/portfolio`).
- **Components**:
  - `PortfolioSummaryCards.jsx`: Kartu metrik (Total Nilai, Modal, Total P/L, Return).
  - `HoldingsTable.jsx`: Tabel interaktif kepemilikan saham dengan badge status laba/rugi.
  - `PortfolioAllocationChart.jsx`: Diagram donat visualisasi bobot saham dan sektor.
  - `AddTransactionModal.jsx`: Modal form input transaksi dengan kalkulasi otomatis total nilai (Lots $\times$ 100 $\times$ Price).
  - `TransactionHistoryTable.jsx`: Tabel riwayat transaksi dengan tombol hapus.

---

## Testing Scenarios
### Unit Test
- Uji averaging harga beli bertahap (contoh: beli 1 lot di 8.000, lalu beli 1 lot di 9.000 -> Avg price harus 8.500).
- Uji penjualan parsial dan kalkulasi realized P/L.
- Penolakan transaksi SELL jika lot melebihi kepemilikan.
### Integration Test
- Input transaksi -> Verifikasi perubahan nilai portofolio pada `/api/portfolio`.

---

## AI Agent Instructions
- **Backend Agent**: Pastikan kalkulasi matematis menggunakan tipe numerik dengan presisi terjaga (*floating point arithmetic safety*) sebelum dibulatkan ke format Rupiah.
- **Frontend Agent**: Sediakan validasi real-time pada modal transaksi: tampilkan estimasi total uang yang dibutuhkan ($Lots \times 100 \times Price$).
