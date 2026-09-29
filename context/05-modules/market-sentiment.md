# MODULE: GLOBAL MARKET & SENTIMENT

## Overview
Modul Global Market & Sentiment menyajikan gambaran makro mengenai dinamika perdagangan di Bursa Efek Indonesia (IDX). Halaman ini memvisualisasikan pergerakan Indeks Harga Saham Gabungan (IHSG), volume perdagangan harian, persebaran saham penggerak pasar (*top gainers & top losers*), kurasi berita ekonomi makro, serta **AI Macro Assistant** yang mensintesis kondisi pasar hari ini menjadi indikator sentimen terstruktur (Positif, Netral, atau Negatif) beserta faktor-faktor pendorong utamanya.

---

## Objectives
1. Memberikan pemahaman komprehensif mengenai arah tren pasar bursa secara makro.
2. Menampilkan daftar saham dengan volatilitas dan volume transaksi tertinggi hari ini.
3. Mengagregasi berita ekonomi makro dan kebijakan moneter yang memengaruhi iklim investasi.
4. Menyediakan **AI Macro Assistant** yang merangkum data pasar dan berita menjadi sintesis sentimen faktual berbasis konteks.

---

## Stakeholders
### Investor Pemula
Membantu memahami suasana umum pasar modal ("Apakah bursa sedang optimis atau pesimis hari ini?") melalui penjelasan AI yang mudah dicerna.
### Investor Berpengalaman
Memeriksa *market breadth*, volume transaksi total, sektor mana yang sedang memimpin penguatan (*sector rotation*), dan berita katalis makroekonomi untuk pertimbangan alokasi aset.

---

## Functional Requirements
- **FR-MKT-001**: Sistem harus menampilkan nilai terkini indeks IHSG, poin perubahan, persentase perubahan, rentang tertinggi/terendah harian, dan grafik pergerakan intraday/historis.
- **FR-MKT-002**: Sistem harus menyajikan tabel daftar saham *Top Gainers* dan *Top Losers* berdasarkan persentase perubahan harga harian.
- **FR-MKT-003**: Sistem harus menampilkan daftar saham dengan volume dan nilai transaksi (*turnover*) terbesar.
- **FR-MKT-004**: Sistem harus mengagregasi berita pasar modal dan ekonomi makro dari tabel `news_cache`.
- **FR-MKT-005**: Sistem harus menyediakan endpoint dan antarmuka **AI Macro Assistant** (`POST /api/ai/market-analysis`) untuk menganalisis sentimen pasar hari ini berdasarkan payload data pasar + berita terkini.
- **FR-MKT-006**: Output AI Macro Assistant harus menyajikan badge sentimen (Positive / Neutral / Negative), ringkasan naratif, dan minimal 3 faktor pendorong utama.

---

## Business Rules
- **BR-MKT-001**: AI Macro Assistant dilarang memprediksi pergerakan indeks besok sebagai fakta mutlak atau memberikan saran masuk/keluar pasar (*market timing*).
- **BR-MKT-002**: Sintesis sentimen pasar wajib grounded pada data pergerakan IHSG dan berita yang dikumpulkan dalam kurun 24 jam terakhir.
- **BR-MKT-003**: Data ringkasan pasar di-cache di PostgreSQL JSONB dengan TTL 3–5 menit selama jam operasional bursa.

---

## Workflow
```text
User Access /market-sentiment
           │
           ▼
Load Market Data (IHSG, Gainers, Losers, Volume) & Economic News
           │
           ▼
User Clicks "Analisis Sentimen Pasar Hari Ini"
           │
           ▼
POST /api/ai/market-analysis
           │
           ▼
ContextBuilder Mengumpulkan:
 ├── Nilai IHSG & Perubahan (%)
 ├── Daftar 5 Top Gainers & 5 Top Losers
 └── 5 Headline Berita Makroekonomi Terkini
           │
           ▼
Kirim Prompt Terstruktur ke Gemini API
           │
           ▼
Gemini Mengembalikan Output JSON:
 {
   "sentiment": "Positive" | "Neutral" | "Negative",
   "summary": "...",
   "main_factors": ["1...", "2...", "3..."],
   "disclaimer": "..."
 }
           │
           ▼
Render Badge Sentimen & Kartu Analisis Makro di Antarmuka
```

---

## Database Design
- Menggunakan data dari `api_cache` (`data_type = 'ihsg_quote'`, `data_type = 'market_movers'`).
- Menggunakan data dari `news_cache` (`symbol IS NULL` untuk berita makroekonomi).

---

## Backend Design
- **Services**:
  - `MarketDataService.js`: `getIhsgData()`, `getMarketMovers()`.
  - `NewsService.js`: `getMacroeconomicNews()`.
  - `AIService.js`: `analyzeMarketSentiment({ ihsg, movers, news })`.
- **Context Builder Schema**:
```json
{
  "market": {
    "index_name": "IHSG",
    "value": 7720.45,
    "change_percent": 0.59,
    "advancing_stocks": 280,
    "declining_stocks": 210
  },
  "top_gainers": [ "BRIS (+6.88%)", "BBCA (+1.43%)" ],
  "top_losers": [ "GOTO (-3.70%)" ],
  "macro_news": [
    "Bank Indonesia Pertahankan Suku Bunga Acuan BI-Rate",
    "Surplus Neraca Perdagangan Indonesia Berlanjut di Agustus"
  ]
}
```

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/stocks/market-sentiment` | Data pergerakan pasar & makro | Public | None | `200 OK` |
| `POST` | `/api/ai/market-analysis` | Analisis AI sentimen pasar harian | Bearer JWT | `{ query?: string }` | `200 OK` |

### Sample JSON Response (`POST /api/ai/market-analysis`)
```json
{
  "success": true,
  "message": "Analisis sentimen pasar berhasil diproses",
  "data": {
    "sentiment": "Positive",
    "summary": "Indeks Harga Saham Gabungan (IHSG) menguat +0,59% didorong oleh penguatan saham sektor perbankan dan berlanjutnya surplus neraca perdagangan nasional.",
    "main_factors": [
      "Penguatan saham perbankan berkapitalisasi besar seperti BBCA dan BRIS.",
      "Sentimen positif dari data makroekonomi terkait surplus neraca perdagangan.",
      "Stabilitas suku bunga acuan yang memberikan kepastian bagi pelaku pasar modal."
    ],
    "disclaimer": "Analisis ini disusun oleh AI berdasarkan data pasar dan berita terkini untuk tujuan edukasi, bukan rekomendasi investasi."
  }
}
```

---

## Frontend Design
- **Pages**: `MarketSentimentPage.jsx` (`/market-sentiment`).
- **Components**:
  - `IhsgHeroCard.jsx`: Tampilan nilai IHSG, grafik intraday, dan meteran sentimen pasar.
  - `TopMoversTabs.jsx`: Tab interaktif antara Top Gainers, Top Losers, dan Most Active Volume.
  - `MacroNewsList.jsx`: Kurasi berita makroekonomi dengan filter tanggal.
  - `AiMacroAssistantCard.jsx`: Kartu dialog AI dengan tombol "Minta Sintesis Pasar Hari Ini".

---

## UI / UX Requirements
- Badge sentimen mencolok: Warna Hijau untuk *Positive Sentiment*, Kuning/Oranye untuk *Neutral*, dan Merah untuk *Negative*.
- Tooltip edukasi pada metrik pasar untuk membantu investor pemula memahami istilah seperti "Advancing Stocks" atau "Market Turnover".

---

## AI Agent Instructions
- **AI Service Agent**: Pastikan format respons dari Gemini selalu divalidasi ke dalam skema JSON `{ sentiment, summary, main_factors, disclaimer }`. Jika Gemini mengembalikan teks markdown biasa, lakukan parsing terstruktur.
