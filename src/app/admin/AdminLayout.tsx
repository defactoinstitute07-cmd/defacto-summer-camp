"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "./context/AdminAuthContext";
import {
  LayoutDashboard, Users, UserCheck, Trophy, CalendarCheck,
  Megaphone, Image, Shield, LogOut, Menu, X, Swords, ChevronRight, Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard",     href: "/admin",               icon: LayoutDashboard },
  { label: "Games",         href: "/admin/games",         icon: Gamepad2 },
  { label: "Organizers",    href: "/admin/organizers",    icon: Shield },
  { label: "Volunteers",    href: "/admin/volunteers",    icon: Users },
  { label: "Players",       href: "/admin/players",       icon: UserCheck },
  { label: "Matches",       href: "/admin/matches",       icon: Swords },
  { label: "Points Table",  href: "/admin/points",        icon: Trophy },
  { label: "Attendance",    href: "/admin/attendance",    icon: CalendarCheck },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Gallery",       href: "/admin/gallery",       icon: Image },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isAuthenticated, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [loading, isAuthenticated, pathname, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-semibold text-sm">Loading Admin Panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const currentPage = navItems.find(
    n => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40
        flex flex-col shadow-xl shadow-slate-200/50
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
      `}>
        {/* Brand Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E60000] to-[#0B1C4A] flex items-center justify-center shadow-md shadow-[#E60000]/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[#e5ad01] font-black text-lg leading-none">Defacto</p>
              <p className="text-slate-500 text-xs font-semibold">Admin Panel</p>
            </div>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto px-3">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-sm font-bold
                  transition-all duration-200 group
                  ${active
                    ? "bg-[#E60000] text-white shadow-md shadow-[#E60000]/25"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#E60000] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {admin?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-sm font-bold truncate">{admin?.username}</p>
              <p className="text-slate-400 text-xs capitalize">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm font-bold transition-all duration-200 border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center gap-4 transition-all duration-300 ${scrolled ? "border-b border-slate-200/70 shadow-sm shadow-slate-100" : "border-b border-slate-100"}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-slate-900 font-black text-lg tracking-tight">
              {currentPage?.label || "Dashboard"}
            </h1>
          </div>

          {/* Live badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>

          {/* Camp link */}
          <a href="/" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1C4A] text-white text-xs font-bold hover:bg-[#0B1C4A]/90 transition-colors">
            View Site ↗
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
