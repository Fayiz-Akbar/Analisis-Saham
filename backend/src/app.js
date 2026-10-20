import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
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
      // Izinkan seluruh request dari localhost di port berapapun (5173, 5174, dll.)
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
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
        <title>InvestAI Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0e17; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #141824; border: 1px solid #1e2436; border-radius: 20px; padding: 32px; max-width: 540px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3); }
          .badge-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
          h1 { font-size: 24px; margin: 16px 0 8px; font-weight: 800; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
          .btn-primary { display: block; text-align: center; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-bottom: 20px; transition: background 0.2s; }
          .btn-primary:hover { background: #4f46e5; }
          .list { border-top: 1px solid #1e2436; padding-top: 20px; }
          .list-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 12px; }
          .endpoint { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #0f131d; border-radius: 10px; font-size: 13px; margin-bottom: 8px; font-family: monospace; border: 1px solid #1e2436; }
          .endpoint a { color: #818cf8; text-decoration: none; }
          .endpoint a:hover { text-decoration: underline; }
          .method { color: #10b981; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge"><span class="badge-dot"></span> Backend API Berjalan Normal</div>
          <h1>InvestAI Backend Server</h1>
          <p>Port ini (<strong>5000</strong>) adalah server API backend. Untuk menggunakan antarmuka web visual pengguna, silakan buka aplikasi frontend pada port <strong>5173</strong>.</p>
          <a href="http://localhost:5173/" class="btn-primary">Buka Aplikasi Web (Frontend Port 5173) &rarr;</a>
          <div class="list">
            <div class="list-title">Endpoint API Aktif:</div>
            <div class="endpoint"><span><span class="method">GET</span> /api/news/latest</span> <a href="/api/news/latest" target="_blank">Lihat Berita</a></div>
            <div class="endpoint"><span><span class="method">GET</span> /api/stocks</span> <a href="/api/stocks" target="_blank">Daftar Saham</a></div>
            <div class="endpoint"><span><span class="method">GET</span> /api/health</span> <a href="/api/health" target="_blank">Health Check</a></div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).json({
    service: "InvestAI Backend API",
    status: "online",
    frontend_url: "http://localhost:5173",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      news: "/api/news/latest",
      stocks: "/api/stocks",
    },
  });
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "AI-Powered Fundamental Investment Analyzer API",
    runtime: "Node.js (JavaScript ES6+)",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/news", newsRoutes);

export default app;
