"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError, apiFetch, clearToken, getToken, setToken } from "./api";
import { AuthResponse, MeResponse, type User } from "./schemas";

export type { User };

const LOCALE_COOKIE = "NEXT_LOCALE";

function writeLocaleCookie(locale: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/auth/me", {}, MeResponse)
      .then((data) => {
        if (!cancelled) {
          setUserState(data.user);
          writeLocaleCookie(data.user.locale);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiFetch(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ username, password }) },
      AuthResponse,
    );
    setToken(data.token);
    setUserState(data.user);
    writeLocaleCookie(data.user.locale);
    return data.user;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiFetch(
      "/auth/signup",
      { method: "POST", body: JSON.stringify({ name, email, password }) },
      AuthResponse,
    );
    setToken(data.token);
    setUserState(data.user);
    writeLocaleCookie(data.user.locale);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch("/auth/me", {}, MeResponse);
      setUserState(data.user);
      writeLocaleCookie(data.user.locale);
      return data.user;
    } catch {
      return null;
    }
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    writeLocaleCookie(u.locale);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
