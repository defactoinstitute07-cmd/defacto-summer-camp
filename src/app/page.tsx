"use client";

import React, { useState } from "react";
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

export default function Home() {
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

  // Games list
  const games = [
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

  // Organizers list
  const organizers = [
    {
      name: "Mr. Rajveer Khatri ",
      position: "Camp Organizer ",
      bio: "",
      imageSrc: "/images/katri ji.png",
    },
    {
      name: "Mr. Gopal Negi",
      position: "Owner Defacto Institute & Camp Organizer",
      bio: "",
      imageSrc: "/images/gopal ji.png",
    },
  ];

  // Volunteers list
  const volunteers = [
    "Ashwini Panwar",
    "Rekha Maliyal",
    "Deepika Rawat",
    "Shalini Raturi",
    "Anushka Uniyal",
    "Dharmpal Negi",
    "Shankar Panwar",
    "Ankush Negi",
    "Vishnu Maliyal",
    "Vikram Panwar",
    "Vishal Bala",
    "Saksham Gusain",
    "Sarthak Panwar",
    "Sahil Gunsola",
    "Aarush Negi",
    "Arup Gusai",
    "Arup Chaudhary",
    "Ayush Yadav",
    "Anubhav Bisht",
    "Mukul Bisht",
    "Rohit Gusain",
    "Aarush",
    "Ansh Dobariyal",
    "Ashutosh Tripathi",
    "Aditya Maliyal",
    "Devansh Kripali",
    "Shlok Panwar",
    "Aditya Panwar",
    "Adhyayan Panwar",
    "Vanshul Panwar",
    "Piyush "
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
              {games.map((game, index) => (
                <GameCard
                  key={game.name}
                  name={game.name}
                  description={game.description}
                  imageSrc={game.imageSrc}
                  delay={index * 0.1}
                />
              ))}
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
              {organizers.map((organizer, index) => (
                <OrganizerCard
                  key={organizer.name}
                  name={organizer.name}
                  position={organizer.position}
                  bio={organizer.bio}
                  imageSrc={organizer.imageSrc}
                  delay={index * 0.1}
                />
              ))}
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
                  {/* Duplicate 2 times to make the scroll seamless and continuous with -50% translation */}
                  {[...volunteers, ...volunteers].map((name, i) => (
                    <div
                      key={i}
                      className="w-72 sm:w-80 mx-auto px-5 py-3.5 bg-white/95 border border-slate-200/80 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:border-[#E60000]/50 hover:bg-white hover:shadow-lg hover:shadow-[#0B1C4A]/5 hover:scale-[1.03] group cursor-default select-none"
                    >
                     
                      <div className="flex-1 text-left">
                        <p className="text-sm sm:text-base font-display font-black text-[#0B1C4A] uppercase tracking-wider group-hover:text-[#E60000] transition-colors duration-300">
                          {name}
                        </p>
                        <p className="text-[10px] font-bold text-[#00bf63] uppercase tracking-widest mt-0.5 group-hover:text-[#38BDF8] transition-colors duration-300">
                          Camp Volunteer
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#FFDE00] group-hover:bg-[#E60000] group-hover:scale-125 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOLLOW CAMP UPDATES SECTION */}
        <section id="updates" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
          <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#38BDF8]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#FFDE00]/10 blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-1 w-6 rounded-full bg-[#E60000]" />
              <h3 className="text-sm font-display font-extrabold tracking-widest text-[#E60000] uppercase">
                Stay Tuned &amp; Index Ready
              </h3>
              <span className="h-1 w-6 rounded-full bg-[#E60000]" />
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-display font-black text-[#0B1C4A] uppercase tracking-wider mb-6">
              Follow Camp Updates
            </h2>
            
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Subscribe to get real-time schedule changes, sports match scores, volunteer coordination highlights, and official announcement updates for the Defacto Institute Summer Camp 2026.
            </p>

            <div className="max-w-md mx-auto">
              <AnimatePresence mode="wait">
                {!isSubscribed ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubscribeSubmit}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={updateEmail}
                      onChange={(e) => setUpdateEmail(e.target.value)}
                      className="flex-grow px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] text-[#0B1C4A] font-medium placeholder-slate-400 transition-all duration-300"
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="px-6 py-3.5 bg-[#E60000] hover:bg-[#0B1C4A] disabled:bg-slate-400 text-white font-display font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-[#E60000]/10 hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[140px]"
                    >
                      {isSubscribing ? "Subscribing..." : "Get Updates"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-6 text-center max-w-md mx-auto"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-emerald-900 font-display font-bold text-lg mb-1">
                      You're Subscribed!
                    </h4>
                    <p className="text-emerald-700 text-sm">
                      Thank you! You are now subscribed to receive live Defacto Summer Camp updates.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
