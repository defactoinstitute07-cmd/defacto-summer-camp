"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CampHighlightCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export default function CampHighlightCard({
  title,
  description,
  icon: Icon,
  delay = 0,
}: CampHighlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.215, 0.61, 0.355, 1] }}
      whileHover={{
        y: -8,
        borderColor: "rgba(249, 115, 22, 0.4)",
        boxShadow: "0 20px 40px -15px rgba(249, 115, 22, 0.15)",
      }}
      className="glass-effect rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 border border-slate-200/50"
    >
      <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 text-brand-orange mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 mb-3 tracking-wide">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>

    </motion.div>
  );
}
