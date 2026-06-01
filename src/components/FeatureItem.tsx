"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export default function FeatureItem({
  title,
  description,
  icon: Icon,
  delay = 0,
}: FeatureItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="flex gap-5 p-5 rounded-2xl border border-slate-200/50 bg-white/60 hover:bg-white/90 transition-all duration-300 group cursor-pointer shadow-sm shadow-slate-100"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-lg font-display font-bold text-slate-900 mb-1 group-hover:text-brand-orange transition-colors duration-200">
          {title}
        </h4>
        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>

    </motion.div>
  );
}
