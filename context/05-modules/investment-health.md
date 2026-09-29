# MODULE: INVESTMENT HEALTH & RISK ANALYSIS

## Overview
Modul Investment Health and Risk Analysis bertindak sebagai instrumen audit kesehatan dan evaluasi profil risiko portofolio pengguna. Modul ini menghitung **Investment Health Score** (skala 0–100) yang memetakan tingkat risiko konsentrasi aset dan diversifikasi sektoral portofolio. Skor ini disajikan secara edukatif dan dilengkapi dengan analisis naratif dari **AI Risk Assistant** yang menerangkan potensi kerentanan portofolio tanpa mengeluarkan perintah transaksi beli/jual secara spekulatif.

---

## Objectives
1. Mendiagnosis tingkat diversifikasi dan konsentrasi portofolio saham pengguna secara kuantitatif.
2. Menghasilkan skor edukatif terukur: **High Risk (0–30)**, **Moderate (31–60)**, **Good (61–80)**, dan **Well Diversified (81–100)**.
3. Mendeteksi over-konsentrasi pada satu emiten tunggal (> 30%) atau satu sektor industri (> 50%).
4. Menyediakan penjelasan risiko berbasis AI yang mendidik pengguna mengenai pentingnya diversifikasi aset.

---

## Stakeholders
### Investor Pemula
Menyadari bahaya menaruh seluruh uang pada satu saham ("*Don't put all your eggs in one basket*") melalui visualisasi skor dan analogi yang mudah dipahami.
### Investor Berpengalaman
Mengaudit eksposur sektoral portofolio riil mereka untuk memastikan kepatuhan terhadap batasan risiko (*risk limit*) yang telah ditetapkan secara mandiri.

---

## Functional Requirements
- **FR-RSK-001**: Sistem harus menghitung skor kesehatan portofolio pengguna saat ini (`GET /api/portfolio/health`).
- **FR-RSK-002**: Skor kesehatan (0–100) harus diklasifikasikan ke dalam 4 kategori status dan badge pill:
  - `0–30`: **High Risk** (Konsentrasi ekstrem pada 1 saham / 1 sektor; Badge Merah `#FEF2F2` / `#2D0B0B`).
  - `31–60`: **Moderate Risk** (Diversifikasi terbatas; Badge Warm Peach `#F2D6A4` / `#36240D`).
  - `61–80`: **Good Health** (Diversifikasi proporsional di beberapa sektor; Badge Lime `#F2F6CD` / `#1A2E05`).
  - `81–100`: **Well Diversified** (Portofolio tersebar seimbang di beragam industri; Badge Sage `#D6E3C0` / `#1F2E14`).
- **FR-RSK-003**: Sistem harus mengidentifikasi dan memvisualisasikan faktor-faktor audit risiko:
  - Jumlah emiten aktif dalam portofolio (*Number of Stocks*).
  - Bobot emiten terbesar (*Max Single Stock Weight* %).
  - Bobot sektor terbesar (*Max Sector Weight* %).
  - Indeks Konsentrasi Pasar (Herfindahl-Hirschman Index / HHI).
- **FR-RSK-004**: Sistem harus menyajikan kartu peringatan risiko (*Risk Flags*) jika terdeteksi kondisi ekstrim (misal: "80% aset Anda berada di sektor Perbankan").
- **FR-RSK-005**: Sistem harus menyediakan endpoint dan komponen analisis naratif AI (`POST /api/ai/portfolio-analysis`) untuk menguraikan kondisi portofolio.
- **FR-RSK-006**: Jika portofolio pengguna masih kosong, sistem harus menampilkan panduan edukasi prinsip diversifikasi dasar.

---

## Business Rules & Scoring Formulas

### 1. Model Perhitungan Skor Kesehatan (Skala 0–100)
Skor dihitung dari agregasi 3 pilar bobot:
$$\text{Health Score} = S_{\text{count}} + S_{\text{stock\_weight}} + S_{\text{sector\_weight}}$$

1. **Pilar 1: Jumlah Saham ($S_{\text{count}}$, Bobot Maks: 30 Poin)**
   - 1 saham: 5 poin.
   - 2 saham: 12 poin.
   - 3–4 saham: 20 poin.
   - 5–8 saham: 30 poin (Ideal untuk investor ritel).
   - $> 15$ saham: 22 poin (Penalti akibat over-diversifikasi yang sulit dipantau).

2. **Pilar 2: Konsentrasi Saham Tunggal ($S_{\text{stock\_weight}}$, Bobot Maks: 35 Poin)**
   - Bobot saham terbesar $\le 20\%$: 35 poin.
   - Bobot $21\% - 35\%$: 25 poin.
   - Bobot $36\% - 50\%$: 15 poin.
   - Bobot $> 50\%$: 5 poin.

3. **Pilar 3: Konsentrasi Sektor ($S_{\text{sector\_weight}}$, Bobot Maks: 35 Poin)**
   - Tersebar di $\ge 4$ sektor berbeda (sektor terbesar $\le 35\%$): 35 poin.
   - Tersebar di 3 sektor (sektor terbesar $\le 50\%$): 25 poin.
   - Tersebar di 2 sektor (sektor terbesar $\le 70\%$): 15 poin.
   - 100% pada 1 sektor tunggal: 5 poin.

- **BR-RSK-001**: Skor ini merupakan **indikator edukatif objektif**, bukan kepastian profitabilitas atau jaminan keamanan modal.
- **BR-RSK-002**: AI dilarang keras memberikan instruksi jual/beli (contoh terlarang: *"Segera jual BBCA sebanyak 5 lot"*). AI hanya diperbolehkan memberikan wawasan edukatif (contoh diperbolehkan: *"Portofolio Anda didominasi oleh BBCA (80%), yang berarti kinerja portofolio sangat bergantung pada performa emiten ini. Pertimbangkan untuk mempelajari sektor lain sebagai sarana penyebaran risiko"*).

---

## Workflow
```text
User Access /investment-health
           │
           ▼
GET /api/portfolio/health
           │
           ▼
Backend RiskService:
 ├── Ambil Saldo Holdings & Sektor dari PortfolioService
 ├── Hitung Bobot Masing-Masing Saham & Sektor
 ├── Eksekusi Formula Algoritma Skor (Count + Stock Weight + Sector Weight)
 ├── Deteksi Peringatan Risiko (Risk Flags)
 └── Format Respon JSON
           │
           ▼
Render UI Halaman Health:
 ├── Circular Gauge Meter (0-100) & Status Badge
 ├── Breakdown 3 Pilar Skor (Jumlah Saham, Konsentrasi Saham, Sektor)
 ├── Risk Warning Alert Banners
 └── AI Risk Assistant Narrative Summary
```

---

## Database Design
Modul ini memanfaatkan kalkulasi runtime dari tabel `portfolio_transactions` dan `stocks`. Tidak ada tabel baru yang diperlukan, menjaga performa tetap efisien.

---

## Backend Design
- **Services**:
  - `RiskService.js`:
    - `calculatePortfolioHealth(userId)`
    - `evaluateRiskFactors(holdings)`
  - `AIService.js`: `explainPortfolioHealth(healthReport)`.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/portfolio/health` | Evaluasi skor kesehatan & faktor risiko | Bearer JWT | None | `200 OK` |
| `POST` | `/api/ai/portfolio-analysis` | Analisis naratif AI risiko portofolio | Bearer JWT | None | `200 OK` |

### Sample JSON Response (`GET /api/portfolio/health`)
```json
{
  "success": true,
  "message": "Skor kesehatan portofolio berhasil dievaluasi",
  "data": {
    "health_score": 45,
    "status": "Moderate Risk",
    "status_description": "Portofolio memiliki diversifikasi terbatas dan rentan terhadap fluktuasi satu sektor industri.",
    "metrics": {
      "total_stocks_count": 3,
      "max_single_stock": { "symbol": "BBCA", "weight_percent": 80.0 },
      "max_sector": { "sector": "Financials", "weight_percent": 95.0 },
      "hhi_index": 0.665
    },
    "score_breakdown": {
      "stock_count_score": 20,
      "single_stock_concentration_score": 5,
      "sector_concentration_score": 20
    },
    "risk_flags": [
      "Konsentrasi saham tunggal sangat tinggi: BBCA mendominasi 80% dari total nilai portofolio.",
      "Eksposur sektor didominasi oleh Financials (95%)."
    ]
  }
}
```

---

## Frontend Design
- **Pages**: `InvestmentHealthPage.jsx` (`/investment-health`).
- **Components**:
  - `HealthScoreGauge.jsx`: Meteran radial interaktif penunjuk skor 0–100 dengan transisi warna halus (Merah -> Kuning -> Hijau).
  - `RiskFactorsGrid.jsx`: 3 kartu pilar faktor penentu skor.
  - `RiskFlagsCard.jsx`: Banner peringatan risiko dengan ikon warning.
  - `AiPortfolioCoachCard.jsx`: Panel asisten AI berwadah aksen hijau sage lembut (`#D6E3C0` / `#1F2E14`) yang menjelaskan arti skor tersebut dalam konteks edukasi investasi.

---

## Testing Scenarios (PRD Section 36)
### Unit Test
- **Skenario A (1 Saham 100%)**: Output harus High Risk ($Score \le 30$).
- **Skenario B (3 Saham: 50% Banking, 30% Consumer, 20% Infra)**: Output harus Moderate Risk ($31 \le Score \le 60$).
- **Skenario C (5 Saham Seimbang di 5 Sektor Berbeda, masing-masing 20%)**: Output harus Well Diversified ($Score \ge 81$).

---

## AI Agent Instructions
- **AI Agent**: Tegakkan batasan *No Financial Advice* secara mutlak. Jangan pernah menyebutkan instruksi transaksi langsung ("Beli saham sektor energi", "Kurangi BBCA"). Gunakan frasa reflektif: *"Investor umumnya mempertimbangkan penyebaran aset ke sektor defensif untuk meredam volatilitas..."*
