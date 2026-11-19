import { Router } from "express";
import {
  createCmsCourse,
  createCmsLesson,
  createModule,
  createQuiz,
  deleteCmsCourse,
  deleteCmsLesson,
  deleteModule,
  deleteQuiz,
  duplicateCmsLesson,
  getCmsLessonDetail,
  getCmsTree,
  getModuleQuizzes,
  getModules,
  reorderCms,
  restoreCmsLessonRevision,
  updateCmsCourse,
  updateCmsLesson,
  updateModule,
  updateQuiz,
} from "../controllers/adminController.js";
import { authenticateToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Seluruh endpoint /api/admin/* wajib melalui verifikasi JWT + Role ADMIN (RBAC - KF-01, KNF-01)
router.use(authenticateToken, verifyAdmin);

// Manajemen Modul Pembelajaran (PB-12)
router.get("/modules", getModules);
router.post("/modules", createModule);
router.put("/modules/:id", updateModule);
router.delete("/modules/:id", deleteModule);

// Manajemen Bank Soal Kuis Evaluasi (PB-13)
router.get("/modules/:id/quizzes", getModuleQuizzes);
router.post("/quizzes", createQuiz);
router.put("/quizzes/:id", updateQuiz);
router.delete("/quizzes/:id", deleteQuiz);

// Learning Content Studio (CMS Hierarchy, Visual Block Editor, Versioning & Reorder)
router.get("/cms/tree", getCmsTree);
router.post("/cms/courses", createCmsCourse);
router.put("/cms/courses/:id", updateCmsCourse);
router.delete("/cms/courses/:id", deleteCmsCourse);

router.get("/cms/lessons/:id", getCmsLessonDetail);
router.post("/cms/lessons", createCmsLesson);
router.put("/cms/lessons/:id", updateCmsLesson);
router.post("/cms/lessons/:id/duplicate", duplicateCmsLesson);
router.delete("/cms/lessons/:id", deleteCmsLesson);
router.post("/cms/lessons/:id/revisions/:revisionId/restore", restoreCmsLessonRevision);
router.patch("/cms/reorder", reorderCms);

export default router;
