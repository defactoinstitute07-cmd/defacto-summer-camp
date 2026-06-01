"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Volleyball,
  UserCheck,
  Award,
  Activity,
  Flame,
  Users,
  ShieldCheck,
  Swords,
  FileBadge,
  ChevronRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlassCard from "@/components/GlassCard";
import GameCard from "@/components/GameCard";
import OrganizerCard from "@/components/OrganizerCard";
import CampHighlightCard from "@/components/CampHighlightCard";
import FeatureItem from "@/components/FeatureItem";
const defaultOrganizers = [
  {
    name: "Mr. Rajveer Khatri ",
    position: "Camp Organizer ",
    bio: "",
    imageUrl: "/images/katri ji.png",
  },
  {
    name: "Mr. Gopal Negi",
    position: "Owner Defacto Institute & Camp Organizer",
    bio: "",
    imageUrl: "/images/gopal ji.png",
  },
];

const defaultGames = [
  {
    "name": "Quiz Competition",
    "description": "Test your general knowledge, quick thinking, trivia skills, and buzzer reflexes across diverse topics.",
    "imageSrc": "/images/FUN.jpg"
  },
  {
    "name": "Cultural Activities",
    "description": "Engage in traditional dances, musical performances, drama, and artistic expressions celebrating diverse heritages.",
    "imageSrc": "/images/cultural.png"
  },
  {
    "name": "Volleyball",
    "description": "Develop court communication, defensive digging, set accuracy, high-impact spiking, and serves.",
    "imageSrc": "/images/volleyball.png"
  },
  {
    "name": "Badminton",
    "description": "Enhance reflex speeds, court coverage, precision racquet gripping, explosive smashes, and double plays.",
    "imageSrc": "/images/badminton.png"
  },
  {
    "name": "Painting",
    "description": "Master brush strokes, color mixing, canvas composition, shading techniques, and creative visual expression.",
    "imageSrc": "/images/painting.jpg"
  },
  {
    "name": "TUG-OF-WAR",
    "description": "Build teamwork, synchronized pulling power, grip strength, stance stability, and collective endurance.",
    "imageSrc": "/images/tug.png"
  },
  {
    "name": "Fun Activities",
    "description": "Enjoy light-hearted games, interactive icebreakers, team-building exercises, and stress-relieving entertainment.",
    "imageSrc": "/images/fun-activity.jpg"
  }
];

const defaultVolunteers = [
  { name: "Ashwini Panwar", designation: "Camp Volunteer" },
  { name: "Rekha Maliyal", designation: "Camp Volunteer" },
  { name: "Deepika Rawat", designation: "Camp Volunteer" },
  { name: "Shalini Raturi", designation: "Camp Volunteer" },
  { name: "Anushka Uniyal", designation: "Camp Volunteer" },
  { name: "Dharmpal Negi", designation: "Camp Volunteer" },
  { name: "Shankar Panwar", designation: "Camp Volunteer" },
  { name: "Ankush Negi", designation: "Camp Volunteer" },
  { name: "Vishnu Maliyal", designation: "Camp Volunteer" },
  { name: "Vikram Panwar", designation: "Camp Volunteer" },
  { name: "Vishal Bala", designation: "Camp Volunteer" },
  { name: "Saksham Gusain", designation: "Camp Volunteer" },
  { name: "Sarthak Panwar", designation: "Camp Volunteer" },
  { name: "Sahil Gunsola", designation: "Camp Volunteer" },
  { name: "Aarush Negi", designation: "Camp Volunteer" },
  { name: "Arup Gusai", designation: "Camp Volunteer" },
  { name: "Arup Chaudhary", designation: "Camp Volunteer" },
  { name: "Ayush Yadav", designation: "Camp Volunteer" },
  { name: "Anubhav Bisht", designation: "Camp Volunteer" },
  { name: "Mukul Bisht", designation: "Camp Volunteer" },
  { name: "Rohit Gusain", designation: "Camp Volunteer" },
  { name: "Aarush", designation: "Camp Volunteer" },
  { name: "Ansh Dobariyal", designation: "Camp Volunteer" },
  { name: "Ashutosh Tripathi", designation: "Camp Volunteer" },
  { name: "Aditya Maliyal", designation: "Camp Volunteer" },
  { name: "Devansh Kripali", designation: "Camp Volunteer" },
  { name: "Shlok Panwar", designation: "Camp Volunteer" },
  { name: "Aditya Panwar", designation: "Camp Volunteer" },
  { name: "Adhyayan Panwar", designation: "Camp Volunteer" },
  { name: "Vanshul Panwar", designation: "Camp Volunteer" },
  { name: "Piyush ", designation: "Camp Volunteer" }
];

export default function Home() {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(true);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    const cleanUrl = (url: string) => url.replace(/([^:]\/)\/+/g, "$1");
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    // Fetch live organizers
    fetch(cleanUrl(`${API}/organizers`))
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setOrganizers(d.data);
        } else {
          setOrganizers(defaultOrganizers);
        }
      })
      .catch((err) => {
        console.warn("Failed to load organizers, falling back to static default:", err);
        setOrganizers(defaultOrganizers);
      })
      .finally(() => setLoadingOrganizers(false));

    // Fetch live volunteers
    fetch(cleanUrl(`${API}/volunteers`))
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setVolunteers(d.data);
        } else {
          setVolunteers(defaultVolunteers);
        }
      })
      .catch((err) => {
        console.warn("Failed to load volunteers, falling back to static default:", err);
        setVolunteers(defaultVolunteers);
      })
      .finally(() => setLoadingVolunteers(false));

    // Fetch live games
    fetch(cleanUrl(`${API}/games`))
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setGames(d.data);
        } else {
          setGames(defaultGames);
        }
      })
      .catch((err) => {
        console.warn("Failed to load games, falling back to static default:", err);
        setGames(defaultGames);
      })
      .finally(() => setLoadingGames(false));
  }, []);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    sport: "",
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Follow Camp Updates State
  const [updateEmail, setUpdateEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateEmail) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
      setUpdateEmail("");
    }, 1200);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.sport) return;

    setIsSubmitting(true);
    // Simulate API registration call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRegistered(true);
    }, 1500);
  };

  // Highlights list
  const highlights = [
    {
      title: "Summer Camp 2026",
      description:
        "Exciting 3 Days intensive camp running from June 1st to July 4th, featuring curated programs for students.",
      icon: Calendar,
    },
    {
      title: "Multiple Sports Activities",
      description:
        "Covers 7 distinct disciplines: Badminton, Fun Activities (Game and Memories), Volleyball, Cultural Activities, Painting Competition, Quiz Competition and TUG-OF-WAR.",
      icon: Volleyball,
    },
   {
  title: "Performance Tracking",
  description: "Monitor your progress with detailed analytics, milestone tracking, and personalized feedback to reach your peak.",
  icon: Activity, // Or BarChart
},
    {
      title: "Fun Competitions & Rewards",
      description:
        "Participate in weekly intra-camp leagues, championship trophies, and win official certificates.",
      icon: Award,
    },
  ];

  // Features list
  const features = [
    {
      title: "Skill Development",
      description:
        "Custom instruction plans designed for beginners to advanced players to hone core techniques.",
      icon: Activity,
    },
    {
      title: "Fitness Training",
      description:
        "Strength, agility, aerobic capacity, and flex conditioning designed for young athletes.",
      icon: Flame,
    },
    {
      title: "Teamwork Learning",
      description:
        "Group challenges and cooperative game situations that nurture leadership and fair play.",
      icon: Users,
    },
    {
      title: "Professional Guidance",
      description:
        "Receive personalized progress reports and video reviews from professional coaches.",
      icon: ShieldCheck,
    },
    {
      title: "Competitive Matches",
      description:
        "Simulated tournaments, official referee scoring, and real-time statistics tracking.",
      icon: Swords,
    },
    {
      title: "Certificates & Recognition",
      description:
        "Graduation credentials certified by Defacto Institute and official medals for merit.",
      icon: FileBadge,
    },
  ];



  return (
    <>
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        {/* HERO SECTION */}
<section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-slate-50">
  {/* Background Video & Fallback Image */}
  <div className="absolute inset-0 z-0 overflow-hidden">
    {/* Fallback Image */}
    <Image
      src="/images/summer.png"
      alt="Defacto Summer Camp Background Fallback"
      fill
      priority
      className="object-cover"
      sizes="100vw"
    />
    {/* Video Background */}
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/images/hero_bg.mp4" type="video/mp4" />
    </video>
    
    {/* Light Overlay Gradient: Frosted white glass effect for clean UI */}
    <div className="absolute inset-0 " />
    {/* Bottom fade into the next section */}
    <div className="absolute inset-x-0 bottom-0 h-40 " />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
  

<motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      // Updated to font-black and centered to match the poster's bold, balanced look
      className="text-4xl sm:text-5xl md:text-7xl font-sans font-black tracking-tighter leading-tight mb-4 uppercase max-w-4xl text-center"
    >
      {/* Welcome Text */}
      <span className="text-xl sm:text-2xl md:text-3xl text-slate-800 font-bold tracking-widest mb-4 block uppercase">
        Welcome to
      </span>

      {/* DEFACTO INSTITUTE */}
      <span className="block drop-shadow-md mb-4 sm:mb-6">
        <span className="text-[#ffc50f]">DEFACTO</span>{" "}
        <span className="text-[#ffffff] font-sans">Institute</span>
      </span>

      {/* SUMMER CAMP 2026 */}
      <span className="flex flex-wrap justify-center items-center gap-x-3 gap-y-4 mt-2 sm:mt-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
        {/* 'SUMMER' in Navy Blue */}
        <span 
          className="text-[#0b1c4a] relative drop-shadow-md"
          style={{ WebkitTextStroke: '1px white' }}
        >
          SUMMER
        </span>
        
        {/* 'CAMP' in Bright Red */}
        <span 
          className="text-[#e60000] relative drop-shadow-md"
          style={{ WebkitTextStroke: '1px white' }}
        >
          CAMP
        </span>

        {/* '2026' Badge - Angled Yellow Text on Navy Background */}
        <span className="bg-[#0b1c4a] text-[#ffde00] px-4 py-1 ml-2 transform -rotate-3 rounded-sm shadow-xl text-3xl sm:text-5xl md:text-6xl tracking-wider inline-block">
          2026
        </span>
      </span>
    </motion.h1>

{/* Sub Heading */}
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      // Updated to use the Navy Blue color and matched the font weight/casing
      className="text-base sm:text-lg md:text-xl font-sans font-bold text-[#0b1c4a] mb-6 tracking-wide"
    >
      — Lighting Minds, Building Futures —
    </motion.p>

{/* Description */}
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      // Updated to use the thematic Navy Blue (with slight transparency), centered alignment, and a medium font weight
      className="text-white font-medium text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed mb-12"
    >
      Join an exciting summer camp designed to help students improve their sports skills, build confidence, develop teamwork, and create unforgettable memories.
    </motion.p>

    {/* Buttons */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex flex-col sm:flex-row gap-4"
    >
    
      <a
        href="#games"
        className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wider rounded-xl hover:border-brand-blue hover:text-brand-blue shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
      >
        Explore Camp
        <ChevronRight className="w-5 h-5" />
      </a>
    </motion.div>
  </div>

  {/* Bottom scroll anchor */}
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">
      Scroll Down
    </span>
    <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1 bg-white/50 backdrop-blur-sm">
      <motion.div
        animate={{
          y: [0, 12, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="w-1.5 h-1.5 bg-brand-orange rounded-full"
      />
    </div>
  </div>
</section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left text column */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-1 w-8 rounded-full bg-brand-blue" />
                  <span className="text-sm font-display font-extrabold tracking-widest text-brand-blue uppercase">Who We Are</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 uppercase tracking-wider mb-6">
                  About Our Summer Camp
                </h2>
                <div className="space-y-6 text-slate-600 text-base leading-relaxed">
                  <p>
                    Defacto Institute Summer Camp is a premier platform where young students and athletes can learn, practice, and compete in various sports activities under the guidance of experienced mentors.
                  </p>
                  <p>
                    Our mission is to encourage fitness, discipline, teamwork, and personal growth. We provide high-end training plans, custom sports infrastructure, and tournaments designed to challenge and inspire.
                  </p>
                </div>
              </div>

              {/* Right card column */}
              <div className="lg:col-span-5">
                <GlassCard className="p-8 border border-slate-200/50 relative overflow-hidden shadow-md shadow-slate-100">
                  <h3 className="text-xl font-display font-extrabold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-orange" /> Camp Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200/40 text-center">
                      <p className="text-3xl sm:text-4xl font-display font-black text-brand-orange">7+</p>
                      <p className="text-slate-600 text-xs uppercase tracking-wider mt-1 font-bold">Games Tracked</p>
                    </div>
                    <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200/40 text-center">
                      <p className="text-3xl sm:text-4xl font-display font-black text-brand-blue">10+</p>
                      <p className="text-slate-600 text-xs uppercase tracking-wider mt-1 font-bold">Pro Mentors</p>
                    </div>
                    <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200/40 text-center">
                      <p className="text-3xl sm:text-4xl font-display font-black text-brand-blue">50+</p>
                      <p className="text-slate-600 text-xs uppercase tracking-wider mt-1 font-bold">Camp Alumni</p>
                    </div>
                    <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200/40 text-center">
                      <p className="text-3xl sm:text-4xl font-display font-black text-brand-orange">100%</p>
                      <p className="text-slate-600 text-xs uppercase tracking-wider mt-1 font-bold">Skill Growth</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* CAMP HIGHLIGHTS SECTION */}
        <section id="highlights" className="py-24 bg-slate-100/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-1 w-6 rounded-full bg-brand-orange" />
                <span className="text-sm font-display font-extrabold tracking-widest text-brand-orange uppercase">Highlights</span>
                <span className="h-1 w-6 rounded-full bg-brand-orange" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 uppercase tracking-wider">
                Why Defacto Camp is Unique
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((highlight, index) => (
                <CampHighlightCard
                  key={highlight.title}
                  title={highlight.title}
                  description={highlight.description}
                  icon={highlight.icon}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* GAMES SECTION */}
        <section id="games" className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-1 w-6 rounded-full bg-brand-blue" />
                <span className="text-sm font-display font-extrabold tracking-widest text-brand-blue uppercase">Our Disciplines</span>
                <span className="h-1 w-6 rounded-full bg-brand-blue" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 uppercase tracking-wider">
                Games &amp; Activities
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingGames ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col h-96 w-full">
                    <div className="animate-shimmer h-48 w-full bg-slate-200 flex-shrink-0" />
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="animate-shimmer h-6 w-32 rounded bg-slate-200" />
                      <div className="space-y-2 flex-1">
                        <div className="animate-shimmer h-4 w-full rounded bg-slate-200" />
                        <div className="animate-shimmer h-4 w-4/5 rounded bg-slate-200" />
                      </div>
                      <div className="animate-shimmer h-10 w-full rounded-xl bg-slate-200" />
                    </div>
                  </div>
                ))
              ) : (
                games.map((game, index) => (
                  <GameCard
                    key={game.name}
                    name={game.name}
                    description={game.description}
                    imageSrc={game.imageSrc}
                    delay={index * 0.1}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* WHY JOIN US SECTION */}
        <section id="benefits" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-1 w-6 rounded-full bg-brand-orange" />
                <span className="text-sm font-display font-extrabold tracking-widest text-brand-orange uppercase">Benefits</span>
                <span className="h-1 w-6 rounded-full bg-brand-orange" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 uppercase tracking-wider">
                Why Join Our Summer Camp?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureItem
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </div>
        </section>

        {/* MEET OUR ORGANIZERS */}
        <section id="organizers" className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-1 w-6 rounded-full bg-brand-blue" />
                <span className="text-sm font-display font-extrabold tracking-widest text-brand-blue uppercase">Mentorship</span>
                <span className="h-1 w-6 rounded-full bg-brand-blue" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 uppercase tracking-wider">
                Meet Our Organizers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loadingOrganizers ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col h-80 w-full justify-between shadow-sm">
                    <div className="animate-shimmer h-40 w-full rounded-xl bg-slate-200" />
                    <div className="space-y-2 mt-4">
                      <div className="animate-shimmer h-5 w-2/3 rounded bg-slate-200" />
                      <div className="animate-shimmer h-3.5 w-1/2 rounded bg-slate-200" />
                    </div>
                  </div>
                ))
              ) : (
                organizers.map((organizer, index) => (
                  <OrganizerCard
                    key={organizer.name}
                    name={organizer.name}
                    position={organizer.position}
                    bio={organizer.bio}
                    imageSrc={organizer.imageUrl || (organizer as any).imageSrc || "/images/katri ji.png"}
                    delay={index * 0.1}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* THANK YOU FOR OUR VOLUNTEERS SECTION */}
        <section id="volunteers" className="py-24 bg-slate-100/50 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-1 w-6 rounded-full bg-[#E60000]" />
                <span className="text-sm font-display font-extrabold tracking-widest text-[#E60000] uppercase">Gratitude & Appreciation</span>
                <span className="h-1 w-6 rounded-full bg-[#E60000]" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-[#0B1C4A] uppercase tracking-wider mb-6">
                Thank You to Our Volunteers!
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                We extend our deepest appreciation to the incredible team of volunteers who dedicated their time, energy, and leadership to support Defacto Institute Summer Camp 2026. This camp would not be possible without your tireless efforts!
              </p>
            </div>

            {/* Infinite Vertical Scrolling Marquee of Names (Top to Bottom) */}
            <div className="relative h-96 w-full max-w-lg mx-auto overflow-hidden glass-effect border border-slate-200/50 rounded-2xl p-8 shadow-md shadow-slate-100 flex flex-col items-center">
              {/* Premium faded gradient overlay mask for seamless top-bottom scrolling */}
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none rounded-t-2xl" />
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none rounded-b-2xl" />

              {/* Scrolling Container */}
              <div className="w-full overflow-hidden h-full flex flex-col justify-center items-center">
                <div
                  className="animate-marquee-vertical-down flex flex-col gap-4 py-4 items-center"
                >
                  {loadingVolunteers ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="w-72 sm:w-80 mx-auto px-5 py-3.5 bg-white/95 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="animate-shimmer h-4 w-28 rounded bg-slate-200" />
                          <div className="animate-shimmer h-3 w-16 rounded bg-slate-200" />
                        </div>
                        <div className="animate-shimmer w-2 h-2 rounded-full bg-slate-200" />
                      </div>
                    ))
                  ) : (
                    [...volunteers, ...volunteers].map((v, i) => (
                      <div
                        key={i}
                        className="w-72 sm:w-80 mx-auto px-5 py-3.5 bg-white/95 border border-slate-200/80 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:border-[#E60000]/50 hover:bg-white hover:shadow-lg hover:shadow-[#0B1C4A]/5 hover:scale-[1.03] group cursor-default select-none"
                      >
                       
                        <div className="flex-1 text-left">
                          <p className="text-sm sm:text-base font-display font-black text-[#0B1C4A] uppercase tracking-wider group-hover:text-[#E60000] transition-colors duration-300">
                            {v.name}
                          </p>
                          <p className="text-[10px] font-bold text-[#00bf63] uppercase tracking-widest mt-0.5 group-hover:text-[#38BDF8] transition-colors duration-300">
                            {v.designation || "Camp Volunteer"}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#FFDE00] group-hover:bg-[#E60000] group-hover:scale-125 transition-all duration-300" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      
      </main>

      <Footer />
    </>
  );
}
