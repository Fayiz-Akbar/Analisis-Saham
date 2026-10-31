import { Router } from "express";
import {
  createModule,
  createQuiz,
  deleteModule,
  deleteQuiz,
  getModuleQuizzes,
  getModules,
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

export default router;

