# Troubleshooting & Solusi Masalah Umum: AI-Powered Fundamental Investment Analyzer

Dokumen ini mencatat masalah umum yang sering dihadapi saat development lokal beserta langkah-langkah penyelesaiannya secara cepat.

---

## 1. Database Connection Refused (`ECONNREFUSED` / P1001)

### Gejala
Backend gagal start dengan pesan error:
`PrismaClientInitializationError: Can't reach database server at localhost:5432`

### Penyebab & Solusi
1. **Service PostgreSQL belum aktif**:
   - Jika menggunakan Laragon: Klik tombol "Start All" atau pastikan centang PostgreSQL aktif.
   - Jika menggunakan Windows Services: Buka `services.msc`, cari `postgresql-x64-17`, dan klik "Start".
   - Jika menggunakan Docker: Jalankan `docker compose up -d postgres`.
2. **Kredensial `.env` tidak cocok**:
   - Periksa `backend/.env`, pastikan username dan password sesuai dengan konfigurasi PostgreSQL Anda.
   - Uji koneksi manual menggunakan DBeaver atau pgAdmin.
3. **Konflik Host Docker vs Lokal**:
   - Jika backend berjalan di dalam container Docker, gunakan `DB_HOST=postgres`, bukan `localhost`.

---

## 2. Prisma Client Out of Sync / Binary Engine Error

### Gejala
Error: `Prisma Client has not been initialized yet` atau `The table public.stocks does not exist in the current database`.

### Solusi
Jalankan perintah regenerate dan migrasi ulang:
```sh
cd backend
npx prisma generate
npx prisma migrate dev
```

---

## 3. CORS Policy Blocked

### Gejala
Browser console menampilkan error:
`Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`.

### Solusi
Pastikan variabel `FRONTEND_URL` pada file `backend/.env` mengarah ke URL aktif Vite frontend:
```env
FRONTEND_URL=http://localhost:5173
```
Pastikan middleware `cors({ origin: process.env.FRONTEND_URL, credentials: true })` terpasang sebelum rute endpoint di `app.js`.

---

## 4. Google Gemini API Error (Quota Limit / HTTP 429)

### Gejala
AI Assistant mengembalikan respon: `AI service temporarily unavailable` atau status `429 Too Many Requests`.

### Solusi
1. Periksa apakah `GEMINI_API_KEY` pada `backend/.env` sudah terisi dengan benar.
2. Cek kuota API di [Google AI Studio Console](https://aistudio.google.com/). Jika menggunakan free tier (15 RPM / 1500 RPD), hindari pengujian loop otomatis berfrekuensi tinggi.
3. Sistem secara otomatis menerapkan *graceful degradation*: Data tabel fundamental dan grafik candlestick tetap tampil normal meskipun respon AI gagal.

---

## 5. Port Conflict (Port 5000 atau 5173 Already in Use)

### Gejala
Error: `Error: listen EADDRINUSE: address already in use :::5000`.

### Solusi (Windows PowerShell):
Cari PID proses yang menduduki port 5000 dan hentikan proses tersebut:
```powershell
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force
```
Atau ubah `PORT=5001` di file `backend/.env` dan perbarui konfigurasi baseURL Axios di frontend.

---

## 6. PowerShell Script Execution Policy Error

### Gejala
Error saat menjalankan `npm run dev` atau perintah global:
`File ...\npm.ps1 cannot be loaded because running scripts is disabled on this system`.

### Solusi
Buka PowerShell sebagai Administrator dan jalankan:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Ketik `Y` lalu tekan Enter.

---

## 7. Vite Manifest Not Found / Blank White Screen pada Build Production

### Gejala
Tampilan halaman blank putih setelah build di production.

### Solusi
Pastikan build asset frontend dijalankan dengan benar sebelum Nginx di-reload:
```sh
cd frontend
npm run build
```
Pastikan file `dist/index.html` dan folder `dist/assets/` ter-generate secara utuh dan Nginx mengarah ke direktori `dist` tersebut.
