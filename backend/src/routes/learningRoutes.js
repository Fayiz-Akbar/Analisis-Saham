import { Router } from "express";
import * as cmsLearningService from "../services/cmsLearningService.js";
import { authenticateToken, optionalAuthenticateToken } from "../middleware/authMiddleware.js";
import { AppError } from "../utils/appError.js";
import { sendError, sendSuccess } from "../utils/response.js";

const router = Router();

const handleRouteError = (res, error, fallback) => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, {
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
  }
  console.error("[LearningRoutes Error]:", error);
  return sendError(res, 500, fallback);
};

/**
 * GET /api/learning & GET /api/learning/courses
 * Katalog kurikulum terstruktur (Courses -> Modules -> Lessons) yang berstatus PUBLISHED
 */
const handleGetCatalog = async (req, res) => {
  try {
    const data = await cmsLearningService.getPublicLearningCatalog(req.user?.id || null);
    return sendSuccess(res, 200, "Katalog materi pembelajaran berhasil dimuat.", data);
  } catch (error) {
    return handleRouteError(res, error, "Gagal memuat katalog materi pembelajaran.");
  }
};

router.get("/", optionalAuthenticateToken, handleGetCatalog);
router.get("/courses", optionalAuthenticateToken, handleGetCatalog);

/**
 * GET /api/learning/courses/:courseId/lessons
 */
router.get("/courses/:courseId/lessons", optionalAuthenticateToken, async (req, res) => {
  try {
    const catalog = await cmsLearningService.getPublicLearningCatalog(req.user?.id || null);
    const course = catalog.courses.find(
      (c) => c.id === req.params.courseId || c.slug === req.params.courseId
    );
    if (!course) {
      return sendError(res, 404, "Course tidak ditemukan.");
    }
    const lessons = course.modules.flatMap((m) => m.lessons);
    return sendSuccess(res, 200, "Daftar materi pada course berhasil dimuat.", {
      course,
      lessons,
    });
  } catch (error) {
    return handleRouteError(res, error, "Gagal memuat daftar materi course.");
  }
});

/**
 * GET /api/learning/lessons/:idOrSlug & GET /api/learning/lessons/:idOrSlug/content
 */
const handleGetLesson = async (req, res) => {
  try {
    const data = await cmsLearningService.getPublicLessonDetail(
      req.params.idOrSlug,
      req.user?.id || null
    );
    return sendSuccess(res, 200, "Detail materi pembelajaran berhasil dimuat.", data);
  } catch (error) {
    return handleRouteError(res, error, "Gagal memuat detail materi pembelajaran.");
  }
};

router.get("/lessons/:idOrSlug", optionalAuthenticateToken, handleGetLesson);
router.get("/lessons/:idOrSlug/content", optionalAuthenticateToken, handleGetLesson);

/**
 * POST /api/learning/lessons/:id/progress
 * Simpan progres belajar pengguna berdasarkan materi (status: IN_PROGRESS | COMPLETED)
 */
router.post("/lessons/:id/progress", authenticateToken, async (req, res) => {
  try {
    const result = await cmsLearningService.updateUserLessonProgress(
      req.user.id,
      req.params.id,
      req.body || {}
    );
    return sendSuccess(res, 200, "Progres pembelajaran berhasil diperbarui.", result);
  } catch (error) {
    return handleRouteError(res, error, "Gagal menyimpan progres pembelajaran.");
  }
});

/**
 * GET /api/learning/notes
 * Ambil catatan belajar pengguna (opsional filter ?lessonId=...)
 */
router.get("/notes", authenticateToken, async (req, res) => {
  try {
    const notes = await cmsLearningService.getUserLearningNotes(
      req.user.id,
      req.query.lessonId || null
    );
    return sendSuccess(res, 200, "Daftar catatan belajar berhasil dimuat.", { notes });
  } catch (error) {
    return handleRouteError(res, error, "Gagal memuat catatan belajar.");
  }
});

/**
 * POST /api/learning/notes
 */
router.post("/notes", authenticateToken, async (req, res) => {
  try {
    const note = await cmsLearningService.createUserLearningNote(req.user.id, req.body || {});
    return sendSuccess(res, 201, "Catatan belajar berhasil disimpan.", { note });
  } catch (error) {
    return handleRouteError(res, error, "Gagal menyimpan catatan belajar.");
  }
});

/**
 * PUT /api/learning/notes/:id
 */
router.put("/notes/:id", authenticateToken, async (req, res) => {
  try {
    const note = await cmsLearningService.updateUserLearningNote(
      req.user.id,
      req.params.id,
      req.body || {}
    );
    return sendSuccess(res, 200, "Catatan belajar berhasil diperbarui.", { note });
  } catch (error) {
    return handleRouteError(res, error, "Gagal memperbarui catatan belajar.");
  }
});

/**
 * DELETE /api/learning/notes/:id
 */
router.delete("/notes/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await cmsLearningService.deleteUserLearningNote(req.user.id, req.params.id);
    return sendSuccess(res, 200, "Catatan belajar berhasil dihapus.", { deleted });
  } catch (error) {
    return handleRouteError(res, error, "Gagal menghapus catatan belajar.");
  }
});

/**
 * GET /api/learning/modules/:id/quiz
 * Ambil soal kuis modul tanpa kunci jawaban
 */
router.get("/modules/:id/quiz", optionalAuthenticateToken, async (req, res) => {
  try {
    const data = await cmsLearningService.getModuleQuizForUser(req.params.id);
    return sendSuccess(res, 200, "Instrumen kuis evaluasi berhasil dimuat.", data);
  } catch (error) {
    return handleRouteError(res, error, "Gagal memuat soal kuis modul.");
  }
});

/**
 * POST /api/learning/modules/:id/quiz/submit
 * Kirim lembar jawaban kuis untuk penilaian deterministik + umpan balik diagnostik AI
 */
router.post("/modules/:id/quiz/submit", optionalAuthenticateToken, async (req, res) => {
  try {
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const data = await cmsLearningService.submitModuleQuizForUser(
      req.user?.id || null,
      req.params.id,
      answers
    );
    return sendSuccess(res, 200, "Evaluasi kuis berhasil diproses.", data);
  } catch (error) {
    return handleRouteError(res, error, "Gagal memproses evaluasi kuis.");
  }
});

export default router;

