"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "@/types/api";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (_email: string, _password: string) => Promise<void>;
  signup: (_email: string, _password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookie = (token: string | null) => {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      api.setToken(storedToken);
      setAuthCookie(storedToken);
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Session expired";
      console.warn("Session expired, clearing auth state:", message);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    api.setToken(data.token);
    setAuthCookie(data.token);
  };

  const signup = async (email: string, password: string) => {
    const data = await api.signup(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    api.setToken(data.token);
    setAuthCookie(data.token);
  };
  const logout = async () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("auth_token");
    api.setToken(null);

    await setAuthCookie(null);

    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
