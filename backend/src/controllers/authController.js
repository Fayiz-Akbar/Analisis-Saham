import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fayiz_investment_analyzer_2026_skripsi";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Zod Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  investorProfile: z.enum(["BEGINNER", "EXPERIENCED"]).optional().default("BEGINNER"),
});

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  investorProfile: z.enum(["BEGINNER", "EXPERIENCED"]).optional(),
});

/**
 * Register Controller
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        "Validasi data gagal",
        parseResult.error.errors.map((err) => ({ field: err.path.join("."), message: err.message }))
      );
    }

    const { name, email, password, investorProfile } = parseResult.data;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 409, "Alamat email sudah terdaftar dalam sistem.");
    }

    // Hash password menggunakan bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Simpan user baru ke database PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        investorProfile,
      },
      select: {
        id: true,
        name: true,
        email: true,
        investorProfile: true,
        createdAt: true,
      },
    });

    // Terbitkan JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, investorProfile: newUser.investorProfile },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return sendSuccess(res, 201, "Registrasi akun berhasil.", {
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return sendError(res, 500, "Terjadi kesalahan internal saat mendaftarkan akun.");
  }
};

/**
 * Login Controller
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        "Validasi data gagal",
        parseResult.error.errors.map((err) => ({ field: err.path.join("."), message: err.message }))
      );
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 401, "Kredensial tidak valid. Email atau password salah.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendError(res, 401, "Kredensial tidak valid. Email atau password salah.");
    }

    // Terbitkan JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, investorProfile: user.investorProfile },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return sendSuccess(res, 200, "Login berhasil.", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        investorProfile: user.investorProfile,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return sendError(res, 500, "Terjadi kesalahan internal saat proses login.");
  }
};

/**
 * Get Me / Current Profile
 * GET /api/auth/me
 */
export const getProfile = async (req, res) => {
  return sendSuccess(res, 200, "Data profil pengguna berhasil dimuat.", {
    user: req.user,
  });
};

/**
 * Update Profile (nama & investorProfile toggle)
 * PATCH /api/auth/me
 */
export const updateProfile = async (req, res) => {
  try {
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        "Validasi update profil gagal",
        parseResult.error.errors.map((err) => ({ field: err.path.join("."), message: err.message }))
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: parseResult.data,
      select: {
        id: true,
        name: true,
        email: true,
        investorProfile: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, 200, "Profil pengguna berhasil diperbarui.", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return sendError(res, 500, "Gagal memperbarui profil pengguna.");
  }
};
