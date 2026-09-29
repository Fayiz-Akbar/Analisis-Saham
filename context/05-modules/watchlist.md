# MODULE: WATCHLIST MANAGEMENT

## Overview
Modul Watchlist memungkinkan pengguna menyimpan, mengorganisasi, dan memantau emiten-emiten saham Bursa Efek Indonesia (IDX) pilihan mereka secara personal. Data watchlist disimpan secara persisten di database per akun pengguna (`user_id`), menyajikan pembaruan harga terkini, persentase perubahan harian, metrik valuasi cepat, serta akses langsung ke halaman detail analisis emiten maupun komparasi.

---

## Objectives
1. Menyediakan wadah pemantauan saham personal yang terisolasi dan persisten per akun pengguna.
2. Memperbarui harga pasar terkini dan pergerakan persentase harian saham dalam daftar pantau secara berkala.
3. Mempermudah navigasi langsung dari daftar pantau ke halaman Stock Detail dan Stock Comparison.

---

## Stakeholders
### Investor Pemula
Menyimpan saham-saham yang dipelajari di modul edukasi untuk mengamati bagaimana harga saham berfluktuasi sebelum memutuskan mulai berinvestasi.
### Investor Berpengalaman
Membuat daftar pantau emiten potensial hasil *screener* untuk menunggu momentum valuasi yang tepat (*entry point*).

---

## Functional Requirements
- **FR-WCH-001**: Pengguna terautentikasi dapat menambahkan emiten saham ke dalam watchlist personal (`POST /api/watchlist`).
- **FR-WCH-002**: Pengguna terautentikasi dapat menghapus emiten dari watchlist personal (`DELETE /api/watchlist/:symbol`).
- **FR-WCH-003**: Sistem harus menampilkan seluruh saham dalam watchlist pengguna beserta harga terkini, perubahan poin, perubahan persentase harian, sektor, PE, dan PBV (`GET /api/watchlist`).
- **FR-WCH-004**: Sistem harus mencegah penambahan simbol saham yang sama berulang kali (duplikasi) dalam satu akun pengguna.
- **FR-WCH-005**: Setiap kartu atau baris saham di watchlist harus menyediakan tombol pintas: "Lihat Detail", "Hapus", dan "Pilih untuk Komparasi".
- **FR-WCH-006**: Jika watchlist kosong, sistem harus menampilkan state kosong dengan tombol ajakan "Jelajahi Saham melalui Screener".

---

## Business Rules
- **BR-WCH-001**: Watchlist bersifat privat dan terikat pada `user_id` dari token JWT pengguna yang valid.
- **BR-WCH-002**: Simbol saham yang ditambahkan harus merupakan ticker resmi yang terdaftar pada tabel `stocks`.
- **BR-WCH-003**: Diterapkan batasan integritas basis data `UNIQUE(user_id, symbol)`.

---

## Workflow
```text
User Clicks "Tambah ke Watchlist" di Halaman Detail / Screener
            │
            ▼
POST /api/watchlist { symbol: "BBCA" }
            │
            ▼
Backend Memvalidasi:
 ├── User terautentikasi (JWT valid)?
 ├── Simbol BBCA ada di tabel `stocks`?
 └── Apakah sudah terdaftar di `watchlists` user ini?
            │
            ▼
Simpan ke Tabel `watchlists`
            │
            ▼
Return 201 Created ──> Update UI Status Button ("Tersimpan di Watchlist")
```

---

## Database Design

### Table `watchlists`
```sql
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_symbol UNIQUE(user_id, symbol)
);
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
```

---

## Backend Design
- **Services**: `WatchlistService.js` (metode: `getUserWatchlist(userId)`, `addStockToWatchlist(userId, symbol)`, `removeStockFromWatchlist(userId, symbol)`).
- **Middlewares**: `authMiddleware.js` untuk mengekstrak `req.user.id`.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/watchlist` | Ambil daftar saham pantauan user | Bearer JWT | None | `200 OK` |
| `POST` | `/api/watchlist` | Tambah saham ke watchlist | Bearer JWT | `{ "symbol": "BBCA" }` | `201 Created` |
| `DELETE` | `/api/watchlist/:symbol`| Hapus saham dari watchlist | Bearer JWT | None | `200 OK` |

### Sample JSON Response (`GET /api/watchlist`)
```json
{
  "success": true,
  "message": "Daftar watchlist berhasil diambil",
  "data": [
    {
      "symbol": "BBCA",
      "company_name": "PT Bank Central Asia Tbk",
      "sector": "Financials",
      "price": 8850,
      "change": 125,
      "change_percent": 1.43,
      "pe_ratio": 18.5,
      "pbv_ratio": 4.2,
      "added_at": "2026-09-05T08:15:00.000Z"
    }
  ],
  "meta": {
    "total_items": 1
  }
}
```

---

## Frontend Design
- **Pages**: `WatchlistPage.jsx` (`/watchlist`).
- **Components**:
  - `WatchlistTable.jsx`: Tabel data responsif dengan badge persentase perubahan harga berwarna hijau/merah.
  - `WatchlistEmptyState.jsx`: Tampilan grafis saat watchlist belum terisi.
  - `QuickSearchAddBar.jsx`: Bar pencarian cepat di bagian atas halaman untuk langsung menambahkan saham ke watchlist tanpa berpindah halaman.

---

## Testing Scenarios
### Unit Test
- Penolakan penambahan simbol yang tidak ada di master `stocks`.
### Integration Test
- User A menambahkan `BBCA` -> Berhasil.
- User A menambahkan `BBCA` lagi -> Menghasilkan error 409 Conflict.
- User B login -> Watchlist User B tidak terpengaruh oleh data User A (Isolasi Data).
- Hapus `BBCA` -> Entri terhapus dari basis data.

---

## AI Agent Instructions
- **Frontend Agent**: Sediakan animasi transisi saat baris watchlist dihapus (*exit animation*).
- **Backend Agent**: Pastikan kueri mengambil quote harga terkini dari `api_cache` secara efisien melalui batch query.
