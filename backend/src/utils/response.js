/**
 * Standard API Response Envelope Helpers
 */

export const sendSuccess = (res, statusCode = 200, message = "Success", data = null, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      ...extra.meta,
    },
    ...(extra.pagination ? { pagination: extra.pagination } : {}),
  });
};

export const sendError = (res, statusCode = 500, message = "Internal Server Error", error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error ? { error } : {}),
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
};
