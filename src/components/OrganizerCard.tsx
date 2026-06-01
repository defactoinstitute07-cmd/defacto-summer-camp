"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface OrganizerCardProps {
  name: string;
  position: string;
  bio?: string;
  imageSrc: string;
  delay?: number;
}

export default function OrganizerCard({
  name,
  position,
  imageSrc,
  delay = 0,
}: OrganizerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/50 aspect-[3/4] flex flex-col justify-end shadow-md shadow-slate-100 cursor-pointer"
    >
      {/* Large Full-Card Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 25vw"
        />
        {/* Navy gradient overlay for high contrast text */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C4A] via-[#0B1C4A]/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
      </div>

      {/* Name and Role Content */}
      <div className="relative z-10 p-6 flex flex-col justify-end text-left">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <span className="text-[#FFDE00] font-black text-xs uppercase tracking-widest mb-1 inline-block">
            {position}
          </span>
          <h3 className="text-xl font-display font-black text-white leading-tight uppercase">
            {name}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
