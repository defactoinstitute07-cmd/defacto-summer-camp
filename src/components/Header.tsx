"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-4 shadow-md shadow-slate-100/50"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <a href="https://www.defactoinstitute.in/" className="flex items-center gap-3 group">
              <div className="flex flex-col justify-center">
                <span className="font-sans font-bold text-4xl text-[#e5ad01] leading-none mb-1 tracking-wide group-hover:text-yellow-400 transition-colors duration-200">
                  Defacto
                </span>
                <span className="font-sans font-medium text-[15px] text-black tracking-wide leading-none">
                  Institute | BHANIYAWALA
                </span>
              </div>
            </a>

            {/* Desktop — Single Nav Link */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/camp-portal"
                id="nav-follow-camp"
                className="relative inline-flex items-center gap-2 font-display font-bold text-sm tracking-widest text-slate-700 hover:text-[#E60000] uppercase transition-colors duration-200 group"
              >
                {/* Pulsing live dot */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E60000] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E60000]" />
                </span>
                Follow the Camp
              </a>
            </nav>

            {/* Desktop CTA Button */}
            <div className="hidden md:block">
              <a
                href="/camp-portal"
                id="cta-follow-camp"
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-display font-extrabold uppercase tracking-wider text-white rounded-xl group bg-gradient-to-br from-[#E60000] to-[#0B1C4A] hover:text-white focus:ring-4 focus:outline-none focus:ring-red-800 transition-all duration-300"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white text-slate-900 group-hover:text-white rounded-[10px] group-hover:bg-opacity-0 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E60000] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E60000]" />
                  </span>
                  Follow the Camp
                </span>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
                className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-xl border border-slate-200 bg-white/60"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[73px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-6 md:hidden flex flex-col gap-6 shadow-xl"
          >
            <a
              href="https://summercamp.defactoinstitute.in/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 font-display font-bold text-lg tracking-widest text-slate-700 hover:text-[#E60000] uppercase py-2 border-b border-slate-100 transition-colors duration-200"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E60000] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E60000]" />
              </span>
             Camp Website
            </a>

            <a
              href="/camp-portal"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-4 bg-gradient-to-r from-[#E60000] to-[#0B1C4A] text-white font-display font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-[#E60000]/20 flex items-center justify-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Follow the Camp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
