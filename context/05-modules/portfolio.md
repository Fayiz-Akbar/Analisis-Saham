# MODULE: VIRTUAL TRADING, PORTFOLIO & TRANSACTION TRACKING

## Overview
Modul Virtual Trading, Portfolio, and Transaction Tracking menyediakan lingkungan simulasi perdagangan saham Bursa Efek Indonesia (IDX) berbasis **Modal Virtual Awal**. Modul ini memfasilitasi transaksi jual dan beli saham menggunakan saldo kas virtual dalam satuan lot (1 lot = 100 lembar), mengotomatisasi kalkulasi *weighted average buy price*, memantau nilai aset portofolio, menghitung *unrealized* dan *realized Profit/Loss*, serta menyajikan riwayat transaksi virtual secara komprehensif tanpa melibatkan dana nyata.

---

## Objectives
1. Menyediakan modal virtual awal (saldo kas simulasi) bagi setiap Investor baru untuk berlatih transaksi saham.
2. Memproses transaksi pembelian (*BUY*) dan penjualan (*SELL*) berbasis satuan lot (1 lot = 100 lembar) dengan validasi saldo kas dan kepemilikan saham (*no short selling*).
3. Mengkalkulasi harga perolehan rata-rata tertimbang (*weighted average buy price*) secara matematis presisi saat melakukan akumulasi saham.
4. Menghitung ringkasan portofolio virtual: saldo kas virtual, nilai pasar saham aktif, total nilai portofolio, serta akumulasi laba/rugi (realized dan unrealized P/L).
5. Menyajikan riwayat transaksi virtual kronologis sebagai bahan evaluasi pengambilan keputusan pengguna.
6. Membedakan lingkungan transaksi virtual utama dari skenario simulasi historis & DCA (yang tidak mengubah saldo atau portofolio utama).

---

## Stakeholders
### Investor (End-User / Calon Investor)
Mempraktikkan teori investasi secara langsung melalui eksekusi transaksi beli/jual dengan modal virtual, mempelajari dampak perubahan harga pasar terhadap nilai portofolionya, dan mengevaluasi riwayat transaksinya.

---

## Functional Requirements (KF-09, KF-10, KF-11, KF-12, PB-06, PB-08, PB-09)
- **KF-09**: Sistem menyediakan modal virtual awal (saldo kas virtual) yang dikreditkan ke akun Investor saat pendaftaran pertama kali.
- **KF-10**: Sistem memproses order pembelian (BUY) dan penjualan (SELL) saham virtual:
  - Pembelian (BUY): Memeriksa kecukupan saldo kas virtual. Jika cukup, sistem mendebit saldo kas virtual sebesar $(\text{Jumlah Lot} \times 100 \times \text{Harga Saham})$ dan menambah kepemilikan lot/lembar saham.
  - Penjualan (SELL): Memeriksa kepemilikan saham. Jika lot yang dimiliki mencukupi, sistem mengkreditkan dana ke saldo kas virtual dan mengurangi kuantitas kepemilikan saham. Penjualan yang melebihi kuantitas saham yang dimiliki ditolak (*no short selling*).
- **KF-11**: Sistem menyajikan tabel dan ringkasan portofolio virtual (*Holdings*) mencakup:
  - Saldo Kas Virtual (*Cash Balance*).
  - Nilai Pasar Seluruh Saham (*Total Equity/Stocks Value*).
  - Nilai Total Portofolio ($V_t = \text{Kas} + \text{Nilai Pasar Saham}$).
  - Daftar kepemilikan per saham: Simbol, Nama Emiten, Jumlah Lot, Jumlah Lembar, Harga Beli Rata-Rata (*Avg Buy Price*), Harga Pasar Terkini, Nilai Pasar, Unrealized P/L (Rp & %).
- **KF-12**: Sistem mencatat dan menyajikan riwayat seluruh transaksi virtual (*Transaction History*): Waktu/tanggal transaksi, simbol saham, tipe transaksi (BUY/SELL), kuantitas lot/lembar, harga per lembar saat transaksi, dan total nominal transaksi.

---

## Business Rules & Formulas
- **BR-PTF-001**: Satuan perdagangan minimal adalah 1 lot (100 lembar) dan hanya dapat berupa bilangan bulat positif.
- **BR-PTF-002**: Formula Kalkulasi Average Buy Price saat akumulasi (BUY):
  $$\text{Avg Price}_{\text{baru}} = \frac{(\text{Qty Lama} \times \text{Avg Price Lama}) + (\text{Qty Beli Baru} \times \text{Harga Beli Baru})}{\text{Qty Lama} + \text{Qty Beli Baru}}$$
- **BR-PTF-003**: Formula Realized P/L saat penjualan (SELL):
  $$\text{Realized P/L} = \text{Qty Lembar Jual} \times (\text{Harga Jual} - \text{Avg Price Beli})$$
- **BR-PTF-004**: Formula Unrealized P/L pada kepemilikan aktif:
  $$\text{Unrealized P/L} = \text{Qty Lembar Aktif} \times (\text{Harga Pasar Terkini} - \text{Avg Price Beli})$$
- **BR-PTF-005**: Penjualan saham mengurangi kuantitas kepemilikan lot tanpa mengubah harga perolehan rata-rata (*Avg Buy Price*) dari sisa saham yang masih tersisa.
- **BR-PTF-006**: Transaksi yang ditolak (karena saldo kas tidak cukup atau lot saham tidak cukup) tidak boleh mengubah saldo kas, kepemilikan, ataupun riwayat transaksi.
- **BR-PTF-007**: Seluruh tampilan antarmuka wajib mencantumkan penanda eksplisit bahwa saldo dan transaksi adalah simulasi virtual tanpa dana nyata.

---

## Database Design (PostgreSQL & Prisma)

```sql
-- Saldo Kas Virtual di Tabel Users
ALTER TABLE users ADD COLUMN virtual_balance NUMERIC(15, 2) NOT NULL DEFAULT 10000000.00;

-- Transaksi Virtual
CREATE TABLE virtual_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE RESTRICT,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    lots INTEGER NOT NULL CHECK (lots > 0),
    shares INTEGER NOT NULL CHECK (shares > 0),
    price_per_share NUMERIC(15, 2) NOT NULL CHECK (price_per_share > 0),
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount > 0),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_vtx_user_id ON virtual_transactions(user_id);
CREATE INDEX idx_vtx_symbol ON virtual_transactions(symbol);

-- Kepemilikan Saham Virtual Aktif (Holdings)
CREATE TABLE virtual_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE RESTRICT,
    lots INTEGER NOT NULL CHECK (lots >= 0),
    shares INTEGER NOT NULL CHECK (shares >= 0),
    avg_buy_price NUMERIC(15, 2) NOT NULL CHECK (avg_buy_price >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_stock_holding UNIQUE(user_id, symbol)
);
```

---

## Workflow Transaksi Virtual

```text
Investor Membuka Menu Transaksi Saham Virtual
                        │
                        ▼
Pilih Simbol Saham, Tipe Transaksi (BUY / SELL), Jumlah Lot
                        │
                        ▼
POST /api/portfolio/transactions
                        │
                        ▼
Backend Validation:
 ├── Ambil harga acuan pasar terkini (Yahoo Finance API / Cache)
 ├── JIKA BUY:
 │    ├── Hitung total_cost = lots * 100 * current_price
 │    ├── Apakah user.virtual_balance >= total_cost?
 │    │    ├── TIDAK ──> Tolak Transaksi (400 Saldo Kas Virtual Tidak Cukup)
 │    │    └── YA ────> Kurangi user.virtual_balance, update virtual_holdings, catat riwayat
 └── JIKA SELL:
      ├── Apakah virtual_holdings.lots >= lots?
           ├── TIDAK ──> Tolak Transaksi (400 Kepemilikan Saham Tidak Cukup)
           └── YA ────> Tambah user.virtual_balance, kurangi virtual_holdings, catat riwayat
                        │
                        ▼
Kembalikan 201 Created ──> Refresh Tampilan Portofolio & Saldo Kas
```

---

## API Endpoints

| Method | Path | Purpose | Authorization | Request Body | Response Status |
|---|---|---|---|---|---|
| `GET` | `/api/portfolio/summary` | Mengambil saldo kas, total aset, dan nilai total portofolio | Bearer JWT | None | `200 OK` |
| `GET` | `/api/portfolio/holdings` | Mengambil daftar saham yang dimiliki & average price | Bearer JWT | None | `200 OK` |
| `GET` | `/api/portfolio/history` | Mengambil riwayat kronologis transaksi virtual | Bearer JWT | None | `200 OK` |
| `POST` | `/api/portfolio/transactions` | Melakukan order transaksi virtual (BUY / SELL) | Bearer JWT | `{ "symbol": "BBCA", "type": "BUY", "lots": 2 }` | `201 Created` |
