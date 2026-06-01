"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface GameCardProps {
  name: string;
  description: string;
  imageSrc: string;
  delay?: number;
}

export default function GameCard({
  name,
  description,
  imageSrc,
  delay = 0,
}: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 aspect-[4/3] sm:aspect-[3/4] flex flex-col justify-end cursor-pointer shadow-lg shadow-black/30"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Modern dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end h-full">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-brand-orange/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-6 rounded-full bg-brand-orange transition-all duration-300 group-hover:w-8" />
            <h3 className="text-2xl font-display font-extrabold text-white uppercase tracking-wider">
              {name}
            </h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 delay-75">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
