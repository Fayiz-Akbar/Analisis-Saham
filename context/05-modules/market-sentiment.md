# MODULE: GLOBAL MARKET & SENTIMENT

## Overview
Modul Global Market & Sentiment menyajikan gambaran makro mengenai dinamika perdagangan di Bursa Efek Indonesia (IDX) serta faktor eksternal yang mempengaruhinya. Halaman ini memvisualisasikan pergerakan Indeks Harga Saham Gabungan (IHSG), volume perdagangan harian, persebaran saham penggerak pasar (*top gainers & top losers*), **indeks bursa saham global utama (Dow Jones, S&P 500, Nasdaq, Nikkei 225, Hang Seng)**, **harga komoditas acuan strategis (Minyak Mentah, Emas, Batubara, Nikel, CPO)**, kurasi berita ekonomi makro, serta **AI Macro Assistant** yang mensintesis kondisi pasar hari ini menjadi indikator sentimen terstruktur (Positif, Netral, atau Negatif) beserta faktor-faktor pendorong utamanya.

---

## Objectives
1. Memberikan pemahaman komprehensif mengenai arah tren pasar bursa secara makro domestik maupun global.
2. Menampilkan daftar saham dengan volatilitas dan volume transaksi tertinggi hari ini di IDX.
3. Menyajikan pergerakan indeks bursa global utama dan harga komoditas strategis yang memiliki korelasi kuat terhadap pasar modal Indonesia.
4. Mengagregasi berita ekonomi makro dan kebijakan moneter yang memengaruhi iklim investasi.
5. Menyediakan **AI Macro Assistant** yang merangkum data pasar (domestik, global, komoditas) dan berita menjadi sintesis sentimen faktual berbasis konteks.

---

## Stakeholders
### Investor Pemula
Membantu memahami suasana umum pasar modal ("Apakah bursa sedang optimis atau pesimis hari ini?") melalui penjelasan AI yang mudah dicerna dan grafik pasar yang terpadu.
### Investor Berpengalaman
Memeriksa *market breadth*, volume transaksi total, pergerakan bursa Wall Street & Asia, sentimen harga komoditas ekspor (batubara, nikel, CPO), sektor mana yang sedang memimpin penguatan (*sector rotation*), dan berita katalis makroekonomi untuk pertimbangan alokasi aset.

---

## Functional Requirements
- **FR-MKT-001**: Sistem harus menampilkan nilai terkini indeks IHSG (`^JKSE`), poin perubahan, persentase perubahan, rentang tertinggi/terendah harian, dan grafik pergerakan intraday/historis.
- **FR-MKT-002**: Sistem harus menyajikan tabel daftar saham *Top Gainers* dan *Top Losers* berdasarkan persentase perubahan harga harian di BEI.
- **FR-MKT-003**: Sistem harus menampilkan daftar saham dengan volume dan nilai transaksi (*turnover*) terbesar.
- **FR-MKT-004**: Sistem harus mengagregasi berita pasar modal dan ekonomi makro dari tabel `news_cache`.
- **FR-MKT-005**: **[Global Indices]** Sistem harus menampilkan kartu indikator pergerakan indeks bursa global utama mencakup:
  - Amerika Serikat: S&P 500 (`^GSPC`), Dow Jones Industrial Average (`^DJI`), Nasdaq (`^IXIC`).
  - Asia Pasifik: Nikkei 225 (`^N225`), Hang Seng Index (`^HSI`), Straits Times Index (`^STI`).
  - Metrik: Nilai indeks terakhir, poin perubahan, dan persentase perubahan harian (%).
- **FR-MKT-006**: **[Commodities]** Sistem harus menampilkan kartu indikator harga komoditas acuan yang berpengaruh langsung terhadap emiten bursa Indonesia mencakup:
  - Energi: Minyak Mentah WTI / Brent (`CL=F`, `BZ=F`), Batubara Newcastle (*Coal*).
  - Logam Berharga & Industri: Emas Dunia (*Gold* `GC=F`), Nikel LME (*Nickel*).
  - Agrikultur: Minyak Kelapa Sawit (*Crude Palm Oil / CPO*).
  - Metrik: Harga satuan saat ini, satuan ukur (USD/barel, USD/oz, USD/ton), dan perubahan persentase harian (%).
- **FR-MKT-007**: Sistem harus menyediakan endpoint dan antarmuka **AI Macro Assistant** (`POST /api/ai/market-analysis`) untuk menganalisis sentimen pasar hari ini berdasarkan payload data pasar (IHSG, Global Indices, Komoditas) + berita makro terkini.
- **FR-MKT-008**: Output AI Macro Assistant harus menyajikan badge sentimen (Positive / Neutral / Negative), ringkasan naratif, dan minimal 3 faktor pendorong utama (domestik/global).

---

## Business Rules
- **BR-MKT-001**: AI Macro Assistant dilarang memprediksi pergerakan indeks besok sebagai fakta mutlak atau memberikan saran masuk/keluar pasar (*market timing*).
- **BR-MKT-002**: Sintesis sentimen pasar wajib grounded pada data pergerakan IHSG, bursa global, komoditas, dan berita yang dikumpulkan dalam kurun 24 jam terakhir.
- **BR-MKT-003**: Data ringkasan pasar domestik dan global di-cache di PostgreSQL JSONB dengan TTL 3–5 menit selama jam operasional bursa, sedangkan komoditas di-cache dengan TTL 15–30 menit.

---

## Workflow
```text
User Access /market-sentiment
           │
           ▼
Load Parallel Market Data ke Backend:
 ├── GET /api/stocks/market-sentiment (IHSG, Gainers/Losers, Global Indices, Commodities, News)
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
 ├── Ringkasan Bursa Global (Dow Jones, S&P 500, Nikkei, Hang Seng)
 ├── Ringkasan Harga Komoditas Acuan (Minyak, Emas, Batubara, Nikel, CPO)
 ├── Daftar 5 Top Gainers & 5 Top Losers IDX
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
- Menggunakan data dari `api_cache`:
  - `data_type = 'ihsg_quote'`
  - `data_type = 'market_movers'`
  - `data_type = 'global_indices'` (Array JSON indeks global)
  - `data_type = 'commodities'` (Array JSON harga komoditas)
- Menggunakan data dari `news_cache` (`symbol IS NULL` untuk berita makroekonomi).

---

## Backend Design
- **Services**:
  - `MarketDataService.js`: `getIhsgData()`, `getMarketMovers()`, `getGlobalIndices()`, `getCommoditiesData()`.
  - `NewsService.js`: `getMacroeconomicNews()`.
  - `AIService.js`: `analyzeMarketSentiment({ ihsg, global_indices, commodities, movers, news })`.
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
  "global_indices": [
    { "name": "S&P 500", "value": 5620.10, "change_percent": 0.42 },
    { "name": "Dow Jones", "value": 41500.50, "change_percent": 0.25 },
    { "name": "Nikkei 225", "value": 38700.00, "change_percent": -0.15 }
  ],
  "commodities": [
    { "name": "Crude Oil (WTI)", "price": 72.50, "unit": "USD/bbl", "change_percent": 1.20 },
    { "name": "Gold", "price": 2580.00, "unit": "USD/oz", "change_percent": 0.35 },
    { "name": "Coal (Newcastle)", "price": 142.00, "unit": "USD/ton", "change_percent": -0.80 },
    { "name": "Nickel", "price": 16400.00, "unit": "USD/ton", "change_percent": 2.10 }
  ],
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
| `GET` | `/api/stocks/market-sentiment` | Data pergerakan pasar IDX, bursa global, komoditas & makro | Public | None | `200 OK` |
| `POST` | `/api/ai/market-analysis` | Analisis AI sentimen pasar harian | Bearer JWT | `{ query?: string }` | `200 OK` |

### Sample JSON Response (`GET /api/stocks/market-sentiment`)
```json
{
  "success": true,
  "message": "Data sentimen dan pasar berhasil diambil",
  "data": {
    "ihsg": {
      "value": 7720.45,
      "change": 45.20,
      "change_percent": 0.59,
      "high": 7735.10,
      "low": 7695.30,
      "volume": 18500000000
    },
    "global_indices": [
      { "symbol": "^GSPC", "name": "S&P 500", "value": 5620.10, "change_percent": 0.42 },
      { "symbol": "^DJI", "name": "Dow Jones", "value": 41500.50, "change_percent": 0.25 },
      { "symbol": "^IXIC", "name": "Nasdaq", "value": 17680.20, "change_percent": 0.65 },
      { "symbol": "^N225", "name": "Nikkei 225", "value": 38700.00, "change_percent": -0.15 },
      { "symbol": "^HSI", "name": "Hang Seng", "value": 17420.00, "change_percent": 0.80 }
    ],
    "commodities": [
      { "name": "Minyak Mentah (WTI)", "price": 72.50, "unit": "USD/barrel", "change_percent": 1.20 },
      { "name": "Emas (Gold)", "price": 2580.00, "unit": "USD/t.oz", "change_percent": 0.35 },
      { "name": "Batubara (Newcastle)", "price": 142.00, "unit": "USD/ton", "change_percent": -0.80 },
      { "name": "Nikel (LME)", "price": 16400.00, "unit": "USD/ton", "change_percent": 2.10 },
      { "name": "Minyak Sawit (CPO)", "price": 3950.00, "unit": "MYR/ton", "change_percent": 0.95 }
    ],
    "top_gainers": [
      { "symbol": "BRIS", "name": "Bank Syariah Indonesia Tbk", "price": 3110, "change_percent": 6.88 }
    ],
    "top_losers": [
      { "symbol": "GOTO", "name": "GoTo Gojek Tokopedia Tbk", "price": 52, "change_percent": -3.70 }
    ]
  }
}
```

---

## Frontend Design
- **Pages**: `MarketSentimentPage.jsx` (`/market-sentiment`).
- **Components**:
  - `IhsgHeroCard.jsx`: Tampilan nilai IHSG, grafik intraday, dan meteran sentimen pasar.
  - `GlobalIndicesGrid.jsx`: Grid kartu pemantau pergerakan indeks bursa Amerika dan Asia Pasifik.
  - `CommoditiesGrid.jsx`: Grid kartu harga komoditas acuan (Minyak, Emas, Batubara, Nikel, CPO) dengan indikator gain/loss.
  - `TopMoversTabs.jsx`: Tab interaktif antara Top Gainers, Top Losers, dan Most Active Volume.
  - `MacroNewsList.jsx`: Kurasi berita makroekonomi dengan filter tanggal.
  - `AiMacroAssistantCard.jsx`: Kartu dialog AI dengan tombol "Minta Sintesis Pasar Hari Ini".

---

## UI / UX Requirements
- Badge sentimen mencolok: Warna Hijau untuk *Positive Sentiment*, Kuning/Oranye untuk *Neutral*, dan Merah untuk *Negative*.
- Tooltip edukasi pada metrik pasar untuk membantu investor pemula memahami istilah seperti "Advancing Stocks", "Commodity Benchmark", atau "Market Turnover".

---

## AI Agent Instructions
- **AI Service Agent**: Pastikan format respons dari Gemini selalu divalidasi ke dalam skema JSON `{ sentiment, summary, main_factors, disclaimer }`. Injeksi data global indices dan commodities ke dalam konteks makro agar penalaran sentimen mencakup dampak harga komoditas terhadap bursa domestik.

