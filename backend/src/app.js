import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import swaggerRoutes from "./routes/swaggerRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";

const app = express();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Silence Chrome DevTools probe
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).end();
});

// Root Landing Page (User-friendly API status page)
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InvestPedia Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0e17; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #141824; border: 1px solid #1e2436; border-radius: 16px; padding: 32px; max-width: 560px; width: 100%; }
          .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 6px; background: rgba(16, 185, 129, 0.12); color: #34d399; font-size: 12px; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.25); }
          h1 { font-size: 22px; margin: 16px 0 8px; font-weight: 700; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
          .btn-row { display: flex; gap: 10px; margin-bottom: 20px; }
          .btn-primary { flex: 1; text-align: center; background: #e3252f; color: #fff; text-decoration: none; padding: 11px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; }
          .btn-secondary { flex: 1; text-align: center; background: #1e293b; color: #f1f5f9; text-decoration: none; padding: 11px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; border: 1px solid #334155; }
          .list { border-top: 1px solid #1e2436; padding-top: 16px; }
          .list-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 10px; }
          .endpoint { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: #0f131d; border-radius: 8px; font-size: 12px; margin-bottom: 6px; font-family: monospace; border: 1px solid #1e2436; }
          .endpoint a { color: #93c5fd; text-decoration: none; }
          .method { color: #34d399; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Backend API Aktif</div>
          <h1>InvestPedia Backend Server</h1>
          <p>Server API untuk Manajemen Konten Pembelajaran (CMS), Pengalaman Belajar Pengguna, Analisis Saham IDX80, dan AI Investment Tutor.</p>
          <div class="btn-row">
            <a href="http://localhost:5173/" class="btn-primary">Buka Aplikasi Web (5173) &rarr;</a>
            <a href="/api/docs" class="btn-secondary">Swagger API Docs</a>
          </div>
          <div class="list">
            <div class="list-title">Endpoint Utama:</div>
            <div class="endpoint"><span><span class="method">GET</span> /api/learning/courses</span> <a href="/api/learning/courses" target="_blank">Katalog Belajar</a></div>
            <div class="endpoint"><span><span class="method">GET</span> /api/ai/knowledge/search</span> <a href="/api/ai/knowledge/search" target="_blank">LLM Knowledge</a></div>
            <div class="endpoint"><span><span class="method">GET</span> /api/docs</span> <a href="/api/docs" target="_blank">Swagger UI</a></div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).json({
    service: "InvestPedia Backend API",
    status: "online",
    frontend_url: "http://localhost:5173",
    docs_url: "http://localhost:5000/api/docs",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "InvestPedia Learning CMS & Fundamental Investment Analyzer API",
    runtime: "Node.js (JavaScript ES6+)",
    version: "2.0.0",
  });
});

// Routes
app.use("/api", swaggerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/news", newsRoutes);

export default app;
