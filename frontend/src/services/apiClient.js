/**
 * Centralized API Client untuk komunikasi Frontend <-> Backend Express API
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const AUTH_TOKEN_STORAGE_KEY = "investai_auth_token";
export const AUTH_USER_STORAGE_KEY = "investai_auth_user";

export const getStoredToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredSession = (token, user) => {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    if (user) localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn("Gagal menyimpan sesi ke localStorage:", err);
  }
};

export const clearStoredSession = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch (err) {
    console.warn("Gagal menghapus sesi dari localStorage:", err);
  }
};

/**
 * Helper fetch standar yang otomatis menyertakan header Authorization Bearer JWT
 * dan mengekstrak pesan error terstruktur dari backend.
 */
export async function apiRequest(path, { method = "GET", body, headers = {}, token } = {}) {
  const activeToken = token !== undefined ? token : getStoredToken();

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (activeToken) {
    requestHeaders.Authorization = `Bearer ${activeToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || (payload && payload.success === false)) {
    const err = new Error(payload?.message || `Permintaan gagal (${response.status})`);
    err.status = response.status;
    err.code = payload?.error?.code || null;
    err.details = Array.isArray(payload?.error)
      ? payload.error
      : Array.isArray(payload?.error?.details)
        ? payload.error.details
        : [];
    err.payload = payload;
    throw err;
  }

  return payload;
}

// ==========================================
// AUTHENTICATION API (Investor & Admin RBAC)
// ==========================================

export const authApi = {
  register: (data) => apiRequest("/auth/register", { method: "POST", body: data }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data }),
  adminLogin: (data) => apiRequest("/auth/admin/login", { method: "POST", body: data }),
  getMe: (token) => apiRequest("/auth/me", { method: "GET", token }),
  updateProfile: (data) => apiRequest("/auth/me", { method: "PATCH", body: data }),
};

// ==========================================
// ADMIN PORTAL API (Modul & Kuis Evaluasi)
// ==========================================

export const adminApi = {
  getModules: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.level && params.level !== "ALL") searchParams.set("level", params.level);
    if (params.status && params.status !== "ALL") searchParams.set("status", params.status);
    if (params.search && params.search.trim()) searchParams.set("search", params.search.trim());
    const qs = searchParams.toString();
    return apiRequest(`/admin/modules${qs ? `?${qs}` : ""}`);
  },
  createModule: (data) => apiRequest("/admin/modules", { method: "POST", body: data }),
  updateModule: (id, data) => apiRequest(`/admin/modules/${id}`, { method: "PUT", body: data }),
  deleteModule: (id) => apiRequest(`/admin/modules/${id}`, { method: "DELETE" }),

  getModuleQuizzes: (moduleId) => apiRequest(`/admin/modules/${moduleId}/quizzes`),
  createQuiz: (data) => apiRequest("/admin/quizzes", { method: "POST", body: data }),
  updateQuiz: (id, data) => apiRequest(`/admin/quizzes/${id}`, { method: "PUT", body: data }),
  deleteQuiz: (id) => apiRequest(`/admin/quizzes/${id}`, { method: "DELETE" }),
};

