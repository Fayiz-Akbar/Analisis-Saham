import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_USER_STORAGE_KEY,
  authApi,
  clearStoredSession,
  getStoredToken,
  setStoredSession,
} from "../services/apiClient";

const AuthContext = createContext(null);

const getInitialCachedUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getInitialCachedUser());
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));
  const [authModalMode, setAuthModalMode] = useState(null); // "login" | "register" | null

  // Sinkronisasi sesi dari token tersimpan saat aplikasi dimuat
  useEffect(() => {
    let isMounted = true;
    const savedToken = getStoredToken();

    if (!savedToken) {
      setIsLoading(false);
      return undefined;
    }

    async function verifySession() {
      try {
        setIsLoading(true);
        const res = await authApi.getMe(savedToken);
        if (isMounted && res?.data?.user) {
          setUser(res.data.user);
          setToken(savedToken);
          setStoredSession(savedToken, res.data.user);
        }
      } catch (err) {
        if (isMounted) {
          clearStoredSession();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const applySession = useCallback((nextToken, nextUser) => {
    setStoredSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authApi.login({ email, password });
      const { token: newToken, user: loggedUser } = res.data;
      applySession(newToken, loggedUser);
      return loggedUser;
    },
    [applySession]
  );

  const register = useCallback(
    async ({ name, email, password, investorProfile }) => {
      const res = await authApi.register({ name, email, password, investorProfile });
      const { token: newToken, user: registeredUser } = res.data;
      applySession(newToken, registeredUser);
      return registeredUser;
    },
    [applySession]
  );

  const loginAdmin = useCallback(
    async ({ email, password }) => {
      const res = await authApi.adminLogin({ email, password });
      const { token: newToken, user: adminUser } = res.data;
      applySession(newToken, adminUser);
      return adminUser;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      loginAdmin,
      logout,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    }),
    [user, token, isLoading, login, register, loginAdmin, logout, authModalMode, openAuthModal, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return ctx;
}

