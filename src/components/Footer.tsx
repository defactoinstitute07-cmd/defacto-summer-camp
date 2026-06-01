import React from "react";
import { Trophy, Mail, Phone, MapPin } from "lucide-react";
import { Facebook, Instagram, Twitter, Youtube } from "@/components/BrandIcons";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex flex-col justify-center mb-6">
    {/* Main Title */}
    <span className="font-sans font-bold text-4xl text-[#e5ad01] leading-none mb-1 tracking-wide group-hover:text-yellow-400 transition-colors duration-200">
      Defacto
    </span>
    {/* Subtitle */}
    <span className="font-sans font-medium text-[15px] text-white tracking-wide leading-none">
      Institute | BHANIYAWALA
    </span>
  </div>
            <p className="text-sm leading-relaxed mb-6">
              Defacto Institute Summer Camp is a premium sports academy designed to help young athletes build skills, discipline, and lifelong friendships.
            </p>
            {/* Social icons */}
            {/* <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/15 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-orange hover:bg-brand-orange/15 transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-blue hover:bg-brand-blue/15 transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-orange hover:bg-brand-orange/15 transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display font-extrabold tracking-wider uppercase text-sm mb-6">
              Quick Links
            </h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li>
                <a href="#about" className="hover:text-white transition-colors duration-200">
                  About Summer Camp
                </a>
              </li>
              <li>
                <a href="#highlights" className="hover:text-white transition-colors duration-200">
                  Camp Highlights
                </a>
              </li>
              <li>
                <a href="#games" className="hover:text-white transition-colors duration-200">
                  Games & Activities
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-white transition-colors duration-200">
                  Why Join Us
                </a>
              </li>
              <li>
                <a href="#organizers" className="hover:text-white transition-colors duration-200">
                  Camp Mentors
                </a>
              </li>
              <li>
                <a href="#volunteers" className="hover:text-white transition-colors duration-200">
                  Our Volunteers
                </a>
              </li>
              <li>
                <a href="#updates" className="hover:text-white transition-colors duration-200">
                  Follow Camp Updates
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white font-display font-extrabold tracking-wider uppercase text-sm mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>
                 De Facto Institute Rd, Bhania Wala, Uttarakhand 248140
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-blue flex-shrink-0" />
                <span>+91 81919 30475</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-orange flex-shrink-0" />
                <span>defactoinstitute07@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours / Details */}
          <div>
            <h4 className="text-white font-display font-extrabold tracking-wider uppercase text-sm mb-6">
              Camp Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
                <p className="text-white font-bold mb-1">Camp Dates:</p>
                <p className="text-green-500 font-semibold">June 1 - July 4, 2026</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
                <p className="text-white font-bold mb-1">Timings:</p>
                <p className="text-green-500 font-semibold">06:00 PM - 10:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>
            Copyright &copy; 2026 Defacto Institute Bhaniyawala. All Rights Reserved.
          </p>
        
        </div>
      </div>
    </footer>
  );
}
