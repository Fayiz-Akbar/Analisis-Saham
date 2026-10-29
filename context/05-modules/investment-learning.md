# MODULE: INVESTMENT EDUCATION, CURRICULUM, QUIZ & LLM EVALUATOR

## Overview
Modul Investment Education, Curriculum, Quiz, and LLM Evaluator merupakan pusat literasi pasar modal (*investment learning center*) pada platform. Modul ini menyediakan kurikulum pembelajaran bertingkat 3 level (Pemula, Menengah, Mahir) yang terstruktur dan ramah bagi calon investor ritel. Setiap modul materi dilengkapi penjelasan konseptual, formula matematis, contoh studi kasus dunia nyata, kuis evaluasi pilihan ganda yang dinilai secara deterministik oleh sistem, **Evaluasi Pemahaman Berbantuan LLM** (menganalisis indikator materi dan memberi umpan balik tanpa mengubah nilai kuis), asisten belajar interaktif **AI Investment Tutor**, serta **Portal Administrator** untuk pengelolaan konten materi dan kuis.

---

## Objectives
1. Menyediakan jalur pembelajaran investasi saham terstruktur dalam 3 tingkat pembelajaran: Level Pemula (*Beginner*), Level Menengah (*Intermediate*), dan Level Mahir (*Advanced*).
2. Mencatat progres belajar pengguna per modul secara persisten dan terpisah dari skor kuis evaluasi.
3. Menguji pemahaman pengguna melalui kuis evaluasi pilihan ganda yang dinilai secara deterministik oleh sistem berdasarkan kunci jawaban resmi.
4. Menerapkan model LLM (Google Gemini) untuk menyusun evaluasi pemahaman pengguna berupa analisis capaian indikator materi dan umpan balik materi yang perlu dipelajari kembali tanpa mengubah skor kuis.
5. Menyediakan mekanisme *graceful fallback*: jika layanan LLM mengalami kegagalan, nilai deterministik dan pembahasan resmi tetap disajikan secara utuh.
6. Menyediakan antarmuka chat **AI Investment Tutor** yang siap menjelaskan konsep dan terminologi pasar modal berbasis konteks materi edukasi.
7. Menyediakan fitur bagi **Administrator** untuk mengelola modul materi dan kuis evaluasi (termasuk kunci jawaban, pembahasan resmi, dan indikator materi).

---

## Stakeholders
### Investor (End-User / Mahasiswa / Calon Investor)
Memerlukan kurikulum belajar bertahap yang tidak mengintimidasi, kuis untuk mengukur pemahaman secara obyektif, penjelasan capaian konsep melalui umpan balik LLM, serta AI Tutor untuk konsultasi materi mandiri.
### Administrator
Mengelola modul pembelajaran (menambah, mengubah, menghapus, mengatur urutan) serta mengelola bank soal kuis, kunci jawaban resmi, teks pembahasan, dan indikator materi.

---

## Functional Requirements (KF-02, KF-03, KF-04, KF-05, KF-06, KF-07, KF-16, KF-17)

### 1. Kurikulum Edukasi Bertingkat 3 Level (`/learn`)
- **KF-02**: Sistem menyediakan katalog materi investasi saham yang dikelompokkan ke dalam 3 tingkatan pembelajaran:
  - **Level Pemula (Beginner)**: Pengenalan pasar modal dan bursa efek, konsep dasar saham, satuan perdagangan lot (1 lot = 100 lembar), mekanisme harga dan indeks pasar (IHSG), capital gain vs capital loss, dividen, serta mindset dasar investasi.
  - **Level Menengah (Intermediate)**: Pengenalan analisis fundamental, pembacaan laporan keuangan (Laba Rugi, Neraca, Arus Kas), 4 pilar metrik utama (Valuation: PER, PBV; Profitability: ROE, ROA, NPM; Solvability: DER; Growth), analisis berita dan sentimen pasar modal.
  - **Level Mahir (Advanced)**: Manajemen risiko dan diversifikasi portofolio, analisis volatilitas imbal hasil dan evaluasi kinerja portofolio, strategi investasi jangka panjang (Dollar-Cost Averaging realistis vs Lump Sum, Value Investing, Dividend Investing).
- **KF-03**: Sistem menampilkan materi sesuai level dan menyimpan status progres belajar selesai (*completed*); progres belajar dibedakan secara tegas dari nilai kuis evaluasi.

### 2. Detail Materi Pembelajaran (`/learn/:slug`)
- Memuat judul modul, kategori level, estimasi waktu baca, teks penjelasan konseptual, contoh numerik, dan status penyelesaian.
- Pengguna dapat menandai modul sebagai selesai (`POST /api/learning/:id/progress`).

### 3. Modul Kuis Evaluasi & Pembahasan Resmi (`/learn/:slug/quiz`)
- **KF-04**: Setiap modul memiliki instrumen kuis evaluasi pilihan ganda (A, B, C, D) yang menguji indikator konsep materi.
- **KF-05**: Sistem mengevaluasi jawaban pengguna berdasarkan kunci jawaban resmi yang tersimpan di sistem, menghitung skor perolehan (0–100%), dan menyimpan hasil percobaan secara deterministik.
- **KF-06**: Sistem menampilkan teks pembahasan resmi untuk setiap butir soal kuis segera setelah jawaban dikirimkan.

### 4. Evaluasi Pemahaman Berbantuan LLM (`KF-17`)
- **KF-17**: Sistem menyusun payload konteks (butir soal, jawaban yang dipilih pengguna, kunci jawaban resmi, pembahasan resmi, dan indikator materi yang diuji) lalu mengirimkannya ke Google Gemini API.
- LLM menyusun evaluasi pemahaman berupa:
  1. Ringkasan konsep dan indikator materi yang telah dipahami dengan baik.
  2. Penjelasan konsep yang belum tepat berdasarkan jawaban salah pengguna.
  3. Rekomendasi modul materi yang perlu dipelajari kembali.
- **Integritas Penilaian**: LLM secara tegas **dilarang memodifikasi nilai angka hasil kuis**. Nilai tetap dihitung secara deterministik oleh sistem.
- **Graceful Fallback**: Apabila panggilan API LLM mengalami timeout atau kegagalan koneksi, sistem tetap menyajikan nilai kuis deterministik dan pembahasan resmi tanpa kegagalan pada antarmuka pengguna.

### 5. AI Investment Tutor (`/ai/tutor`, `KF-07`)
- **KF-07**: Menyediakan asisten belajar berbasis LLM yang menjawab pertanyaan konseptual seputar materi investasi saham.
- Respon disusun dengan alur terstruktur: Definisi -> Formula/Konsep -> Contoh Kasus -> Cara Membaca -> Catatan Risiko.
- **Guardrail**: Tutor dilarang memberikan sinyal beli/jual saham nyata atau prediksi harga masa depan.

### 6. Pengelolaan Materi & Kuis oleh Administrator (`KF-16`)
- **KF-16**: Administrator dapat:
  - Mengelola modul pembelajaran (CRUD materi, penentuan level pemula/menengah/mahir, urutan modul, dan status publikasi).
  - Mengelola instrumen kuis (CRUD butir soal, opsi A-D, kunci jawaban resmi, pembahasan resmi, dan pemetaan indikator materi).

---

## Business Rules
- **BR-LRN-001**: Kuis dapat dikerjakan ulang (*retake*) tanpa batas percobaan untuk mendukung pembelajaran mandiri.
- **BR-LRN-002**: Nilai kuis ditentukan secara deterministik oleh kunci jawaban sistem, bukan oleh model LLM.
- **BR-LRN-003**: Evaluasi pemahaman LLM berfungsi sebagai umpan balik formatif kualitatif untuk membimbing belajar pengguna.
- **BR-LRN-004**: Progres penyelesaian modul materi dicatat tersendiri dan tidak dihalangi oleh status kelulusan kuis.
- **BR-LRN-005**: Seluruh keluaran AI Tutor dan evaluasi kuis wajib mencantumkan disclaimer edukasi non-finansial (*No Financial Advice*).

---

## Database Design (PostgreSQL & Prisma)

```sql
-- Modul Materi Pembelajaran
CREATE TABLE learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    order_index INTEGER NOT NULL DEFAULT 1,
    content_body TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 5,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progres Belajar Pengguna
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_learning_module UNIQUE(user_id, module_id)
);

-- Instrumen Kuis Evaluasi
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_key VARCHAR(5) NOT NULL CHECK (correct_key IN ('A', 'B', 'C', 'D')),
    explanation_text TEXT NOT NULL,
    indicator_concept VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Riwayat Percobaan Kuis & Evaluasi LLM
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    score_percentage NUMERIC(5, 2) NOT NULL,
    answers_payload JSONB NOT NULL,
    ai_feedback_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## API Endpoints

| Method | Path | Purpose | Authorization | Request Body | Response Status |
|---|---|---|---|---|---|
| `GET` | `/api/learning` | Daftar modul per level & progres | Public / Bearer | None | `200 OK` |
| `GET` | `/api/learning/:slug` | Isi detail modul materi | Public / Bearer | None | `200 OK` |
| `POST` | `/api/learning/:id/progress` | Tandai modul selesai | Bearer JWT | `{ "completed": true }` | `200 OK` |
| `GET` | `/api/learning/:id/quiz` | Ambil soal kuis tanpa kunci | Bearer JWT | None | `200 OK` |
| `POST` | `/api/learning/:id/quiz/submit` | Kirim jawaban kuis, terima nilai deterministik, pembahasan, & umpan balik LLM | Bearer JWT | `{ "answers": [{ "question_id": "...", "selected_key": "B" }] }` | `200 OK` |
| `POST` | `/api/ai/tutor` | Tanya jawab materi edukasi dengan AI Tutor | Bearer JWT | `{ "question": "...", "module_slug": "..." }` | `200 OK` |
| `POST` | `/api/admin/modules` | Tambah modul pembelajaran (Admin) | Bearer JWT (Admin) | `{ "title": "...", "level": "BEGINNER", ... }` | `201 Created` |
| `PUT` | `/api/admin/modules/:id` | Edit modul pembelajaran (Admin) | Bearer JWT (Admin) | Payload modul | `200 OK` |
| `DELETE`| `/api/admin/modules/:id` | Hapus modul pembelajaran (Admin) | Bearer JWT (Admin) | None | `200 OK` |
| `POST` | `/api/admin/quizzes` | Tambah soal kuis & kunci (Admin) | Bearer JWT (Admin) | `{ "module_id": "...", "question_text": "...", "correct_key": "A", ... }` | `201 Created` |

---

## Alur Evaluasi Pemahaman LLM (`POST /api/learning/:id/quiz/submit`)

```text
Pengguna Submit Jawaban Kuis
            │
            ▼
Sistem Backend (Deterministik):
 ├── Cocokkan jawaban vs correct_key di DB
 ├── Hitung score_percentage = (Benar / Total) * 100
 ├── Ambil teks pembahasan resmi per soal
 └── Simpan catatan percobaan ke quiz_attempts
            │
            ▼
Context Builder untuk LLM:
 ├── Gabungkan Soal + Jawaban User + Kunci Resmi + Pembahasan + Indikator Konsep
            │
            ▼
Panggil Google Gemini API (dengan Timeout 3-5 detik)
            ├── Sukses ──> Parse umpan balik indikator & materi rekomendasi
            └── Gagal / Timeout ──> Fallback ke nilai deterministik & pembahasan saja
            │
            ▼
Kembalikan Response Lengkap ke Frontend:
 {
   "score": 75.0,
   "evaluations": [ { "question_id": "...", "is_correct": true, "explanation": "..." } ],
   "ai_feedback": {
     "mastered_concepts": ["Perhitungan ROE"],
     "needs_review": ["Interpretasi DER pada industri perbankan"],
     "recommended_module": "rasio-solvabilitas-dan-risiko"
   }
 }
```
