import { Router } from "express";
import { register, login, getProfile, updateProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (requires Bearer JWT)
router.get("/me", authenticateToken, getProfile);
router.patch("/me", authenticateToken, updateProfile);

export default router;
