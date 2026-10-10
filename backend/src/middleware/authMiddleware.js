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
