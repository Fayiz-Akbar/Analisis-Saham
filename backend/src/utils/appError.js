/**
 * Custom Application Error Classes
 * Dipakai oleh service layer agar controller dapat memetakan error
 * ke status HTTP + kode error standar (lihat context/02-development/api.md).
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validasi data gagal", details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Data sudah ada", details = null) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

/**
 * Konversi hasil ZodError menjadi array detail { field, message } yang ramah frontend.
 */
export const formatZodIssues = (zodError) =>
  zodError.issues.map((issue) => ({
    field: issue.path.join(".") || "_root",
    message: issue.message,
  }));

