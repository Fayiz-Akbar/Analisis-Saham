import * as adminContentService from "../services/adminContentService.js";
import * as cmsLearningService from "../services/cmsLearningService.js";
import { AppError, formatZodIssues } from "../utils/appError.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { blocksToMarkdown } from "../utils/structuredContentEngine.js";
import {
  createModuleSchema,
  createQuizSchema,
  idParamSchema,
  moduleListQuerySchema,
  updateModuleSchema,
  updateQuizSchema,
} from "../validators/adminContentValidators.js";

/**
 * Normalisasi body modul: menerima baik camelCase maupun snake_case
 * serta contentBlocks terstruktur.
 */
const normalizeModuleInput = (body = {}) => {
  const out = {};
  if (body.courseId !== undefined) out.courseId = body.courseId;
  if (body.submoduleTitle !== undefined) out.submoduleTitle = body.submoduleTitle;
  if (body.title !== undefined) out.title = body.title;
  if (body.slug !== undefined) out.slug = body.slug;
  if (body.level !== undefined) {
    out.level = typeof body.level === "string" ? body.level.trim().toUpperCase() : body.level;
  }
  if (body.summary !== undefined) out.summary = body.summary;

  const contentBlocks = body.contentBlocks ?? body.content_blocks;
  if (contentBlocks !== undefined) out.contentBlocks = contentBlocks;

  let contentBody = body.contentBody ?? body.content_body ?? body.content;
  if ((!contentBody || String(contentBody).trim() === "") && contentBlocks) {
    contentBody = blocksToMarkdown(contentBlocks) || body.title || "Materi Pembelajaran";
  }
  if (contentBody !== undefined) out.contentBody = contentBody;

  if (body.learningObjectives !== undefined || body.learning_objectives !== undefined) {
    out.learningObjectives = body.learningObjectives ?? body.learning_objectives;
  }
  if (body.keywords !== undefined) out.keywords = body.keywords;
  if (body.references !== undefined) out.references = body.references;

  const estimatedMinutes = body.estimatedMinutes ?? body.estimated_minutes;
  if (estimatedMinutes !== undefined) out.estimatedMinutes = estimatedMinutes;

  const orderIndex = body.orderIndex ?? body.order_index;
  if (orderIndex !== undefined && orderIndex !== "") out.orderIndex = orderIndex;

  const isPublished = body.isPublished ?? body.is_published;
  if (isPublished !== undefined) out.isPublished = isPublished;

  return out;
};

/**
 * Normalisasi body soal kuis: menerima baik camelCase maupun snake_case.
 */
const normalizeQuizInput = (body = {}) => {
  const out = {};

  const moduleId = body.moduleId ?? body.module_id ?? body.contentId ?? body.content_id;
  if (moduleId !== undefined) out.moduleId = moduleId;

  const questionText = body.questionText ?? body.question_text ?? body.question;
  if (questionText !== undefined) out.questionText = questionText;

  const optionA = body.optionA ?? body.option_a;
  if (optionA !== undefined) out.optionA = optionA;

  const optionB = body.optionB ?? body.option_b;
  if (optionB !== undefined) out.optionB = optionB;

  const optionC = body.optionC ?? body.option_c;
  if (optionC !== undefined) out.optionC = optionC;

  const optionD = body.optionD ?? body.option_d;
  if (optionD !== undefined) out.optionD = optionD;

  const correctKey =
    body.correctKey ?? body.correct_key ?? body.correctAnswer ?? body.correct_answer;
  if (correctKey !== undefined) {
    out.correctKey =
      typeof correctKey === "string" ? correctKey.trim().toUpperCase() : correctKey;
  }

  const explanationText = body.explanationText ?? body.explanation_text ?? body.explanation;
  if (explanationText !== undefined) out.explanationText = explanationText;

  const indicatorConcept = body.indicatorConcept ?? body.indicator_concept;
  if (indicatorConcept !== undefined) out.indicatorConcept = indicatorConcept;

  return out;
};

const handleControllerError = (res, error, fallbackMessage) => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, {
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
  }
  console.error("[AdminController Error]:", error);
  return sendError(res, 500, fallbackMessage);
};

// ==========================================
// MANAJEMEN MODUL PEMBELAJARAN (PB-12)
// ==========================================

export const getModules = async (req, res) => {
  try {
    const rawQuery = {
      level: req.query.level ? String(req.query.level).toUpperCase() : undefined,
      status: req.query.status ? String(req.query.status).toLowerCase() : undefined,
      search: req.query.search ? String(req.query.search) : undefined,
    };

    const queryResult = moduleListQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return sendError(
        res,
        400,
        "Parameter filter modul tidak valid",
        formatZodIssues(queryResult.error)
      );
    }

    const result = await adminContentService.listModules(queryResult.data);
    return sendSuccess(res, 200, "Daftar modul pembelajaran berhasil dimuat.", result);
  } catch (error) {
    return handleControllerError(res, error, "Gagal memuat daftar modul pembelajaran.");
  }
};

export const createModule = async (req, res) => {
  try {
    const normalized = normalizeModuleInput(req.body);
    const parseResult = createModuleSchema.safeParse(normalized);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        "Validasi modul pembelajaran gagal",
        formatZodIssues(parseResult.error)
      );
    }

    const created = await adminContentService.createModule(parseResult.data);
    return sendSuccess(res, 201, "Modul pembelajaran berhasil ditambahkan.", {
      module: created,
    });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menambahkan modul pembelajaran.");
  }
};

export const updateModule = async (req, res) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return sendError(res, 400, "ID modul tidak valid", formatZodIssues(paramResult.error));
    }

    const normalized = normalizeModuleInput(req.body);
    const bodyResult = updateModuleSchema.safeParse(normalized);
    if (!bodyResult.success) {
      return sendError(
        res,
        400,
        "Validasi perubahan modul gagal",
        formatZodIssues(bodyResult.error)
      );
    }

    const updated = await adminContentService.updateModule(paramResult.data.id, bodyResult.data);
    return sendSuccess(res, 200, "Modul pembelajaran berhasil diperbarui.", {
      module: updated,
    });
  } catch (error) {
    return handleControllerError(res, error, "Gagal memperbarui modul pembelajaran.");
  }
};

export const deleteModule = async (req, res) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return sendError(res, 400, "ID modul tidak valid", formatZodIssues(paramResult.error));
    }

    const deleted = await adminContentService.deleteModule(paramResult.data.id);
    return sendSuccess(res, 200, `Modul "${deleted.title}" berhasil dihapus.`, {
      deleted,
    });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menghapus modul pembelajaran.");
  }
};

// ==========================================
// MANAJEMEN BANK SOAL KUIS (PB-13)
// ==========================================

export const getModuleQuizzes = async (req, res) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return sendError(res, 400, "ID modul tidak valid", formatZodIssues(paramResult.error));
    }

    const result = await adminContentService.listQuizzesByModule(paramResult.data.id);
    return sendSuccess(res, 200, "Daftar soal kuis modul berhasil dimuat.", result);
  } catch (error) {
    return handleControllerError(res, error, "Gagal memuat daftar soal kuis.");
  }
};

export const createQuiz = async (req, res) => {
  try {
    const normalized = normalizeQuizInput(req.body);
    const parseResult = createQuizSchema.safeParse(normalized);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        "Validasi butir soal kuis gagal",
        formatZodIssues(parseResult.error)
      );
    }

    const created = await adminContentService.createQuiz(parseResult.data);
    return sendSuccess(res, 201, "Butir soal kuis berhasil ditambahkan.", {
      quiz: created,
    });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menambahkan butir soal kuis.");
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return sendError(res, 400, "ID soal kuis tidak valid", formatZodIssues(paramResult.error));
    }

    const normalized = normalizeQuizInput(req.body);
    const bodyResult = updateQuizSchema.safeParse(normalized);
    if (!bodyResult.success) {
      return sendError(
        res,
        400,
        "Validasi perubahan soal kuis gagal",
        formatZodIssues(bodyResult.error)
      );
    }

    const updated = await adminContentService.updateQuiz(paramResult.data.id, bodyResult.data);
    return sendSuccess(res, 200, "Butir soal kuis berhasil diperbarui.", {
      quiz: updated,
    });
  } catch (error) {
    return handleControllerError(res, error, "Gagal memperbarui butir soal kuis.");
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return sendError(res, 400, "ID soal kuis tidak valid", formatZodIssues(paramResult.error));
    }

    const deleted = await adminContentService.deleteQuiz(paramResult.data.id);
    return sendSuccess(res, 200, "Butir soal kuis berhasil dihapus.", {
      deleted,
    });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menghapus butir soal kuis.");
  }
};

// ==========================================
// LEARNING CONTENT STUDIO (CMS HIERARCHY & BLOCK EDITOR)
// ==========================================

export const getCmsTree = async (_req, res) => {
  try {
    const tree = await cmsLearningService.getAdminCmsTree();
    return sendSuccess(res, 200, "Struktur hierarki CMS berhasil dimuat.", tree);
  } catch (error) {
    return handleControllerError(res, error, "Gagal memuat pohon hierarki CMS.");
  }
};

export const createCmsCourse = async (req, res) => {
  try {
    const course = await cmsLearningService.createCourse(req.body || {});
    return sendSuccess(res, 201, "Kelas pembelajaran baru berhasil dibuat.", { course });
  } catch (error) {
    return handleControllerError(res, error, "Gagal membuat kelas pembelajaran.");
  }
};

export const updateCmsCourse = async (req, res) => {
  try {
    const course = await cmsLearningService.updateCourse(req.params.id, req.body || {});
    return sendSuccess(res, 200, "Kelas pembelajaran berhasil diperbarui.", { course });
  } catch (error) {
    return handleControllerError(res, error, "Gagal memperbarui kelas pembelajaran.");
  }
};

export const deleteCmsCourse = async (req, res) => {
  try {
    const deleted = await cmsLearningService.deleteCourse(req.params.id);
    return sendSuccess(res, 200, "Kelas pembelajaran berhasil dihapus.", { deleted });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menghapus kelas pembelajaran.");
  }
};

export const getCmsLessonDetail = async (req, res) => {
  try {
    const data = await cmsLearningService.getLessonDetailAdmin(req.params.id);
    return sendSuccess(res, 200, "Detail materi berhasil dimuat.", data);
  } catch (error) {
    return handleControllerError(res, error, "Gagal memuat detail materi.");
  }
};

export const createCmsLesson = async (req, res) => {
  try {
    const lesson = await cmsLearningService.createLesson(req.body || {}, req.user);
    return sendSuccess(res, 201, "Materi pembelajaran baru berhasil dibuat.", { lesson });
  } catch (error) {
    return handleControllerError(res, error, "Gagal membuat materi pembelajaran.");
  }
};

export const updateCmsLesson = async (req, res) => {
  try {
    const lesson = await cmsLearningService.updateLesson(req.params.id, req.body || {}, req.user);
    return sendSuccess(res, 200, "Materi pembelajaran berhasil disimpan.", { lesson });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menyimpan perubahan materi.");
  }
};

export const duplicateCmsLesson = async (req, res) => {
  try {
    const lesson = await cmsLearningService.duplicateLesson(req.params.id, req.user);
    return sendSuccess(res, 201, "Materi pembelajaran berhasil diduplikasi.", { lesson });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menduplikasi materi pembelajaran.");
  }
};

export const deleteCmsLesson = async (req, res) => {
  try {
    const deleted = await cmsLearningService.deleteLesson(req.params.id);
    return sendSuccess(res, 200, "Materi pembelajaran berhasil dihapus.", { deleted });
  } catch (error) {
    return handleControllerError(res, error, "Gagal menghapus materi pembelajaran.");
  }
};

export const reorderCms = async (req, res) => {
  try {
    const result = await cmsLearningService.reorderCmsItems(req.body || {});
    return sendSuccess(res, 200, "Urutan konten berhasil diperbarui.", result);
  } catch (error) {
    return handleControllerError(res, error, "Gagal mengubah urutan konten.");
  }
};

export const restoreCmsLessonRevision = async (req, res) => {
  try {
    const lesson = await cmsLearningService.restoreLessonRevision(
      req.params.id,
      req.params.revisionId,
      req.user
    );
    return sendSuccess(res, 200, "Versi materi berhasil dipulihkan.", { lesson });
  } catch (error) {
    return handleControllerError(res, error, "Gagal memulihkan versi materi.");
  }
};
