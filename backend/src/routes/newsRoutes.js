import { Router } from "express";
import { getLatestNews } from "../controllers/newsController.js";

const router = Router();

// GET /api/news/latest
router.get("/latest", getLatestNews);

// GET /api/news
router.get("/", getLatestNews);

export default router;
