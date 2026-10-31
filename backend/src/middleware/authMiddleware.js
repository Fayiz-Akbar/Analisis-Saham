import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { sendError } from "../utils/response.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Akses ditolak. Token otorisasi tidak ditemukan.");
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dev_secret_fayiz_investment_analyzer_2026_skripsi";

    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        investorProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 401, "Sesi pengguna tidak valid atau akun tidak ditemukan.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Masa berlaku token otorisasi telah berakhir. Silakan login kembali.");
    }
    return sendError(res, 401, "Token otorisasi tidak valid.");
  }
};

/**
 * Middleware Otorisasi Role Administrator (RBAC - KF-01, KNF-01)
 * Wajib dipasang SETELAH authenticateToken. Peran dibaca dari basis data
 * (req.user hasil query), bukan dari klaim token, sehingga pencabutan hak
 * akses Administrator langsung berlaku tanpa menunggu token kedaluwarsa.
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, "Akses ditolak. Silakan login terlebih dahulu.", { code: "UNAUTHORIZED" });
  }

  if (req.user.role !== "ADMIN") {
    return sendError(res, 403, "Akses ditolak. Halaman ini khusus untuk Administrator.", { code: "FORBIDDEN" });
  }

  next();
};
