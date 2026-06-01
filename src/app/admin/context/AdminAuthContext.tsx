"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Admin {
  _id: string;
  username?: string;
  email?: string;
  role: string;
  fullName?: string;
  mobileNumber?: string;
  status?: string;
  sportsPermissions?: string[];
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAdminData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    const storedAdmin = localStorage.getItem("admin_data");
    if (stored && storedAdmin) {
      setToken(stored);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_data", JSON.stringify(data.data.admin));
    setToken(data.token);
    setAdmin(data.data.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    setToken(null);
    setAdmin(null);
  }, []);

  const refreshAdminData = useCallback(async () => {
    try {
      const data = await adminFetch("/auth/me");
      if (data.success && data.data) {
        localStorage.setItem("admin_data", JSON.stringify(data.data));
        setAdmin(data.data);
      }
    } catch (err) {
      console.error("Failed to refresh admin data", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, refreshAdminData, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

/** Typed fetch helper — auto-attaches Bearer token */
export async function adminFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/** Multipart (file upload) fetch — does NOT set Content-Type */
export async function adminFetchForm(url: string, formData: FormData, method = "POST") {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API}${url}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
