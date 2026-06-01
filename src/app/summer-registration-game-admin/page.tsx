"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Lock, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function GameAdminRegistrationPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register-game-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, mobileNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed. Try again.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center px-4 relative overflow-hidden font-sans">
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60000]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B1C4A]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#FFDE00]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-slate-200/60">
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E60000] to-[#0B1C4A] flex items-center justify-center mb-4 shadow-lg shadow-[#E60000]/25">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-[#0B1C4A] text-2xl font-black tracking-tight">Game Admin Signup</h1>
                  <p className="text-slate-400 text-sm mt-1 font-semibold text-center">
                    Defacto Summer Camp 2026 Registration
                  </p>
                </div>

                {/* Error Banner */}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rohit Sharma"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#E60000]/60 focus:ring-2 focus:ring-[#E60000]/10 focus:bg-white transition-all text-sm font-medium"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#E60000]/60 focus:ring-2 focus:ring-[#E60000]/10 focus:bg-white transition-all text-sm font-medium"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#E60000]/60 focus:ring-2 focus:ring-[#E60000]/10 focus:bg-white transition-all text-sm font-medium"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Must be at least 8 characters</p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#E60000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E60000]/20 active:scale-95 mt-4"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Submit Registration"
                    )}
                  </button>
                </form>

                {/* Back to Login link */}
                <div className="border-t border-slate-100 mt-6 pt-5 text-center">
                  <a
                    href="/admin/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#E60000] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Already have an account? Sign In
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h2 className="text-[#0B1C4A] text-xl font-black tracking-tight mb-3">Registration Successful</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  Your account is pending approval. Please wait for Super Admin approval before you can access the system.
                </p>
                <button
                  onClick={() => router.push("/admin/login")}
                  className="px-6 py-3 bg-[#0B1C4A] hover:bg-[#0B1C4A]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95"
                >
                  Go to Login Screen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
