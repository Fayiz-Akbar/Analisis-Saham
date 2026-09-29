# Standar API: AI-Powered Fundamental Investment Analyzer

## 1. Authentication Standard

- Sistem menggunakan autentikasi berbasis **JSON Web Token (JWT)** stateless.
- Token ditransmisikan melalui HTTP Authorization Header dengan skema Bearer:
  ```http
  Authorization: Bearer <jwt_token_string>
  ```
- Masa berlaku token default adalah 7 hari.
- Endpoint publik (tanpa otorisasi):
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/stocks` (katalog umum)
  - `GET /api/stocks/search`
  - `GET /api/stocks/:symbol` (quote, fundamentals, history, news)
  - `GET /api/learning` (daftar materi publik)
  - `GET /api/learning/:slug`
- Endpoint privat (wajib token JWT):
  - `GET /api/auth/me`
  - `POST /api/stocks/compare` (bisa publik/privat, privat jika menyimpan histori)
  - Seluruh rute `/api/watchlist/*`
  - Seluruh rute `/api/portfolio/*`
  - Seluruh rute `/api/dca/*`
  - Seluruh rute `/api/learning/:id/progress` dan `/quiz/submit`
  - Seluruh rute `/api/ai/*`

---

## 2. Response Format

Seluruh respon REST API dari backend menggunakan struktur envelope JSON yang seragam dan konsisten:

### 2.1 Respon Sukses (Standard Success Envelope)
```json
{
  "success": true,
  "message": "Deskripsi singkat hasil operasi",
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-05T08:30:00.000Z",
    "version": "1.0"
  }
}
```

### 2.2 Respon Sukses Berpaginasi (Paginated Success Envelope)
```json
{
  "success": true,
  "message": "Data saham berhasil diambil",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_records": 125,
    "total_pages": 7
  },
  "meta": {
    "timestamp": "2026-09-05T08:30:00.000Z"
  }
}
```

---

## 3. Error Format

Apabila terjadi kegagalan (status HTTP $4xx$ atau $5xx$), format respon terstruktur sebagai berikut:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input yang diberikan tidak valid",
    "details": [
      {
        "field": "lot_quantity",
        "issue": "Jumlah lot harus lebih besar dari 0"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-09-05T08:30:00.000Z"
  }
}
```

Daftar Error Code Standar:
- `BAD_REQUEST`: Kesalahan sintaks atau parameter request tidak sesuai.
- `VALIDATION_ERROR`: Gagal validasi skema body atau query parameter.
- `UNAUTHORIZED`: Token tidak ditemukan atau token tidak valid.
- `FORBIDDEN`: Akses ditolak karena tidak memiliki izin terhadap resource.
- `NOT_FOUND`: Resource yang diminta tidak ditemukan (contoh: ticker saham tidak terdaftar).
- `CONFLICT`: Duplikasi data unik (contoh: email sudah terdaftar, saham sudah ada di watchlist).
- `RATE_LIMITED`: Terkena batasan frekuensi pemanggilan request.
- `AI_SERVICE_UNAVAILABLE`: Layanan Gemini API sementara tidak dapat dihubungi.
- `INTERNAL_SERVER_ERROR`: Kesalahan tidak terduga di sisi backend.

---

## 4. Endpoint List

| Method | Path | Purpose | Authorization | Request Body | Query Params | Status |
|--------|------|---------|---------------|--------------|--------------|--------|
| `POST` | `/api/auth/register` | Mendaftarkan akun pengguna baru | Public | `{ name, email, password }` | - | `201 Created` |
| `POST` | `/api/auth/login` | Otentikasi dan penerbitan token JWT | Public | `{ email, password }` | - | `200 OK` |
| `GET` | `/api/auth/me` | Mengambil profil user yang sedang login | Bearer JWT | - | - | `200 OK` |
| `GET` | `/api/stocks` | Katalog saham IDX terdaftar | Public | - | `page, limit, sector` | `200 OK` |
| `GET` | `/api/stocks/search` | Pencarian saham berdasarkan simbol/nama | Public | - | `q` | `200 OK` |
| `GET` | `/api/stocks/:symbol` | Detail lengkap emiten (quote + fundamental) | Public | - | - | `200 OK` |
| `GET` | `/api/stocks/:symbol/quote` | Quote harga terkini dan perubahan harian | Public | - | - | `200 OK` |
| `GET` | `/api/stocks/:symbol/history` | Data historis candlestick (OHLCV) | Public | - | `timeframe, from, to` | `200 OK` |
| `GET` | `/api/stocks/:symbol/fundamentals` | Rasio fundamental 4 pilar lengkap | Public | - | `period` | `200 OK` |
| `GET` | `/api/stocks/:symbol/news` | Berita terkini terkait emiten spesifik | Public | - | `limit` | `200 OK` |
| `POST` | `/api/stocks/compare` | Komparasi berdampingan 2–4 saham | Public / Bearer | `{ symbols: ["BBCA", "BBRI"] }` | - | `200 OK` |
| `GET` | `/api/watchlist` | Mengambil daftar saham pantauan user | Bearer JWT | - | - | `200 OK` |
| `POST` | `/api/watchlist` | Menambahkan saham ke daftar pantau | Bearer JWT | `{ symbol: "TLKM" }` | - | `201 Created` |
| `DELETE`| `/api/watchlist/:symbol` | Menghapus saham dari daftar pantau | Bearer JWT | - | - | `200 OK` |
| `GET` | `/api/portfolio` | Ringkasan portofolio, alokasi & holdings | Bearer JWT | - | - | `200 OK` |
| `POST` | `/api/portfolio/transactions` | Mencatat transaksi BUY/SELL berbasis lot | Bearer JWT | `{ symbol, transaction_type, price, lot_quantity, transaction_date }` | - | `201 Created` |
| `DELETE`| `/api/portfolio/transactions/:id` | Menghapus catatan transaksi | Bearer JWT | - | - | `200 OK` |
| `GET` | `/api/portfolio/health` | Evaluasi skor kesehatan & risiko portofolio | Bearer JWT | - | - | `200 OK` |
| `POST` | `/api/dca/simulate` | Menjalankan simulasi DCA lot realistis | Public / Bearer | `{ symbol, monthly_amount, period_months, start_date }` | - | `200 OK` |
| `GET` | `/api/learning` | Daftar topik kurikulum belajar 6 level | Public | - | `category, difficulty` | `200 OK` |
| `GET` | `/api/learning/:slug` | Detail artikel materi edukasi | Public | - | - | `200 OK` |
| `GET` | `/api/learning/:id/quiz` | Mengambil pertanyaan kuis per materi | Public / Bearer | - | - | `200 OK` |
| `POST` | `/api/learning/:id/progress` | Memperbarui status selesai membaca materi | Bearer JWT | `{ completed: true }` | - | `200 OK` |
| `POST` | `/api/learning/:id/quiz/submit` | Mengirim jawaban kuis dan menerima skor | Bearer JWT | `{ answers: [{ quiz_id, answer }] }` | - | `200 OK` |
| `POST` | `/api/ai/stock-analysis` | Analisis fundamental emiten berbasis AI | Bearer JWT | `{ symbol, question }` | - | `200 OK` |
| `POST` | `/api/ai/stock-comparison` | Sintesis komparasi multi-saham berbasis AI | Bearer JWT | `{ symbols: ["BBCA", "BBRI"], focus }` | - | `200 OK` |
| `POST` | `/api/ai/market-analysis` | Sintesis kondisi makro dan IHSG hari ini | Bearer JWT | `{ query }` | - | `200 OK` |
| `POST` | `/api/ai/portfolio-analysis` | Evaluasi naratif risiko & alokasi portofolio | Bearer JWT | `{ question }` | - | `200 OK` |
| `POST` | `/api/ai/dca-analysis` | Penjelasan edukatif hasil simulasi DCA | Bearer JWT | `{ simulation_payload }` | - | `200 OK` |
| `POST` | `/api/ai/tutor` | Tutor edukasi interaktif konsep investasi | Bearer JWT | `{ question, topic_slug }` | - | `200 OK` |

---

## 5. Sample JSON Responses

### 5.1 Success Response (`GET /api/stocks/BBCA`)
```json
{
  "success": true,
  "message": "Detail saham BBCA berhasil diambil",
  "data": {
    "symbol": "BBCA",
    "company_name": "PT Bank Central Asia Tbk",
    "sector": "Financials",
    "industry": "Commercial Banks",
    "price": {
      "current": 8850,
      "change": 125,
      "change_percent": 1.43,
      "open": 8750,
      "high": 8900,
      "low": 8725,
      "volume": 78240000,
      "updated_at": "2026-09-05T08:00:00Z"
    },
    "fundamentals": {
      "pe_ratio": 18.5,
      "pbv_ratio": 4.2,
      "roe": 23.4,
      "roa": 3.2,
      "der": 0.15,
      "net_margin": 45.2,
      "market_cap": 1090000000000000,
      "dividend_yield": 2.1
    }
  },
  "meta": {
    "source": "cache",
    "cached_at": "2026-09-05T07:55:00Z"
  }
}
```

### 5.2 Empty Response (`GET /api/watchlist` user baru)
```json
{
  "success": true,
  "message": "Daftar watchlist kosong",
  "data": [],
  "meta": {
    "total": 0
  }
}
```

### 5.3 Validation Error Response (`POST /api/portfolio/transactions`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data transaksi yang dikirim tidak valid",
    "details": [
      {
        "field": "lot_quantity",
        "issue": "Jumlah lot harus berupa bilangan bulat lebih dari 0"
      },
      {
        "field": "price",
        "issue": "Harga beli per lembar tidak boleh bernilai negatif"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-09-05T08:35:10.123Z"
  }
}
```

### 5.4 Authorization Error Response (`GET /api/portfolio`)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token autentikasi tidak ditemukan atau telah kedaluwarsa"
  },
  "meta": {
    "timestamp": "2026-09-05T08:36:00.000Z"
  }
}
```

### 5.5 System Error Response (External API Timeout Fallback)
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Provider data pasar sedang mengalami gangguan. Silakan coba beberapa saat lagi."
  },
  "meta": {
    "timestamp": "2026-09-05T08:37:00.000Z"
  }
}
```

---

## 6. Pagination Standard

Paginasi menggunakan query parameter berbasis limit dan page:
- `page`: Nomor halaman (1-indexed, default: `1`).
- `limit`: Jumlah data per halaman (default: `20`, maksimum: `100`).
- Formula Offset di database: `offset = (page - 1) * limit`.
- Seluruh endpoint dengan paginasi wajib mengembalikan objek `pagination` di tingkat terluar.

---

## 7. Validation Standard

Validasi dilakukan di tingkat middleware menggunakan library **Zod**:
- Parameter numerik wajib divalidasi tipe dan batas nilai (misal: `lot_quantity > 0`, `price >= 50` untuk harga minimum reguler IDX).
- Simbol ticker emiten IDX wajib divalidasi format string alfabet huruf kapital dengan panjang 4 hingga 6 karakter (contoh: regex `^[A-Z]{4,6}$`).
- Input string teks dibersihkan dari tag HTML berbahaya untuk mencegah XSS.
