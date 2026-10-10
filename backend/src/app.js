import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

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

export default app;
