import { Router } from "express";
import * as cmsLearningService from "../services/cmsLearningService.js";
import { optionalAuthenticateToken } from "../middleware/authMiddleware.js";
import { AppError } from "../utils/appError.js";
import { sendError, sendSuccess } from "../utils/response.js";

const router = Router();

const handleAiError = (res, error, fallback) => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, {
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
  }
  console.error("[AiRoutes Error]:", error);
  return sendError(res, 500, fallback);
};

/**
 * GET /api/ai/knowledge/lessons/:lessonId
 * Mengambil representasi materi terstruktur, plainTextContent, dan RAG chunks
 * (Hanya mengizinkan materi berstatus PUBLISHED)
 */
router.get("/knowledge/lessons/:lessonId", optionalAuthenticateToken, async (req, res) => {
  try {
    const data = await cmsLearningService.getLlmLessonKnowledge(req.params.lessonId);
    return sendSuccess(
      res,
      200,
      "Konteks pengetahuan materi terstruktur berhasil dimuat untuk LLM.",
      data
    );
  } catch (error) {
    return handleAiError(res, error, "Gagal memuat konteks pengetahuan materi.");
  }
});

/**
 * GET /api/ai/knowledge/search?q={query}
 * Pencarian chunk pengetahuan berbasis heading/section untuk RAG & AI Tutor
 */
router.get("/knowledge/search", optionalAuthenticateToken, async (req, res) => {
  try {
    const query = req.query.q || req.query.query || "";
    const limit = req.query.limit || 5;
    const data = await cmsLearningService.searchLlmKnowledgeChunks(query, limit);
    return sendSuccess(res, 200, "Hasil pencarian chunk pengetahuan LLM berhasil dimuat.", data);
  } catch (error) {
    return handleAiError(res, error, "Gagal melakukan pencarian basis pengetahuan LLM.");
  }
});

/**
 * POST /api/ai/tutor
 * Tanya-Jawab Kontekstual dengan AI Investment Tutor
 */
router.post("/tutor", optionalAuthenticateToken, async (req, res) => {
  try {
    const { question, prompt, lessonId, lesson_id, lessonSlug, module_slug } = req.body || {};
    const data = await cmsLearningService.askAiInvestmentTutor({
      question: question || prompt || "",
      lessonId: lessonId || lesson_id || null,
      lessonSlug: lessonSlug || module_slug || null,
      userId: req.user?.id || null,
    });
    return sendSuccess(res, 200, "Respons AI Investment Tutor berhasil disusun.", data);
  } catch (error) {
    return handleAiError(res, error, "Gagal memproses pertanyaan ke AI Investment Tutor.");
  }
});

export default router;

