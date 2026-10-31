import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fayiz_investment_analyzer_2026_skripsi";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Sesi Administrator dibuat lebih singkat untuk meminimalkan risiko penyalahgunaan token (KNF-01)
const getAdminJwtExpiresIn = () => process.env.JWT_ADMIN_EXPIRES_IN || "8h";

// Zod Schemas
const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  // BR-AUTH-002: minimal 8 karakter, mengandung setidaknya 1 huruf dan 1 angka
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .regex(/[A-Za-z]/, "Password wajib mengandung minimal 1 huruf")
    .regex(/[0-9]/, "Password wajib mengandung minimal 1 angka"),
  investorProfile: z.enum(["BEGINNER", "EXPERIENCED"]).optional().default("BEGINNER"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  investorProfile: z.enum(["BEGINNER", "EXPERIENCED"]).optional(),
});

// Payload profil publik yang aman dikirim ke client (tanpa password hash)
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  investorProfile: user.investorProfile,
  createdAt: user.createdAt,
});

const signToken = (user, expiresIn = JWT_EXPIRES_IN) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, investorProfile: user.investorProfile },
    JWT_SECRET,
    { expiresIn }
  );

/**
 * Verifikasi kredensial email + password.
 * Mengembalikan user jika valid, atau null jika email/password salah
 * (pesan kegagalan sengaja disamakan agar tidak membocorkan keberadaan email).
 */
const verifyCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  return isPasswordValid ? user : null;
};

/**
 * Register Controller
 * POST /api/auth/register
 * Catatan RBAC: registrasi publik SELALU menghasilkan role INVESTOR.
 * Field "role" pada body request diabaikan (di-strip oleh Zod).
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
        role: "INVESTOR",
        investorProfile,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        investorProfile: true,
        createdAt: true,
      },
    });

    // Terbitkan JWT token
    const token = signToken(newUser);

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

    const user = await verifyCredentials(email, password);
    if (!user) {
      return sendError(res, 401, "Kredensial tidak valid. Email atau password salah.");
    }

    // Terbitkan JWT token
    const token = signToken(user);

    return sendSuccess(res, 200, "Login berhasil.", {
      user: toPublicUser(user),
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return sendError(res, 500, "Terjadi kesalahan internal saat proses login.");
  }
};

/**
 * Admin Login Controller (RBAC Gate Portal Administrator)
 * POST /api/auth/admin/login
 * - 400: format input tidak valid
 * - 401: email / password salah
 * - 403: kredensial benar tetapi akun bukan ADMIN
 */
export const adminLogin = async (req, res) => {
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

    const user = await verifyCredentials(email, password);
    if (!user) {
      return sendError(res, 401, "Kredensial tidak valid. Email atau password salah.");
    }

    if (user.role !== "ADMIN") {
      return sendError(
        res,
        403,
        "Akun ini tidak memiliki hak akses Administrator. Silakan gunakan halaman login Investor."
      );
    }

    const expiresIn = getAdminJwtExpiresIn();
    const token = signToken(user, expiresIn);

    return sendSuccess(res, 200, "Login Administrator berhasil.", {
      user: toPublicUser(user),
      token,
      expiresIn,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return sendError(res, 500, "Terjadi kesalahan internal saat proses login Administrator.");
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
        role: true,
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
