# Docker Setup: AI-Powered Fundamental Investment Analyzer

## 1. Status

Docker digunakan sebagai opsi lingkungan development lokal untuk menjalankan service database PostgreSQL 17 dan backend API secara terisolasi tanpa perlu menginstal dependensi runtime di mesin host.

---

## 2. Configuration Files

- `compose.yaml`: File konfigurasi Docker Compose v2 untuk lingkungan development lokal.
- `backend/Dockerfile`: Dockerfile multi-stage untuk service API Express.js.
- `.dockerignore`: Daftar file yang diabaikan saat build image Docker.

---

## 3. Prerequisites

- **Docker Desktop** (Windows / macOS) atau **Docker Engine + Compose v2** (Linux).
- Pastikan Docker Daemon dalam status aktif (*running*).

---

## 4. Services Table

| Service | Purpose | Container Port | Host Port | Runtime Command |
|---------|---------|----------------|-----------|-----------------|
| `postgres` | Database PostgreSQL 17 | 5432 | 5432 | Tidak (Daemon) |
| `backend` | API Gateway Express.js & Services | 5000 | 5000 | Ya (`npm run dev`) |

---

## 5. Environment Rules

- Gunakan nama service Compose untuk komunikasi antar-container di dalam network yang sama:
  ```env
  DATABASE_URL=postgresql://postgres:postgres@postgres:5432/analisis_saham_db?schema=public
  ```
- Dari mesin host (browser atau Prisma Studio lokal), akses melalui `localhost`:
  - Backend API: `http://localhost:5000`
  - Database: `localhost:5432`
- File konfigurasi environment dimuat otomatis dari file `backend/.env`.

---

## 6. Build Image

Membangun image backend secara lokal:
```sh
docker compose build
```

---

## 7. Run Services

Menjalankan seluruh service pendukung di latar belakang (*detached mode*):
```sh
docker compose up -d
```
Jika hanya ingin menjalankan service PostgreSQL saja (sedangkan backend dijalankan langsung via Node.js lokal):
```sh
docker compose up -d postgres
```

---

## 8. Status & Container Health

Memeriksa status container yang sedang berjalan:
```sh
docker compose ps
```

---

## 9. Application Commands

Menjalankan perintah Prisma dan migrasi di dalam container backend:

### 9.1 Jalankan Migrasi Prisma
```sh
docker compose exec backend npx prisma migrate dev
```

### 9.2 Jalankan Seeder
```sh
docker compose exec backend npx prisma db seed
```

### 9.3 Buka Bash Shell di Backend Container
```sh
docker compose exec backend sh
```

---

## 10. Stop Services

Menghentikan seluruh container tanpa menghapus data volume database:
```sh
docker compose down
```

---

## 11. View Logs

Melihat log realtime dari seluruh service atau service tertentu:
```sh
docker compose logs -f
docker compose logs -f backend
docker compose logs -f postgres
```

---

## 12. Reset Local Data

*Perhatian: Perintah ini akan menghapus container berserta volume data lokal PostgreSQL secara permanen.*
```sh
docker compose down -v
docker compose up -d --build
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma db seed
```
