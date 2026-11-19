import prisma from "../lib/prisma.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/appError.js";
import { sanitizeText, slugify } from "../utils/textSanitizer.js";
import { SLUG_REGEX } from "../validators/adminContentValidators.js";
import {
  blocksToMarkdown,
  buildLessonContentChunks,
  extractStructuredPlainText,
  normalizeContentBlocks,
  parseMarkdownToBlocks,
} from "../utils/structuredContentEngine.js";
import { ensureCmsHierarchyInitialized } from "./cmsLearningService.js";

const LEVEL_SORT_ORDER = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
};

/**
 * Format entitas LearningModule agar konsisten (menyediakan camelCase & snake_case alias
 * serta menyertakan contentBlocks, learningObjectives, keywords, references, dan lessons).
 */
export const formatModuleResponse = (mod) => {
  const quizCount = mod._count?.quizQuestions ?? mod.quizQuestions?.length ?? 0;
  const completedUsersCount = mod._count?.learningProgresses ?? 0;
  const attemptsCount = mod._count?.quizAttempts ?? 0;
  const primaryLesson = Array.isArray(mod.lessons) && mod.lessons.length > 0 ? mod.lessons[0] : null;
  const contentBlocks =
    mod.contentBlocks ||
    primaryLesson?.contentBlocks ||
    parseMarkdownToBlocks(mod.contentBody || "");

  return {
    id: mod.id,
    courseId: mod.courseId || null,
    submoduleTitle: mod.submoduleTitle || primaryLesson?.submoduleTitle || "Materi Utama",
    title: mod.title,
    slug: mod.slug,
    level: mod.level,
    summary: mod.summary || "",
    contentBody: mod.contentBody,
    content_body: mod.contentBody,
    contentBlocks,
    content_blocks: contentBlocks,
    plainTextContent: mod.plainTextContent || primaryLesson?.plainTextContent || "",
    learningObjectives: Array.isArray(mod.learningObjectives)
      ? mod.learningObjectives
      : primaryLesson?.learningObjectives || [],
    keywords: Array.isArray(mod.keywords) ? mod.keywords : primaryLesson?.keywords || [],
    references: Array.isArray(mod.references) ? mod.references : primaryLesson?.references || [],
    estimatedMinutes: mod.estimatedMinutes,
    estimated_minutes: mod.estimatedMinutes,
    orderIndex: mod.orderIndex,
    order_index: mod.orderIndex,
    status: mod.status || (mod.isPublished ? "PUBLISHED" : "DRAFT"),
    version: mod.version || 1,
    isPublished: mod.isPublished,
    is_published: mod.isPublished,
    quizCount,
    quiz_count: quizCount,
    completedUsersCount,
    attemptsCount,
    lessons: Array.isArray(mod.lessons) ? mod.lessons : [],
    createdAt: mod.createdAt,
    created_at: mod.createdAt,
    updatedAt: mod.updatedAt,
    updated_at: mod.updatedAt,
  };
};

/**
 * Format entitas QuizQuestion (menyertakan camelCase & snake_case alias).
 */
export const formatQuizResponse = (quiz) => ({
  id: quiz.id,
  moduleId: quiz.moduleId,
  module_id: quiz.moduleId,
  questionText: quiz.questionText,
  question_text: quiz.questionText,
  optionA: quiz.optionA,
  option_a: quiz.optionA,
  optionB: quiz.optionB,
  option_b: quiz.optionB,
  optionC: quiz.optionC,
  option_c: quiz.optionC,
  optionD: quiz.optionD,
  option_d: quiz.optionD,
  correctKey: quiz.correctKey,
  correct_key: quiz.correctKey,
  explanationText: quiz.explanationText,
  explanation_text: quiz.explanationText,
  indicatorConcept: quiz.indicatorConcept,
  indicator_concept: quiz.indicatorConcept,
  createdAt: quiz.createdAt,
  created_at: quiz.createdAt,
  updatedAt: quiz.updatedAt,
  updated_at: quiz.updatedAt,
});

/**
 * Hitung ringkasan metrik kurikulum & kuis untuk kartu KPI Dashboard Admin.
 */
export const getCurriculumStats = async () => {
  const [allModules, totalQuizQuestions, totalInvestors, totalCourses, totalLessons] =
    await Promise.all([
      prisma.learningModule.findMany({
        select: {
          level: true,
          isPublished: true,
          estimatedMinutes: true,
          _count: { select: { quizQuestions: true } },
        },
      }),
      prisma.quizQuestion.count(),
      prisma.user.count({ where: { role: "INVESTOR" } }),
      prisma.learningCourse.count(),
      prisma.learningLesson.count(),
    ]);

  const stats = {
    totalCourses,
    totalModules: allModules.length,
    totalLessons,
    publishedModules: 0,
    draftModules: 0,
    totalEstimatedMinutes: 0,
    totalQuizQuestions,
    totalInvestors,
    modulesByLevel: {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0,
    },
    questionsByLevel: {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0,
    },
  };

  for (const mod of allModules) {
    if (mod.isPublished) stats.publishedModules += 1;
    else stats.draftModules += 1;

    stats.totalEstimatedMinutes += mod.estimatedMinutes || 0;
    if (stats.modulesByLevel[mod.level] !== undefined) {
      stats.modulesByLevel[mod.level] += 1;
      stats.questionsByLevel[mod.level] += mod._count.quizQuestions;
    }
  }

  return stats;
};

/**
 * Ambil daftar seluruh modul pembelajaran (beserta jumlah soal kuis & statistik kurikulum).
 */
export const listModules = async ({ level, status, search } = {}) => {
  await ensureCmsHierarchyInitialized();

  const where = {};

  if (level) {
    where.level = level;
  }

  if (status === "published") {
    where.isPublished = true;
  } else if (status === "draft") {
    where.isPublished = false;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  const [modules, stats] = await Promise.all([
    prisma.learningModule.findMany({
      where,
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            quizQuestions: true,
            learningProgresses: { where: { isCompleted: true } },
            quizAttempts: true,
          },
        },
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
    }),
    getCurriculumStats(),
  ]);

  modules.sort((a, b) => {
    const levelDiff = (LEVEL_SORT_ORDER[a.level] || 99) - (LEVEL_SORT_ORDER[b.level] || 99);
    if (levelDiff !== 0) return levelDiff;
    if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    modules: modules.map(formatModuleResponse),
    stats,
  };
};

/**
 * Tambah modul pembelajaran baru (POST /api/admin/modules)
 * Otomatis membuatkan LearningLesson terstruktur dan menghubungkan ke LearningCourse sesuai level.
 */
export const createModule = async (payload) => {
  await ensureCmsHierarchyInitialized();

  const title = sanitizeText(payload.title);
  const summary = payload.summary ? sanitizeText(payload.summary) : null;
  const contentBlocks = normalizeContentBlocks(payload.contentBlocks, payload.contentBody);
  const contentBody =
    blocksToMarkdown(contentBlocks) || sanitizeText(payload.contentBody || title);

  const rawSlug =
    payload.slug && payload.slug.trim() ? payload.slug.trim().toLowerCase() : slugify(title);
  if (!rawSlug || !SLUG_REGEX.test(rawSlug)) {
    throw new ValidationError("Slug modul tidak valid", [
      {
        field: "slug",
        message: "Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-)",
      },
    ]);
  }

  const existingSlug = await prisma.learningModule.findUnique({
    where: { slug: rawSlug },
    select: { id: true },
  });

  if (existingSlug) {
    throw new ConflictError(
      "Slug modul sudah digunakan oleh materi lain. Gunakan judul atau slug berbeda.",
      [{ field: "slug", message: `Slug "${rawSlug}" sudah terdaftar` }]
    );
  }

  // Cari course yang sesuai dengan level
  const course = payload.courseId
    ? await prisma.learningCourse.findUnique({ where: { id: payload.courseId } })
    : await prisma.learningCourse.findFirst({ where: { learningLevel: payload.level } });

  let orderIndex = payload.orderIndex;
  if (orderIndex === undefined || orderIndex === null) {
    const maxOrder = await prisma.learningModule.aggregate({
      where: { level: payload.level },
      _max: { orderIndex: true },
    });
    orderIndex = (maxOrder._max.orderIndex || 0) + 1;
  }

  const isPublished = payload.isPublished ?? true;
  const status = isPublished ? "PUBLISHED" : "DRAFT";
  const learningObjectives = Array.isArray(payload.learningObjectives)
    ? payload.learningObjectives.map((o) => sanitizeText(String(o))).filter(Boolean)
    : [];
  const keywords = Array.isArray(payload.keywords)
    ? payload.keywords.map((k) => sanitizeText(String(k))).filter(Boolean)
    : [];
  const references = Array.isArray(payload.references) ? payload.references : [];

  const plainTextContent = extractStructuredPlainText({
    courseTitle: course?.title || "Kurikulum InvestPedia",
    moduleTitle: title,
    lessonTitle: title,
    difficultyLevel: payload.level,
    summary: summary || "",
    learningObjectives,
    keywords,
    references,
    contentBlocks,
  });

  const created = await prisma.learningModule.create({
    data: {
      courseId: course?.id || null,
      submoduleTitle: payload.submoduleTitle
        ? sanitizeText(payload.submoduleTitle)
        : "Materi Utama",
      title,
      slug: rawSlug,
      level: payload.level,
      summary,
      contentBody,
      contentBlocks,
      plainTextContent,
      learningObjectives,
      keywords,
      tags: keywords,
      references,
      estimatedMinutes: payload.estimatedMinutes ?? 5,
      orderIndex,
      status,
      version: 1,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
    include: {
      _count: {
        select: {
          quizQuestions: true,
          learningProgresses: true,
          quizAttempts: true,
        },
      },
    },
  });

  // Buat Lesson pertama di dalam modul tersebut
  let lessonSlug = rawSlug;
  const existingLessonSlug = await prisma.learningLesson.findUnique({
    where: { slug: lessonSlug },
  });
  if (existingLessonSlug) {
    lessonSlug = `${rawSlug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const createdLesson = await prisma.learningLesson.create({
    data: {
      moduleId: created.id,
      submoduleTitle: created.submoduleTitle,
      title,
      slug: lessonSlug,
      summary: summary || "",
      learningObjectives,
      estimatedDuration: created.estimatedMinutes,
      keywords,
      tags: keywords,
      difficultyLevel: created.level,
      contentBlocks,
      contentBody,
      plainTextContent,
      references,
      status,
      version: 1,
      orderIndex: 1,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  const chunks = buildLessonContentChunks({
    courseId: course?.id || null,
    courseTitle: course?.title || "",
    moduleId: created.id,
    moduleTitle: created.title,
    lessonId: createdLesson.id,
    lessonTitle: createdLesson.title,
    lessonSlug: createdLesson.slug,
    keywords,
    references,
    version: 1,
    status,
    contentBlocks,
  });

  await Promise.all([
    prisma.learningLesson.update({
      where: { id: createdLesson.id },
      data: { contentChunks: chunks },
    }),
    prisma.learningModule.update({
      where: { id: created.id },
      data: { contentChunks: chunks },
    }),
    prisma.learningLessonRevision.create({
      data: {
        lessonId: createdLesson.id,
        version: 1,
        title: createdLesson.title,
        summary: createdLesson.summary,
        contentBlocks,
        plainTextContent,
        changeSummary: "Pembuatan modul & materi baru",
        status,
      },
    }),
  ]);

  return formatModuleResponse({
    ...created,
    lessons: [{ ...createdLesson, contentChunks: chunks }],
  });
};

/**
 * Perbarui modul pembelajaran (PUT /api/admin/modules/:id)
 * Sekaligus menyinkronkan Lesson utama dan regenerasi plainTextContent + contentChunks.
 */
export const updateModule = async (id, payload) => {
  await ensureCmsHierarchyInitialized();

  const existing = await prisma.learningModule.findUnique({
    where: { id },
    include: {
      course: true,
      lessons: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!existing) {
    throw new NotFoundError("Modul pembelajaran tidak ditemukan.");
  }

  const updateData = {};

  if (payload.title !== undefined) {
    updateData.title = sanitizeText(payload.title);
  }

  if (payload.slug !== undefined) {
    const candidateSlug =
      payload.slug.trim() !== ""
        ? payload.slug.trim().toLowerCase()
        : slugify(updateData.title || existing.title);

    if (!candidateSlug || !SLUG_REGEX.test(candidateSlug)) {
      throw new ValidationError("Slug modul tidak valid", [
        {
          field: "slug",
          message: "Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-)",
        },
      ]);
    }

    if (candidateSlug !== existing.slug) {
      const duplicate = await prisma.learningModule.findUnique({
        where: { slug: candidateSlug },
        select: { id: true },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError("Slug modul sudah digunakan oleh materi lain.", [
          { field: "slug", message: `Slug "${candidateSlug}" sudah terdaftar` },
        ]);
      }
    }

    updateData.slug = candidateSlug;
  }

  if (payload.level !== undefined) {
    updateData.level = payload.level;
    const targetCourse = await prisma.learningCourse.findFirst({
      where: { learningLevel: payload.level },
    });
    if (targetCourse) updateData.courseId = targetCourse.id;
  }

  if (payload.summary !== undefined) {
    updateData.summary = payload.summary ? sanitizeText(payload.summary) : null;
  }

  if (payload.contentBlocks !== undefined || payload.contentBody !== undefined) {
    const nextBlocks = normalizeContentBlocks(payload.contentBlocks, payload.contentBody);
    const nextBody =
      blocksToMarkdown(nextBlocks) ||
      (payload.contentBody ? sanitizeText(payload.contentBody) : existing.contentBody);
    updateData.contentBlocks = nextBlocks;
    updateData.contentBody = nextBody;
  }

  if (payload.learningObjectives !== undefined && Array.isArray(payload.learningObjectives)) {
    updateData.learningObjectives = payload.learningObjectives
      .map((o) => sanitizeText(String(o)))
      .filter(Boolean);
  }

  if (payload.keywords !== undefined && Array.isArray(payload.keywords)) {
    updateData.keywords = payload.keywords
      .map((k) => sanitizeText(String(k)))
      .filter(Boolean);
    updateData.tags = updateData.keywords;
  }

  if (payload.references !== undefined && Array.isArray(payload.references)) {
    updateData.references = payload.references;
  }

  if (payload.estimatedMinutes !== undefined) {
    updateData.estimatedMinutes = payload.estimatedMinutes;
  }

  if (payload.orderIndex !== undefined) {
    updateData.orderIndex = payload.orderIndex;
  }

  if (payload.isPublished !== undefined) {
    updateData.isPublished = payload.isPublished;
    updateData.status = payload.isPublished ? "PUBLISHED" : "DRAFT";
    if (payload.isPublished && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  const nextVersion = (existing.version || 1) + 1;
  updateData.version = nextVersion;

  const finalTitle = updateData.title || existing.title;
  const finalLevel = updateData.level || existing.level;
  const finalSummary =
    updateData.summary !== undefined ? updateData.summary || "" : existing.summary || "";
  const finalBlocks =
    updateData.contentBlocks ||
    existing.contentBlocks ||
    parseMarkdownToBlocks(updateData.contentBody || existing.contentBody);
  const finalObjectives = updateData.learningObjectives || existing.learningObjectives || [];
  const finalKeywords = updateData.keywords || existing.keywords || [];
  const finalRefs = updateData.references || existing.references || [];
  const finalStatus =
    updateData.status || existing.status || (existing.isPublished ? "PUBLISHED" : "DRAFT");

  const plainTextContent = extractStructuredPlainText({
    courseTitle: existing.course?.title || "Kurikulum InvestPedia",
    moduleTitle: finalTitle,
    lessonTitle: finalTitle,
    difficultyLevel: finalLevel,
    summary: finalSummary,
    learningObjectives: finalObjectives,
    keywords: finalKeywords,
    references: finalRefs,
    contentBlocks: finalBlocks,
  });

  const primaryLesson = existing.lessons?.[0];
  const contentChunks = buildLessonContentChunks({
    courseId: updateData.courseId || existing.courseId || null,
    courseTitle: existing.course?.title || "",
    moduleId: existing.id,
    moduleTitle: finalTitle,
    lessonId: primaryLesson?.id || existing.id,
    lessonTitle: finalTitle,
    lessonSlug: updateData.slug || existing.slug,
    keywords: finalKeywords,
    references: finalRefs,
    version: nextVersion,
    status: finalStatus,
    contentBlocks: finalBlocks,
  });

  updateData.plainTextContent = plainTextContent;
  updateData.contentChunks = contentChunks;

  const updated = await prisma.learningModule.update({
    where: { id },
    data: updateData,
    include: {
      lessons: { orderBy: { orderIndex: "asc" } },
      _count: {
        select: {
          quizQuestions: true,
          learningProgresses: { where: { isCompleted: true } },
          quizAttempts: true,
        },
      },
    },
  });

  // Sinkronkan juga ke Lesson utama di modul ini
  if (primaryLesson) {
    await prisma.learningLesson.update({
      where: { id: primaryLesson.id },
      data: {
        title: finalTitle,
        summary: finalSummary,
        estimatedDuration: updated.estimatedMinutes,
        difficultyLevel: finalLevel,
        learningObjectives: finalObjectives,
        keywords: finalKeywords,
        tags: finalKeywords,
        references: finalRefs,
        contentBlocks: finalBlocks,
        contentBody: updated.contentBody,
        plainTextContent,
        contentChunks,
        status: finalStatus,
        version: nextVersion,
      },
    });
  }

  return formatModuleResponse(updated);
};

/**
 * Hapus modul pembelajaran beserta soal kuis terkait (DELETE /api/admin/modules/:id)
 */
export const deleteModule = async (id) => {
  const existing = await prisma.learningModule.findUnique({
    where: { id },
    include: {
      _count: { select: { quizQuestions: true } },
    },
  });

  if (!existing) {
    throw new NotFoundError("Modul pembelajaran tidak ditemukan.");
  }

  await prisma.learningModule.delete({
    where: { id },
  });

  return {
    id: existing.id,
    title: existing.title,
    slug: existing.slug,
    deletedQuizCount: existing._count.quizQuestions,
  };
};

/**
 * Ambil seluruh soal kuis pada suatu modul (GET /api/admin/modules/:id/quizzes)
 */
export const listQuizzesByModule = async (moduleId) => {
  const mod = await prisma.learningModule.findUnique({
    where: { id: moduleId },
    include: {
      _count: {
        select: {
          quizQuestions: true,
          learningProgresses: { where: { isCompleted: true } },
          quizAttempts: true,
        },
      },
    },
  });

  if (!mod) {
    throw new NotFoundError("Modul pembelajaran tidak ditemukan.");
  }

  const quizzes = await prisma.quizQuestion.findMany({
    where: { moduleId },
    orderBy: { createdAt: "asc" },
  });

  return {
    module: formatModuleResponse(mod),
    quizzes: quizzes.map(formatQuizResponse),
    total: quizzes.length,
  };
};

/**
 * Tambah butir soal kuis baru pada modul (POST /api/admin/quizzes)
 */
export const createQuiz = async (payload) => {
  const mod = await prisma.learningModule.findUnique({
    where: { id: payload.moduleId },
    select: { id: true, title: true, slug: true },
  });

  if (!mod) {
    throw new NotFoundError("Modul pembelajaran tujuan tidak ditemukan.");
  }

  const created = await prisma.quizQuestion.create({
    data: {
      moduleId: payload.moduleId,
      questionText: sanitizeText(payload.questionText),
      optionA: sanitizeText(payload.optionA),
      optionB: sanitizeText(payload.optionB),
      optionC: sanitizeText(payload.optionC),
      optionD: sanitizeText(payload.optionD),
      correctKey: payload.correctKey,
      explanationText: sanitizeText(payload.explanationText),
      indicatorConcept: sanitizeText(payload.indicatorConcept),
    },
  });

  return formatQuizResponse(created);
};

/**
 * Perbarui butir soal kuis (PUT /api/admin/quizzes/:id)
 */
export const updateQuiz = async (id, payload) => {
  const existing = await prisma.quizQuestion.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError("Butir soal kuis tidak ditemukan.");
  }

  const updateData = {};

  if (payload.moduleId !== undefined && payload.moduleId !== existing.moduleId) {
    const targetModule = await prisma.learningModule.findUnique({
      where: { id: payload.moduleId },
      select: { id: true },
    });
    if (!targetModule) {
      throw new NotFoundError("Modul pembelajaran tujuan tidak ditemukan.");
    }
    updateData.moduleId = payload.moduleId;
  }

  if (payload.questionText !== undefined) {
    updateData.questionText = sanitizeText(payload.questionText);
  }
  if (payload.optionA !== undefined) {
    updateData.optionA = sanitizeText(payload.optionA);
  }
  if (payload.optionB !== undefined) {
    updateData.optionB = sanitizeText(payload.optionB);
  }
  if (payload.optionC !== undefined) {
    updateData.optionC = sanitizeText(payload.optionC);
  }
  if (payload.optionD !== undefined) {
    updateData.optionD = sanitizeText(payload.optionD);
  }
  if (payload.correctKey !== undefined) {
    updateData.correctKey = payload.correctKey;
  }
  if (payload.explanationText !== undefined) {
    updateData.explanationText = sanitizeText(payload.explanationText);
  }
  if (payload.indicatorConcept !== undefined) {
    updateData.indicatorConcept = sanitizeText(payload.indicatorConcept);
  }

  const updated = await prisma.quizQuestion.update({
    where: { id },
    data: updateData,
  });

  return formatQuizResponse(updated);
};

/**
 * Hapus butir soal kuis (DELETE /api/admin/quizzes/:id)
 */
export const deleteQuiz = async (id) => {
  const existing = await prisma.quizQuestion.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError("Butir soal kuis tidak ditemukan.");
  }

  await prisma.quizQuestion.delete({
    where: { id },
  });

  return {
    id: existing.id,
    moduleId: existing.moduleId,
    questionText: existing.questionText,
  };
};
