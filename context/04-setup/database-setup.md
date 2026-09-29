# Database Setup: AI-Powered Fundamental Investment Analyzer

Dokumen khusus konfigurasi dan inisialisasi basis data PostgreSQL untuk lingkungan lokal development.

---

## 1. PostgreSQL Version

**PostgreSQL 17** (kompatibel dengan versi 16+).

---

## 2. Koneksi Database

### 2.1 Koneksi Lokal (Non-Docker / Laragon / Native)
Gunakan konfigurasi berikut pada `backend/.env`:
```text
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=analisis_saham_db

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/analisis_saham_db?schema=public
```

### 2.2 Koneksi Docker Container
Jika menjalankan database via `compose.yaml`, gunakan nama service database (`postgres` / `db`) sebagai host untuk komunikasi antar-container:
```text
DB_HOST=postgres
DB_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/analisis_saham_db?schema=public
```
*Port `5432` pada host tetap dapat digunakan oleh tools GUI lokal seperti DBeaver atau pgAdmin.*

---

## 3. Pembuatan Database

Sebelum menjalankan migrasi, buat database baru jika belum ada:

### Menggunakan SQL Shell (`psql`):
```sql
CREATE DATABASE analisis_saham_db;
```

### Menggunakan CLI Command:
```sh
createdb -U postgres -h localhost analisis_saham_db
```

---

## 4. Eksekusi Migrasi Skema (Prisma)

Arahkan terminal ke direktori `backend/`:
```sh
cd backend
```

### 4.1 Generate Prisma Client
Membangun type-safe Prisma client berdasarkan file `prisma/schema.prisma`:
```sh
npx prisma generate
```

### 4.2 Jalankan Migrasi Development
Menerapkan seluruh definisi skema ke database dan mencatat riwayat migrasi:
```sh
npx prisma migrate dev --name init_schema
```
Perintah di atas akan membuat tabel:
- `users`
- `stocks`
- `watchlists`
- `portfolio_transactions`
- `api_cache`
- `news_cache`
- `learning_contents`
- `learning_progress`
- `quizzes`
- `quiz_attempts`

---

## 5. Eksekusi Database Seeder

Seeder otomatis mengisi data awal yang esensial agar aplikasi siap digunakan:
1. **Daftar Saham IDX**: Saham likuid (LQ45/IDX30) seperti BBCA, BBRI, BMRI, BBNI, TLKM, ASII, UNVR, ICBP, ADRO, GOTO, AMMN.
2. **Kurikulum Belajar 6 Level**: 15+ artikel edukasi lengkap (Level 1 Intro hingga Level 6 Strategi).
3. **Bank Soal Kuis**: Pertanyaan evaluasi pemahaman pilihan ganda per topik materi.

Jalankan perintah seeder:
```sh
npx prisma db seed
```

---

## 6. Inspeksi Data (Prisma Studio)

Untuk melihat, mengedit, atau memvalidasi isi tabel database melalui antarmuka web interaktif lokal:
```sh
npx prisma studio
```
*Prisma Studio akan terbuka otomatis di browser pada: `http://localhost:5555`*

---

## 7. Reset Database Lokal

Jika Anda ingin mengosongkan seluruh data lokal dan mengulang migrasi serta seeder dari awal:
```sh
npx prisma migrate reset
```
*(Perhatian: Perintah ini akan menghapus seluruh data pada tabel dan menjalankan seed ulang).*
