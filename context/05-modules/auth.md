# MODULE: AUTHENTICATION & USER MANAGEMENT

## Overview
Modul Autentikasi dan Manajemen Pengguna bertanggung jawab mengelola siklus identitas pengguna, pendaftaran akun baru, proses login, penerbitan stateless JSON Web Token (JWT), enkripsi kata sandi menggunakan `bcrypt`, serta otorisasi akses rute terproteksi di sisi backend maupun frontend.

---

## Objectives
1. Menyediakan alur registrasi dan login yang aman, cepat, dan intuitif.
2. Mengamankan password pengguna dengan hashing satu arah `bcrypt` (salt rounds $\ge 10$).
3. Menerbitkan token JWT stateless yang membawa identitas `userId` dan email pengguna.
4. Menjadi gerbang otorisasi (*Authorization Gate*) bagi fitur personal seperti Watchlist, Portfolio, DCA simulation history, dan progres belajar.

---

## Stakeholders
### Investor Pemula
Memerlukan pendaftaran cepat tanpa konfigurasi rumit, penyimpanan sesi yang stabil agar tidak berulang kali login saat sedang membaca materi edukasi.
### Investor Berpengalaman
Membutuhkan keamanan akun yang terpercaya untuk melindungi catatan transaksi portofolio riil dan daftar pantau saham pribadi.
### Administrator Sistem
Memerlukan kemudahan audit keamanan, isolasi data per pengguna, dan manajemen sesi.

---

## Functional Requirements
- **FR-AUTH-001**: Sistem harus menyediakan endpoint registrasi akun baru dengan input: nama lengkap, email, password, dan konfirmasi password.
- **FR-AUTH-002**: Sistem harus memvalidasi keunikan email di database sebelum membuat akun baru.
- **FR-AUTH-003**: Sistem harus meng-hash password menggunakan `bcrypt` sebelum disimpan ke database.
- **FR-AUTH-004**: Sistem harus memverifikasi kecocokan email dan password saat proses login.
- **FR-AUTH-005**: Sistem harus mengembalikan token JWT bertanda tangan digital saat autentikasi berhasil.
- **FR-AUTH-006**: Sistem harus menyediakan endpoint `GET /api/auth/me` untuk memulihkan sesi aktif dan informasi profil pengguna.
- **FR-AUTH-007**: Frontend harus menyimpan token secara aman dan melampirkannya pada header `Authorization: Bearer <token>` untuk setiap request terproteksi.
- **FR-AUTH-008**: Sistem harus mengalihkan pengguna ke halaman login jika token telah kedaluwarsa atau tidak valid.

---

## Business Rules
- **BR-AUTH-001**: Format email harus valid sesuai standar RFC 5322.
- **BR-AUTH-002**: Password minimal terdiri dari 8 karakter, mengandung setidaknya 1 huruf dan 1 angka.
- **BR-AUTH-003**: Email tidak boleh duplikat (case-insensitive).
- **BR-AUTH-004**: Token JWT memiliki masa kedaluwarsa standar 7 hari (`JWT_EXPIRES_IN=7d`).
- **BR-AUTH-005**: User yang belum login tetap dapat mengakses landing page, materi edukasi publik, quote saham umum, dan stock screener.

---

## Workflow
### 1. User Registration
```text
User Input Form (Name, Email, Password, Confirm)
      │
      ▼
Client Validation (Format email & matching password)
      │
      ▼
POST /api/auth/register
      │
      ▼
Backend Validation (Zod Schema)
      │
      ├── Email sudah ada? ──> Return 409 Conflict
      │
      ▼
Bcrypt Hashing (salt = 10)
      │
      ▼
Insert ke Tabel `users` (Prisma)
      │
      ▼
Generate JWT Token
      │
      ▼
Return 201 Created (Token + User Object) ──> Simpan ke LocalStorage & Redirect ke Dashboard
```

### 2. User Login
```text
User Input (Email, Password)
      │
      ▼
POST /api/auth/login
      │
      ▼
Query User by Email di `users`
      │
      ├── User tidak ditemukan? ──> Return 401 Unauthorized ("Email atau password salah")
      │
      ▼
Bcrypt Compare Password
      │
      ├── Tidak cocok? ──────────> Return 401 Unauthorized ("Email atau password salah")
      │
      ▼
Generate JWT Token
      │
      ▼
Return 200 OK (Token + User Info)
```

---

## Database Design

### Tables & Columns (`users`)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relationships
- `users.id` 1-ke-banyak dengan `watchlists.user_id` (CASCADE).
- `users.id` 1-ke-banyak dengan `portfolio_transactions.user_id` (CASCADE).
- `users.id` 1-ke-banyak dengan `learning_progress.user_id` (CASCADE).
- `users.id` 1-ke-banyak dengan `quiz_attempts.user_id` (CASCADE).

### Indexes & Constraints
- `UNIQUE INDEX idx_users_email ON users(email);`

---

## Backend Design
- **Services**: `AuthService.js` (metode: `registerUser()`, `loginUser()`, `getUserProfile()`, `changePassword()`).
- **Middlewares / Policies**:
  - `authMiddleware.js`: Memverifikasi header `Authorization`, mem-parsing token JWT, memverifikasi tanda tangan via `JWT_SECRET`, dan menyuntikkan `req.user = { id, email, name }`.
- **Validation Schema (Zod)**:
  - `registerSchema`: `{ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }`.
  - `loginSchema`: `{ email: z.string().email(), password: z.string().min(1) }`.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `POST` | `/api/auth/register` | Mendaftarkan akun baru | Public | `{ name, email, password }` | `201 Created` |
| `POST` | `/api/auth/login` | Login & terbitkan JWT | Public | `{ email, password }` | `200 OK` |
| `GET` | `/api/auth/me` | Ambil data profil aktif | Bearer JWT | None | `200 OK` |

### Sample JSON Responses

#### Success Response (`POST /api/auth/login`)
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4b9b940-0235-430c-99d9-291586a51d2f",
      "name": "Fayiz Akbar",
      "email": "fayiz@example.com",
      "created_at": "2026-09-05T08:00:00.000Z"
    }
  }
}
```

#### Validation Error Response (`POST /api/auth/register`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password minimal terdiri dari 8 karakter",
    "details": [
      {
        "field": "password",
        "issue": "String must contain at least 8 character(s)"
      }
    ]
  }
}
```

#### Authorization Error Response (`GET /api/auth/me` tanpa token)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Akses ditolak. Token otentikasi tidak disediakan."
  }
}
```

---

## Frontend Design
- **Pages**:
  - `LoginPage.jsx` (`/login`): Form login dengan input email, password, tombol submit, dan link ke register.
  - `RegisterPage.jsx` (`/register`): Form registrasi akun dengan validasi live konfirmasi password.
- **Components**:
  - `ProtectedRoute.jsx`: Wrapper route yang memeriksa `AuthContext`. Jika tidak terautentikasi, otomatis redirect ke `/login`.
  - `AuthCard.jsx`: Container kartu form dengan estetika glassmorphism / dark theme modern.
- **State Management**:
  - `AuthContext.jsx`: Mengelola state `user`, `token`, `isAuthenticated`, `isLoading`, fungsi `login()`, `logout()`.

---

## UI / UX Requirements
- Tampilan form modern dengan fokus pada kejelasan pesan error di bawah masing-masing input field.
- Tombol toggle mata (*eye icon*) untuk melihat/menyembunyikan teks password.
- Indikator loading spinner pada tombol submit saat proses request berlangsung.

---

## Validation & Security Rules
- Dilarang membocorkan apakah email atau password yang salah pada pesan kegagalan login (gunakan pesan umum: "Email atau kata sandi tidak cocok").
- Gunakan HTTPS pada seluruh komunikasi API untuk mencegah penyadapan token di jaringan publik.

---

## Testing Scenarios
### Unit Test
- Validasi logika Zod schema untuk format email dan panjang password.
- Uji perbandingan hash password `bcrypt.compare()`.
### Integration Test
- Registrasi user baru -> verifikasi baris di database.
- Login user baru -> verifikasi keabsahan payload token JWT.
- Akses rute `/api/auth/me` menggunakan token yang diterbitkan.

---

## AI Agent Instructions
- **Backend Agent**: Letakkan seluruh logika token di `authService.js`. Jangan menulis SQL query manual; gunakan Prisma client.
- **Frontend Agent**: Simpan token di `localStorage` dan sinkronkan dengan Axios Authorization default headers.
- **Database Agent**: Pastikan indeks unik pada kolom `email` selalu terpasang.
