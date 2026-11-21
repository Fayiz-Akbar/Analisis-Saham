# Dokumentasi Akun Uji Coba (Database Seed Accounts)

Dokumen ini memuat daftar akun resmi yang tersimpan di dalam basis data PostgreSQL (**Investpedia / Analisis Saham**) melalui skrip seeding [`backend/prisma/seed.js`](file:///c:/laragon/www/Analisis-Saham/backend/prisma/seed.js).

Seluruh akun di bawah ini dapat digunakan untuk masuk melalui **Halaman Login Terpadu** (`/login` atau `/admin`).

---

## 1. Daftar Akun Pengujian

| No | Peran (Role) | Nama Pengguna | Email | Password | Profil Investor (`investorProfile`) | Hak Akses & Tujuan Redirect |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **`ADMIN`** | Administrator Kurikulum InvestAI | `admin@email.com` | `admin123` | `EXPERIENCED` | Akses penuh ke **Portal Administrator** (`/admin`: Dashboard CMS, Materi Pembelajaran, Struktur Kurikulum, Bank Soal Kuis, Media, Pengaturan) sekaligus dapat beralih ke **Sistem Utama Investor** (`/`). |
| **2** | **`INVESTOR`** | Fayiz Akbar (Pemula) | `fayiz.pemula@example.com` | `Password123!` | `BEGINNER` | Akses ke **Sistem Utama Investor** (`/`, `/learning`, `/ai`, `/watchlist`, `/screener`) dengan preferensi penjelasan fundamental & AI Tutor tingkat **Pemula**. Memiliki watchlist awal saham `BBCA`. |
| **3** | **`INVESTOR`** | Fayiz Akbar (Berpengalaman) | `fayiz.expert@example.com` | `Password123!` | `EXPERIENCED` | Akses ke **Sistem Utama Investor** (`/`, `/learning`, `/ai`, `/watchlist`, `/screener`) dengan preferensi analisis rasio keuangan & AI Tutor tingkat **Berpengalaman (Expert)**. |

---

## 2. Alur Autentikasi & Role-Based Access Control (RBAC)

1. **Halaman Login Terpadu (`/login` & `/admin`)**:
   - Menerima login dari seluruh pengguna yang terdaftar di tabel `users` (`role = 'ADMIN'` maupun `role = 'INVESTOR'`).
   - Setelah autentikasi berhasil:
     - Akun dengan role **`ADMIN`** otomatis diarahkan ke **Portal Administrator** (`/admin`).
     - Akun dengan role **`INVESTOR`** otomatis diarahkan ke **Dashboard Utama Investpedia** (`/`).
2. **Keamanan Password & Token**:
   - Seluruh password dienkripsi menggunakan algoritma **bcrypt** (`saltRounds = 10`) pada kolom `password_hash` di tabel `users`.
   - Sesi menggunakan **JSON Web Token (JWT)**:
     - Masa berlaku token `INVESTOR`: `7d` (7 hari, dapat dikonfigurasi melalui `JWT_EXPIRES_IN`).
     - Masa berlaku token `ADMIN`: `8h` (8 jam, dapat dikonfigurasi melalui `JWT_ADMIN_EXPIRES_IN`).

---

## 3. Cara Mengembalikan / Reset Akun Uji Coba ke Database

Apabila data akun di database lokal terhapus atau password diubah saat pengujian, jalankan perintah berikut di terminal pada folder `backend` untuk melakukan *upsert* ulang akun uji coba:

```powershell
cd backend
npx prisma db seed
```
