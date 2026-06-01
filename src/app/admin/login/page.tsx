"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../context/AdminAuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) router.replace("/admin");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center px-4 relative overflow-hidden font-sans">

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60000]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B1C4A]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#FFDE00]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-slate-200/60">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E60000] to-[#0B1C4A] flex items-center justify-center mb-4 shadow-lg shadow-[#E60000]/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-[#0B1C4A] text-2xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium text-center">
              Defacto Institute Summer Camp 2026
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-600 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@defactoinstitute.com"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#E60000]/60 focus:ring-2 focus:ring-[#E60000]/10 focus:bg-white transition-all duration-200 text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#E60000]/60 focus:ring-2 focus:ring-[#E60000]/10 focus:bg-white transition-all duration-200 text-sm font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#E60000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#E60000]/25 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-6">
            🔒 Secure admin access — Defacto Institute 2026
          </p>
        </div>

        {/* Back to site */}
        <p className="text-center mt-4">
          <a href="/" className="text-slate-400 hover:text-[#E60000] text-sm font-semibold transition-colors">
            ← Back to Camp Portal
          </a>
        </p>
      </motion.div>
    </div>
  );
}
