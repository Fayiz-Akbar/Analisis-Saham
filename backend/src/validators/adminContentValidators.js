import { z } from "zod";

/**
 * Skema Validasi Zod - Portal Administrator (KF-16, PB-12, PB-13)
 * Manajemen Modul Pembelajaran & Bank Soal Kuis Evaluasi.
 */

export const LEARNING_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
export const QUIZ_OPTION_KEYS = ["A", "B", "C", "D"];
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const requiredText = (label, min, max) =>
  z
    .string({
      required_error: `${label} wajib diisi`,
      invalid_type_error: `${label} harus berupa teks`,
    })
    .trim()
    .min(min, min <= 1 ? `${label} wajib diisi` : `${label} minimal ${min} karakter`)
    .max(max, `${label} maksimal ${max} karakter`);

const integerField = (label, min, max) =>
  z.coerce
    .number({ invalid_type_error: `${label} harus berupa angka` })
    .int(`${label} harus berupa bilangan bulat`)
    .min(min, `${label} minimal ${min}`)
    .max(max, `${label} maksimal ${max}`);

// ==========================================
// PARAMETER & QUERY
// ==========================================

export const idParamSchema = z.object({
  id: z.string().uuid("Format ID tidak valid (UUID)"),
});

export const moduleListQuerySchema = z.object({
  level: z.enum(LEARNING_LEVELS).optional(),
  status: z.enum(["published", "draft"]).optional(),
  search: z.string().trim().max(100).optional(),
});

// ==========================================
// MODUL PEMBELAJARAN (learning_modules)
// ==========================================

const slugField = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .toLowerCase()
    .max(200, "Slug maksimal 200 karakter")
    .regex(SLUG_REGEX, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-) tanpa spasi"),
]);

const moduleShape = {
  title: requiredText("Judul modul", 3, 200),
  slug: slugField.optional(),
  level: z.enum(LEARNING_LEVELS, {
    errorMap: () => ({ message: "Level wajib dipilih: BEGINNER, INTERMEDIATE, atau ADVANCED" }),
  }),
  summary: z
    .string({ invalid_type_error: "Ringkasan harus berupa teks" })
    .trim()
    .max(500, "Ringkasan maksimal 500 karakter")
    .nullable()
    .optional(),
  contentBody: requiredText("Isi materi", 20, 100000),
  estimatedMinutes: integerField("Estimasi waktu baca", 1, 180),
  orderIndex: integerField("Urutan tampil", 1, 999).optional(),
  isPublished: z.boolean({ invalid_type_error: "Status terbit harus bernilai boolean" }).optional(),
};

export const createModuleSchema = z.object(moduleShape);

export const updateModuleSchema = z
  .object(moduleShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada data modul yang dikirim untuk diperbarui",
  });

// ==========================================
// BANK SOAL KUIS (quiz_questions)
// ==========================================

const quizShape = {
  moduleId: z
    .string({ required_error: "Modul materi wajib dipilih" })
    .uuid("Modul materi tidak valid"),
  questionText: requiredText("Teks pertanyaan", 10, 2000),
  optionA: requiredText("Opsi A", 1, 255),
  optionB: requiredText("Opsi B", 1, 255),
  optionC: requiredText("Opsi C", 1, 255),
  optionD: requiredText("Opsi D", 1, 255),
  correctKey: z.enum(QUIZ_OPTION_KEYS, {
    errorMap: () => ({ message: "Kunci jawaban wajib dipilih: A, B, C, atau D" }),
  }),
  explanationText: requiredText("Pembahasan resmi", 10, 5000),
  indicatorConcept: requiredText("Indikator konsep materi", 3, 150),
};

export const createQuizSchema = z.object(quizShape);

export const updateQuizSchema = z
  .object(quizShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada data soal yang dikirim untuk diperbarui",
  });

