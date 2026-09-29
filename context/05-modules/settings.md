# MODULE: USER SETTINGS & PROFILE MANAGEMENT

## Overview
Modul User Settings and Profile Management mengelola konfigurasi akun pengguna, pembaruan informasi profil pribadi, pembaruan kata sandi (*password change*), preferensi tampilan antarmuka (tema dark/light), preferensi notifikasi pasar, serta pemutusan sesi (*logout*).

---

## Objectives
1. Memungkinkan pengguna melihat dan memperbarui nama profil mereka.
2. Menyediakan mekanisme pergantian kata sandi yang aman dengan verifikasi kata sandi lama.
3. Mengatur preferensi personal pengguna (tema antarmuka dan notifikasi).
4. Menyediakan alur logout yang bersih dengan pembersihan token di sisi client.

---

## Stakeholders
### Pengguna Terdaftar (Pemula & Berpengalaman)
Mengelola keamanan akun, memperbarui email atau kata sandi, serta menyesuaikan preferensi tampilan aplikasi.
### Administrator Sistem
Memastikan prosedur pergantian kredensial mematuhi standar keamanan kriptografi dan audit jejak pembaruan akun.

---

## Functional Requirements
- **FR-SET-001**: Pengguna dapat melihat detail informasi akun (Nama Lengkap, Email, Tanggal Bergabung) (`GET /api/auth/me`).
- **FR-SET-002**: Pengguna dapat memperbarui nama lengkap (`PUT /api/user/profile`).
- **FR-SET-003**: Pengguna dapat mengganti password dengan memasukkan: Password Lama, Password Baru, dan Konfirmasi Password Baru (`PUT /api/user/password`).
- **FR-SET-004**: Sistem harus memverifikasi bahwa password lama cocok dengan hash di database sebelum mengizinkan pembaruan.
- **FR-SET-005**: Pengguna dapat mengatur preferensi notifikasi (contoh: notifikasi pembaruan materi edukasi, notifikasi batas harga watchlist).
- **FR-SET-006**: Pengguna dapat keluar dari akun (*Logout*), yang akan menghapus token JWT dari penyimpanan lokal browser dan mengarahkan pengguna ke halaman login.

---

## Business Rules
- **BR-SET-001**: Pengguna tidak dapat mengubah alamat email secara langsung tanpa alur verifikasi (alamat email bertindak sebagai identifier unik permanen).
- **BR-SET-002**: Password baru harus berbeda dari password lama dan minimal terdiri dari 8 karakter.
- **BR-SET-003**: Password baru wajib di-hash menggunakan `bcrypt` sebelum disimpan.

---

## Workflow: Change Password
```text
User Submits Change Password Form
(Current Password, New Password, Confirm New Password)
           │
           ▼
PUT /api/user/password (Bearer JWT)
           │
           ▼
Backend Memvalidasi:
 ├── Input Zod Schema valid?
 ├── Ambil User dari `users` by `req.user.id`
 ├── Bcrypt Compare: Apakah Current Password cocok?
 │     └── Jika tidak cocok ──> Return 400 Bad Request ("Password saat ini salah")
 └── Apakah New Password == Confirm?
           │
           ▼
Bcrypt Hash New Password (salt = 10)
           │
           ▼
Update `password_hash` & `updated_at` di Tabel `users`
           │
           ▼
Return 200 OK ("Kata sandi berhasil diperbarui")
```

---

## Database Design
Memanfaatkan tabel `users`:
- `id`, `name`, `email`, `password_hash`, `updated_at`.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/auth/me` | Ambil profil pengguna | Bearer JWT | None | `200 OK` |
| `PUT` | `/api/user/profile` | Perbarui nama pengguna | Bearer JWT | `{ "name": "Fayiz Akbar Baru" }` | `200 OK` |
| `PUT` | `/api/user/password`| Perbarui kata sandi | Bearer JWT | `{ "current_password": "...", "new_password": "..." }` | `200 OK` |

### Sample JSON Response (`PUT /api/user/password`)
```json
{
  "success": true,
  "message": "Kata sandi akun Anda berhasil diperbarui.",
  "data": {
    "updated_at": "2026-09-05T09:00:00.000Z"
  }
}
```

---

## Frontend Design
- **Pages**: `SettingsPage.jsx` (`/settings`).
- **Components**:
  - `ProfileSettingsTab.jsx`: Input edit nama profil dan info email readonly.
  - `SecurityPasswordTab.jsx`: Form ubah kata sandi dengan indikator kekuatan kata sandi (*password strength meter*).
  - `PreferencesTab.jsx`: Toggle switch preferensi notifikasi dan tema tampilan.
  - `LogoutButton.jsx`: Tombol logout dengan modal konfirmasi.

---

## AI Agent Instructions
- **Frontend Agent**: Saat logout, pastikan menghapus token dari `localStorage`, mereset state `AuthContext`, dan menghapus header Authorization di Axios instance sebelum redirect ke `/login`.
