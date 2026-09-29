# Local Development Setup: AI-Powered Fundamental Investment Analyzer

Dokumen ini adalah panduan utama untuk menjalankan aplikasi secara lokal dari nol di lingkungan development.

---

## 1. Prerequisites

Sebelum memulai, pastikan perangkat lokal Anda telah terpasang perangkat lunak berikut:
- **Node.js**: v20.x atau v22.x LTS ([Download Node.js](https://nodejs.org/))
- **npm**: v10.x+ (bawaan Node.js)
- **PostgreSQL**: v16 atau v17 (melalui Laragon, PostgreSQL Installer lokal, atau Docker)
- **Git**: v2.x+
- **Docker & Docker Compose** (Opsional, jika ingin menjalankan PostgreSQL via container)

---

## 2. Clone Repository

Buka terminal (PowerShell / Git Bash) dan arahkan ke direktori kerja (misal: `c:\laragon\www\`):
```sh
cd c:\laragon\www
git clone https://github.com/username/Analisis-Saham.git
cd Analisis-Saham
```

---

## 3. Install Dependencies

Install seluruh dependensi untuk backend dan frontend:

### 3.1 Install Backend Dependencies
```sh
cd backend
npm install
```

### 3.2 Install Frontend Dependencies
```sh
cd ../frontend
npm install
```

Kembali ke root direktori:
```sh
cd ..
```

---

## 4. Environment Setup

Salin file contoh konfigurasi `.env.example` menjadi `.env` di direktori `backend/`:
```sh
cp backend/.env.example backend/.env
```

Buka file `backend/.env` dan sesuaikan nilainya:
```env
# Server Config
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Connection (PostgreSQL 17)
# Format: postgresql://<user>:<password>@<host>:<port>/<database_name>?schema=public
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/analisis_saham_db?schema=public

# Security / JWT
JWT_SECRET=super_secret_jwt_key_development_32_characters_minimum
JWT_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=your_google_gemini_api_key_here

# External Market Data & News Providers
MARKET_DATA_PROVIDER=sectors_app
MARKET_DATA_API_KEY=your_market_data_api_key_here
NEWS_API_KEY=your_news_api_key_here

# Cache TTL Configuration (dalam detik)
CACHE_TTL_QUOTE=180
CACHE_TTL_HISTORICAL=86400
CACHE_TTL_FUNDAMENTALS=604800
CACHE_TTL_NEWS=1800
```

---

## 5. Database Setup (PostgreSQL & Prisma)

Pastikan service PostgreSQL lokal sedang berjalan (di Laragon klik "Start All" atau jalankan service PostgreSQL di Services Windows).

### 5.1 Buat Database
Buka tool database (HeidiSQL / pgAdmin / DBeaver / psql) dan buat database baru bernama:
```sql
CREATE DATABASE analisis_saham_db;
```

### 5.2 Jalankan Prisma Migration
Dari direktori `backend/`, jalankan migrasi untuk membuat seluruh tabel:
```sh
cd backend
npx prisma migrate dev --name init_schema
```

### 5.3 Jalankan Data Seeder
Isi data awal emiten IDX, kurikulum edukasi 6 level, dan soal kuis:
```sh
npx prisma db seed
cd ..
```

---

## 6. Run Application

Jalankan backend API dan frontend React secara bersamaan di dua terminal terpisah:

### Terminal 1: Backend Express Server
```sh
cd backend
npm run dev
```
*Backend akan aktif di: `http://localhost:5000`*  
*Health check API: `http://localhost:5000/api/health`*

### Terminal 2: Frontend React (Vite)
```sh
cd frontend
npm run dev
```
*Frontend akan aktif di: `http://localhost:5173`*

---

## 7. Verification Checklist

Setelah menjalankan aplikasi, lakukan verifikasi berikut di browser:
1. Buka `http://localhost:5173` -> Halaman login/dashboard muncul tanpa error console.
2. Buka `http://localhost:5000/api/health` -> Mengembalikan respon `{ "status": "ok", "database": "connected" }`.
3. Buka halaman `/register` -> Coba daftarkan akun baru -> Pengguna otomatis login dan dialihkan ke `/dashboard`.
4. Cek pencarian saham di dashboard (ketik "BBCA") -> Data emiten dan quote harga muncul.
5. Buka menu `/learn` -> Seluruh topik level 1–6 muncul lengkap.
