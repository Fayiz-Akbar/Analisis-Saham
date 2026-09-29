# MODULE: INVESTMENT EDUCATION, CURRICULUM & QUIZ

## Overview
Modul Investment Education, Curriculum, and Quiz merupakan pusat literasi pasar modal (*investment learning center*) pada platform. Modul ini menyediakan kurikulum terstruktur 6 level bertahap—mulai dari konsep paling mendasar hingga strategi valuasi dan diversifikasi portofolio lanjutan. Setiap materi dilengkapi dengan penjelasan intuitif, contoh studi kasus dunia nyata, visualisasi formula matematis, kuis interaktif, serta integrasi dengan **AI Investment Tutor** untuk menjawab kebingungan konsep pengguna secara interaktif.

---

## Objectives
1. Menyediakan jalur pembelajaran investasi saham terstruktur 6 level yang ramah bagi investor pemula.
2. Menguji pemahaman pengguna terhadap setiap topik materi melalui modul kuis interaktif pilihan ganda.
3. Mencatat dan melacak progres kelulusan belajar pengguna secara persisten di database.
4. Menyediakan **AI Investment Tutor** yang siap menjelaskan istilah dan konsep finansial menggunakan analogi sederhana yang mudah dipahami.

---

## Stakeholders
### Investor Pemula
Memerlukan kurikulum belajar yang tidak mengintimidasi, disusun berurutan dari nol, dengan kuis untuk memvalidasi pemahaman mandiri sebelum berinvestasi dengan dana nyata.
### Investor Berpengalaman
Menggunakan materi sebagai ensiklopedia referensi cepat (*quick reference*) untuk mengonfirmasi ulang definisi formula rasio (misal: penyesuaian perhitungan ROE atau interpretasi batas aman DER).

---

## Functional Requirements

### 1. Kurikulum Edukasi 6 Level (`/learn`)
- **FR-LRN-001**: Sistem harus menyediakan katalog pembelajaran terbagi dalam 6 level berjenjang:
  - **Level 1 — Introduction**: Pengantar Investasi, Apa itu Saham, Mengenal IDX & IHSG, Konsep Satuan Lot, Capital Gain vs Capital Loss, Dividen.
  - **Level 2 — Understanding Stocks**: Kapitalisasi Pasar (*Big Cap, Mid Cap, Small Cap*), Mekanisme Harga Saham, Volume & Likuiditas, Volatilitas.
  - **Level 3 — Fundamental Metrics**: Pendapatan vs Laba Bersih, Earning Per Share (EPS), Return on Equity (ROE), Return on Assets (ROA), Price-to-Earnings (PE), Price-to-Book Value (PBV), Debt-to-Equity (DER), Net Profit Margin (NPM).
  - **Level 4 — Stock Analysis**: Cara Membaca Laporan Keuangan (Income Statement, Balance Sheet, Cash Flow), Analisis Valuasi, Pengantar Stock Screener & Komparasi Saham.
  - **Level 5 — Portfolio Management**: Prinsip Diversifikasi, Bahaya Konsentrasi, Manajemen Risiko, Menghitung Profil Risiko Portofolio.
  - **Level 6 — Investment Strategy**: Strategi Dollar-Cost Averaging (DCA), Lump Sum vs DCA, Value Investing, Dividend Investing, Investasi Jangka Panjang.

### 2. Detail Materi Pembelajaran (`/learn/:slug`)
- **FR-LRN-002**: Setiap materi artikel harus memuat: Judul, Kategori Level, Tingkat Kesulitan, Estimasi Waktu Baca, Penjelasan Konseptual, Formula Matematis, Contoh Numerik Sederhana, dan Topik Terkait.
- **FR-LRN-003**: Pengguna dapat menandai materi sebagai "Selesai Dibaca" (`POST /api/learning/:id/progress`).

### 3. Modul Kuis Interaktif (`/learn/:slug/quiz`)
- **FR-LRN-004**: Setiap materi artikel memiliki bank soal kuis pilihan ganda (minimal 3–5 pertanyaan).
- **FR-LRN-005**: Pengguna dapat memilih jawaban (A, B, C, D) dan mengirimkannya untuk dievaluasi instan oleh sistem (`POST /api/learning/:id/quiz/submit`).
- **FR-LRN-006**: Sistem harus menampilkan skor akhir (0–100%), pembahasan detail mengapa jawaban tersebut benar/salah, serta menyimpan riwayat percobaan kuis pengguna.

### 4. AI Investment Tutor (`/ai/tutor`)
- **FR-LRN-007**: Sistem harus menyediakan antarmuka chat **AI Investment Tutor** (`POST /api/ai/tutor`) di mana pengguna dapat bertanya mengenai konsep yang belum dimengerti (contoh: *"Saya belum paham bagaimana cara membaca PE Ratio 15x"*).
- **FR-LRN-008**: AI Tutor harus menjawab dengan struktur bertahap: Definisi -> Formula -> Contoh Kasus Sederhana -> Cara Membaca -> Hal yang Perlu Diperhatikan.

---

## Business Rules
- **BR-LRN-001**: Kuis dapat dikerjakan ulang (*retake*) tanpa batas percobaan untuk mendukung proses belajar mandiri.
- **BR-LRN-002**: Skor kelulusan kuis adalah $\ge 75\%$. Jika lulus, status materi otomatis ditandai `completed = true`.
- **BR-LRN-003**: AI Investment Tutor wajib membatasi jawabannya pada ranah edukasi konseptual, tidak diperbolehkan memberikan rekomendasi saham spesifik.

---

## Database Design

### Tables: `learning_contents`, `learning_progress`, `quizzes`, `quiz_attempts`
```sql
CREATE TABLE learning_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('BEGINNER', 'FUNDAMENTAL', 'ANALYSIS', 'PORTFOLIO', 'STRATEGY')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    content TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES learning_contents(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_content UNIQUE(user_id, content_id)
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES learning_contents(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(5) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    answer VARCHAR(5) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Backend Design
- **Services**: `LearningService.js`:
  - `getAllModules(userId)` (daftar level + status selesai)
  - `getModuleBySlug(slug, userId)`
  - `markModuleComplete(userId, contentId)`
  - `getQuizzesByContentId(contentId)`
  - `submitQuizAnswers(userId, contentId, answers)`
- **AI Tutor Service**: `AIService.js` (`consultTutor(question, currentTopicContext)`).

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/learning` | Daftar seluruh modul & progres | Public / Bearer | None | `200 OK` |
| `GET` | `/api/learning/:slug` | Isi artikel materi pembelajaran | Public | None | `200 OK` |
| `GET` | `/api/learning/:id/quiz` | Soal kuis untuk materi tertentu | Public / Bearer | None | `200 OK` |
| `POST` | `/api/learning/:id/progress` | Tandai materi selesai | Bearer JWT | `{ "completed": true }` | `200 OK` |
| `POST` | `/api/learning/:id/quiz/submit` | Kirim jawaban kuis & terima skor | Bearer JWT | `{ "answers": [{ "quiz_id": "...", "answer": "B" }] }` | `200 OK` |
| `POST` | `/api/ai/tutor` | Tanya jawab konsep edukasi AI | Bearer JWT | `{ "question": "...", "topic_slug": "..." }` | `200 OK` |

### Sample JSON Response (`POST /api/learning/:id/quiz/submit`)
```json
{
  "success": true,
  "message": "Kuis berhasil dinilai",
  "data": {
    "total_questions": 4,
    "correct_count": 4,
    "score_percent": 100.0,
    "is_passed": true,
    "evaluations": [
      {
        "quiz_id": "3b145fa8-...",
        "user_answer": "B",
        "correct_answer": "B",
        "is_correct": true,
        "explanation": "Benar! ROE mengukur seberapa efisien perusahaan menghasilkan laba bersih dari modal ekuitas pemegang saham."
      }
    ]
  }
}
```

---

## Frontend Design
- **Pages**:
  - `LearningCenterPage.jsx` (`/learn`): Tampilan roadmap kurikulum 6 level dengan progress bar penyelesaian.
  - `LearningDetailPage.jsx` (`/learn/:slug`): Reader artikel dengan format markdown terstruktur dan tombol "Mulai Kuis".
  - `QuizModal.jsx`: Modal kuis interaktif dengan pilihan ganda dan kartu skor hasil akhir.
  - `AiTutorChatWidget.jsx`: Floating widget asisten AI di pojok halaman belajar.

---

## Testing Scenarios (PRD Section 37)
### Unit Test
- Kalkulasi persentase kelulusan kuis ($\frac{\text{Correct}}{\text{Total}} \times 100\%$).
### Integration Test
- Pengguna menjawab 4 soal benar dari 4 soal -> Memastikan skor 100% dan status materi pada `learning_progress` terisi `completed = true`.

---

## AI Agent Instructions
- **AI Agent**: Gunakan persona "Tutor Finansial yang Sabar dan Mendidik". Hindari jargon tanpa penjelasan. Selalu berikan contoh kasus sehari-hari saat menjelaskan konsep finansial yang abstrak.
