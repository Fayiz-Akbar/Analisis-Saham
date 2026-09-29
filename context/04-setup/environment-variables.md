# Katalog Variabel Environment: AI-Powered Fundamental Investment Analyzer

Dokumen ini mendokumentasikan seluruh variabel lingkungan (*environment variables*) yang digunakan pada sistem backend. File `.env` wajib diletakkan di direktori `backend/.env`. Jangan pernah menyimpan kredensial produksi atau rahasia aktual ke dalam version control (Git).

---

## 1. Application & Server Config (`APP`)

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `NODE_ENV` | String | `development` | Ya | Tidak | Lingkungan runtime aplikasi (`development`, `test`, `production`). |
| `PORT` | Integer | `5000` | Ya | Tidak | Port HTTP tempat server backend Express mendengarkan request. |
| `FRONTEND_URL` | String | `http://localhost:5173` | Ya | Tidak | URL domain frontend untuk konfigurasi CORS whitelist. |
| `APP_LOG_LEVEL`| String | `debug` | Tidak | Tidak | Tingkat logging Winston (`debug`, `info`, `warn`, `error`). |

---

## 2. Database Connection (`DATABASE`)

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `DATABASE_URL` | String | - | **Ya** | **Ya** | Connection string PostgreSQL untuk Prisma ORM. Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public` |
| `DB_HOST` | String | `localhost` | Tidak | Tidak | Host database (gunakan `postgres` jika di dalam Docker). |
| `DB_PORT` | Integer | `5432` | Tidak | Tidak | Port host database PostgreSQL. |
| `DB_NAME` | String | `analisis_saham_db` | Tidak | Tidak | Nama database aplikasi. |
| `DB_USER` | String | `postgres` | Tidak | Tidak | Username pengguna PostgreSQL. |
| `DB_PASSWORD` | String | - | Tidak | **Ya** | Password pengguna PostgreSQL. |

---

## 3. Security & Authentication (`AUTH`)

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `JWT_SECRET` | String | - | **Ya** | **Ya** | Kunci rahasia HMAC-SHA256 untuk penandatanganan token JWT (minimal 32 karakter). |
| `JWT_EXPIRES_IN`| String | `7d` | Tidak | Tidak | Durasi masa berlaku token JWT (contoh: `7d`, `24h`). |
| `BCRYPT_SALT_ROUNDS`| Integer | `10` | Tidak | Tidak | Faktor kompleksitas hashing kata sandi. |

---

## 4. Artificial Intelligence (`GEMINI`)

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `GEMINI_API_KEY` | String | - | **Ya** | **Ya** | Kunci API Google AI Studio / Gemini API untuk fitur AI Assistant & AI Tutor. |
| `GEMINI_MODEL_FAST` | String | `gemini-1.5-flash` | Tidak | Tidak | Nama model Gemini untuk query cepat dan tutor edukasi. |
| `GEMINI_MODEL_REASONING`| String | `gemini-1.5-pro` | Tidak | Tidak | Nama model Gemini untuk analisis mendalam dan komparasi multi-saham. |

---

## 5. Market Data & News Providers (`EXTERNAL_API`)

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `MARKET_DATA_PROVIDER`| String | `sectors_app` | Ya | Tidak | Nama adapter provider aktif (`sectors_app`, `twelve_data`, `finnhub`). |
| `MARKET_DATA_API_KEY` | String | - | **Ya** | **Ya** | API Key provider data pasar saham IDX. |
| `NEWS_API_KEY` | String | - | Tidak | **Ya** | API Key provider berita pasar modal (opsional jika menggunakan public RSS feed). |

---

## 6. Caching TTL Policy (`CACHE_TTL`)

Durasi masa simpan data cache lokal pada tabel `api_cache` dan `news_cache` sebelum expired (dalam detik):

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `CACHE_TTL_QUOTE` | Integer | `180` | Tidak | Tidak | TTL data quote harga saham (default: 3 menit). |
| `CACHE_TTL_HISTORICAL`| Integer | `86400` | Tidak | Tidak | TTL data grafik historis candlestick harian (default: 24 jam). |
| `CACHE_TTL_FUNDAMENTALS`| Integer | `604800` | Tidak | Tidak | TTL laporan keuangan & rasio fundamental (default: 7 hari). |
| `CACHE_TTL_NEWS` | Integer | `1800` | Tidak | Tidak | TTL berita emiten dan pasar modal (default: 30 menit). |

---

## 7. Docker Local Compose (Jika Digunakan)

| Variable | Type | Default | Required | Secret | Description |
|----------|------|---------|----------|--------|-------------|
| `COMPOSE_PROJECT_NAME`| String | `analisis_saham` | Tidak | Tidak | Namespace nama container Docker Compose. |
| `APP_PORT` | Integer | `5000` | Tidak | Tidak | Port backend yang diekspos ke host mesin. |
| `DB_PORT` | Integer | `5432` | Tidak | Tidak | Port PostgreSQL yang diekspos ke host mesin. |
