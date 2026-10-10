# MODULE: AI ASSISTANT & CONTEXT-GROUNDED CORE

## Overview
Modul AI Assistant and Context-Grounded Core merupakan otak kecerdasan buatan (*AI intelligence engine*) aplikasi. Modul ini mengorkestrasi interaksi dengan **Google Gemini API** menggunakan pendekatan **Context-Grounded Generation**, di mana AI tidak pernah diizinkan mencari atau mengarang data finansial secara bebas. Backend bertindak sebagai *Context Builder* yang menyatukan data quote harga pasar, laporan keuangan fundamental, dan berita terkini ke dalam payload terstruktur sebelum diteruskan ke model AI. Modul ini melayani dua peran persona AI: **AI Financial Assistant** (asisten analisis pasar dan emiten) dan **AI Investment Tutor** (pembimbing literasi edukasi).

---

## Objectives
1. Menerapkan arsitektur context-grounding ketat untuk mencegah halusinasi data numerik finansial.
2. Mengorkestrasi pipeline: *User Question -> Context Extraction -> Data Fetching -> Context Injection -> Gemini LLM -> JSON Schema Validation -> Client Output*.
3. Menyediakan asisten riset untuk: Analisis Saham Tunggal, Komparasi Saham, Sentimen Makro, Evaluasi Portofolio, dan Simulasi DCA.
4. Menyediakan tutor edukasi untuk literasi konsep dan terminologi pasar modal bagi investor pemula.
5. Menjadi fondasi empiris penelitian skripsi terkait evaluasi *Factual Consistency*, *Hallucination Rate*, dan *Completeness*.

---

## Stakeholders
### Investor Pemula
Memperoleh jawaban atas istilah-istilah rumit tanpa merasa diintimidasi oleh jargon finansial.
### Investor Berpengalaman
Memperoleh sintesis ringkas sorotan kinerja emiten dan sentimen berita secara cepat tanpa membuang waktu membaca laporan puluhan halaman.
### Peneliti / Akademisi (Penulis Skripsi)
Mengukur keandalan dan konsistensi faktual arsitektur *context-grounded LLM* pada domain finansial berbasis metrik pengujian formal.

---

## Functional Requirements
- **FR-AI-001**: Sistem harus menyediakan endpoint terpusat untuk orkestrasi AI:
  - `POST /api/ai/stock-analysis`: Analisis fundamental mendalam saham individual.
  - `POST /api/ai/stock-comparison`: Sintesis perbandingan multi-saham (2–4 emiten).
  - `POST /api/ai/market-analysis`: Sintesis kondisi pasar makro dan IHSG harian.
  - `POST /api/ai/portfolio-analysis`: Evaluasi naratif risiko diversifikasi portofolio.
  - `POST /api/ai/dca-analysis`: Penjelasan hasil simulasi DCA historis.
  - `POST /api/ai/tutor`: Tutor edukasi konsep pasar modal.
- **FR-AI-002**: Sistem harus menyusun payload konteks data faktual (`Context Builder`) dari database dan cache lokal sebelum mengirim request ke Google Gemini API.
- **FR-AI-003**: Sistem harus menyuntikkan instruksi sistem (*System Instructions*) anti-halusinasi pada setiap panggilan API Gemini.
- **FR-AI-004**: Model AI harus mengembalikan respon dalam format JSON terstruktur dengan kolom: `summary`, `key_insights`, `metrics_used`, dan `disclaimer`.
- **FR-AI-005**: Jika informasi yang ditanyakan pengguna tidak tersedia pada konteks data yang disuntikkan, AI wajib menjawab: *"Data fakta tidak tersedia pada data yang disediakan sistem."* (sesuai KF-14).
- **FR-AI-006**: Seluruh respon AI wajib menyertakan teks *disclaimer* standar: *"Analisis ini dihasilkan oleh AI untuk tujuan edukasi dan bukan merupakan rekomendasi atau ajakan transaksi beli/jual saham."*
- **FR-AI-007**: AI Financial Assistant harus mendukung penyesuaian profil analisis pengguna (`profile`: `"beginner"` atau `"experienced"`):
  - Mode **Pemula (`beginner`)**: Penjelasan disajikan dengan analogi sederhana, bahasa ramah, dan mengedukasi arti indikator keuangan tanpa jargon berlebihan.
  - Mode **Berpengalaman (`experienced`)**: Penjelasan disajikan secara analitis, tajam, padat, berfokus pada metrik kuantitatif, tren komparatif, dan implikasi fundamental emiten.

---

## Business Rules & AI Guardrails (PRD Section 14 & 17)

### Aturan yang Diperbolehkan (Allowed)
- Menjelaskan data fundamental dan rasio keuangan yang tercantum di konteks.
- Membandingkan metrik antara dua atau lebih saham secara objektif.
- Menerangkan faktor risiko konsentrasi portofolio.
- Merangkum pokok berita dan sentimen pasar modal.
- Menjelaskan konsep dan terminologi edukasi investasi.

### Aturan yang Dilarang Keras (Strictly Not Allowed)
- ❌ Dilarang memberikan rekomendasi beli (*Buy*) atau jual (*Sell*) otomatis.
- ❌ Dilarang mengarang angka finansial (PE, laba, harga, dsb.) yang tidak ada di dalam payload konteks.
- ❌ Dilarang mengarang berita atau aksi korporasi fiktif.
- ❌ Dilarang menjamin keuntungan atau memprediksi harga masa depan sebagai fakta pasti.
- ❌ Dilarang mengklaim diri sebagai penasihat keuangan berlisensi (*Certified Financial Planner*).

---

## Architecture Pipeline & Workflow
```text
┌─────────────────────────┐
│ User Question / Request │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Express Backend     │
│   (Route Controller)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Context Builder     │
│  - Query Cache & DB     │
│  - Assemble Financials  │
│  - Format JSON Payload  │
└────────────┬────────────┘
             │ Payload Konteks Terstruktur:
             │ { "symbol": "BBCA", "price": 8850, "fundamentals": { ... }, "news": [ ... ] }
             ▼
┌─────────────────────────┐
│ System Instruction Inject│
│ - "You are AI Assistant"│
│ - "Use ONLY the context"│
│ - "Strictly NO hallucination" │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    Google Gemini API    │
│  (1.5 Flash / 1.5 Pro)  │
└────────────┬────────────┘
             │ Structured JSON Response
             ▼
┌─────────────────────────┐
│ Output Schema Validator │
│ - Verify Disclaimer     │
│ - Verify Fact Alignment │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Client (React Frontend) │
└─────────────────────────┘
```

---

## Backend Design
- **Config**: `src/config/gemini.js` menginisialisasi Google Generative AI SDK dengan `GEMINI_API_KEY`.
- **Services**:
  - `ContextBuilder.js`:
    - `buildStockContext(symbol)`
    - `buildComparisonContext(symbols)`
    - `buildMarketContext()`
    - `buildPortfolioContext(userId)`
    - `buildDcaContext(simulationResult)`
    - `buildTutorContext(topicSlug)`
  - `AIService.js`: Mengirim prompt terstruktur ke Gemini dan mem-parsing output JSON.

### Contoh System Instruction Standar:
```text
Anda adalah AI Financial Analysis Assistant pada platform Analisis-Saham.
Tugas Anda adalah memberikan sintesis dan penjelasan analisis fundamental yang objektif, faktual, dan mudah dipahami.

PEDOMAN KETAT:
1. Anda HANYA diperbolehkan menggunakan data, angka, dan fakta yang tersedia di dalam payload KONTEKS di bawah.
2. DILARANG KERAS mengarang angka, rasio keuangan, atau berita yang tidak tercantum di dalam konteks.
3. Jika informasi yang ditanyakan pengguna tidak ada di dalam data konteks, jawab dengan jujur: "Informasi tersebut tidak tersedia pada data yang digunakan sistem."
4. DILARANG memberikan rekomendasi langsung "Beli", "Jual", atau "Cut Loss". Gunakan sudut pandang analisis netral.
5. Selalu sertakan penafian (disclaimer) bahwa analisis ini untuk tujuan edukasi.
```

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `POST` | `/api/ai/stock-analysis` | Analisis fundamental emiten | Bearer JWT | `{ symbol: "BBCA", profile?: "beginner" \| "experienced", question?: string }` | `200 OK` |
| `POST` | `/api/ai/stock-comparison` | Analisis komparasi multi-saham | Bearer JWT | `{ symbols: ["BBCA", "BBRI"] }` | `200 OK` |
| `POST` | `/api/ai/market-analysis` | Analisis sentimen pasar hari ini | Bearer JWT | `{ query?: string }` | `200 OK` |
| `POST` | `/api/ai/portfolio-analysis`| Analisis risiko portofolio user | Bearer JWT | None | `200 OK` |
| `POST` | `/api/ai/dca-analysis` | Penjelasan hasil simulasi DCA | Bearer JWT | `{ simulation_id_or_data }` | `200 OK` |
| `POST` | `/api/ai/tutor` | Tutor edukasi interaktif | Bearer JWT | `{ question: string, topic_slug?: string }` | `200 OK` |

---

## Research Evaluation Protocol (Skripsi)

### 1. Dataset Evaluasi Pertanyaan
Disusun dataset berisi 50 pertanyaan pengujian terstandarisasi yang mencakup:
- **Kategori Fundamental**: Pertanyaan valuasi, profitabilitas, leverage.
- **Kategori Komparasi**: Pertanyaan perbandingan 2–4 emiten.
- **Kategori Sentimen Berita**: Pertanyaan korelasi aksi korporasi terhadap fundamental.
- **Kategori Edukasi**: Pertanyaan arti rasio dan analogi pemula.

### 2. Metrik Pengukuran Ilmiah
- **Factual Consistency Score**: Persentase klaim angka yang cocok 1:1 dengan data context (Target: $\ge 95\%$).
- **Hallucination Rate**: Persentase klaim angka yang tidak ditemukan di context (Target: $< 2\%$).
- **Relevance Score**: Kesesuaian jawaban dengan pertanyaan pengguna (Skala Likert 1–5).
- **Latency**: Waktu pemrosesan rata-rata Gemini API (Target: $< 3.5$ detik).

---

## AI Agent Instructions
- **Backend Agent**: Simpan `GEMINI_API_KEY` hanya di `.env` server. Gunakan `responseMimeType: "application/json"` pada konfigurasi pemanggilan Gemini SDK untuk memastikan model selalu mengembalikan JSON terstruktur.
- **Frontend Agent**: Tangani status loading dengan indikator *"AI sedang menyintesis data fundamental..."*, bungkus output respons dalam wadah terstruktur dan mudah dibaca, serta berikan opsi retry jika kuota API mengalami limit sementara.
