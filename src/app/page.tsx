"use client";

import { motion, type Variants } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { projects } from "@/data/projects";
import ProjectsMarquee from "@/components/ProjectsMarquee";
import TechStackGrid from "@/components/TechStackGrid";
import TypewriterText from "@/components/TypewriterText";
import ContactForm from "@/components/ContactForm";
import { useCanHover } from "@/hooks/useCanHover";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

// Fixed design-space canvas for the whiteboard — the whole canvas is uniformly
// scaled to fit the viewport, so notes keep identical relative positions at
// every screen size instead of being re-laid-out per breakpoint.
const BOARD_DESIGN_WIDTH = 760;
const BOARD_DESIGN_HEIGHT = 530;

const expertiseItems = [
  { n: "01", title: "Full-Stack Web Development",          desc: "Complete, responsive applications built end to end, frontend through backend.",                  projects: ["C.U.R.A. 2.0", "RadDesk"],                  pos: { left: 30,  top: 22  }, rot: -5, bg: "linear-gradient(160deg,#FFF9C4 0%,#FFF176 100%)", border: "#F9D90A", text: "#5a4a00", pill: "rgba(90,74,0,0.12)",   pin: "#F9D90A" },
  { n: "02", title: "API & Backend Engineering",            desc: "Secure, well-structured backend logic and REST APIs.",                                           projects: ["Special Problem Info System (S.P.I.S.)"],          pos: { left: 258, top: 11  }, rot:  4, bg: "linear-gradient(160deg,#C8F7DC 0%,#A3F0C0 100%)", border: "#3DBE70", text: "#0f4a24", pill: "rgba(15,74,36,0.12)",  pin: "#3DBE70" },
  { n: "03", title: "Database & Cloud Systems",             desc: "Reliable, well-structured data architecture.",                                                   projects: ["Cafeteria Inventory System"],           pos: { right: 23, top: 28  }, rot: -3, bg: "linear-gradient(160deg,#E8D5FC 0%,#D4ADFA 100%)", border: "#9B59DA", text: "#3b1270", pill: "rgba(59,18,112,0.12)", pin: "#9B59DA" },
  { n: "04", title: "Process Automation & AI Integration", desc: "Tools that remove manual work using AI and workflow automation.",                                 projects: ["AI Document Summarizer"],                  pos: { left: 167, top: 269 }, rot:  6, bg: "linear-gradient(160deg,#FFE0CC 0%,#FFCBA4 100%)", border: "#F47C3C", text: "#5a2000", pill: "rgba(90,32,0,0.12)",  pin: "#F47C3C" },
  { n: "05", title: "Business & Operational Systems",       desc: "End-to-end systems that run real business operations — point-of-sale, billing, and inventory.", projects: ["Shopping Website"], pos: { left: 403, top: 252 }, rot: -4, bg: "linear-gradient(160deg,#C7EEFF 0%,#A0DEFF 100%)", border: "#2FA8E0", text: "#0a3a55", pill: "rgba(10,58,85,0.12)",  pin: "#2FA8E0" },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const canHover = useCanHover();

  // Whiteboard tool state
  const [activeTool, setActiveTool] = useState<"marker" | "eraser" | "sticker" | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [activeSticker, setActiveSticker] = useState("⭐");
  const [placedStickers, setPlacedStickers] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [markerSize, setMarkerSize] = useState(2.5);
  const [eraserSize, setEraserSize] = useState(28);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardScaleWrapperRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [boardScale, setBoardScale] = useState(1);
  // Seed with approximate positions so lines show immediately before DOM measurement
  const [pinPositions, setPinPositions] = useState<{ x: number; y: number }[]>([
    { x: 14, y: 10 },
    { x: 43, y:  8 },
    { x: 82, y: 11 },
    { x: 32, y: 55 },
    { x: 63, y: 52 },
  ]);

  const updatePinPositions = useCallback(() => {
    if (!boardContainerRef.current) return;
    const containerRect = boardContainerRef.current.getBoundingClientRect();
    if (containerRect.width === 0) return;
    const refs = cardRefs.current.filter(Boolean);
    if (refs.length < 5) return; // wait until all 5 refs are mounted
    const newPos = cardRefs.current.map(ref => {
      if (!ref) return { x: 0, y: 0 };
      const rect = ref.getBoundingClientRect();
      return {
        x: ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100,
        y: ((rect.top + 26 * boardScale - containerRect.top) / containerRect.height) * 100,
      };
    });
    setPinPositions(newPos);
  }, [boardScale]);

  // Scale the fixed-size whiteboard canvas to fit whatever width is available,
  // so the scattered note layout stays identical (just smaller) on every screen size.
  useEffect(() => {
    const wrapper = boardScaleWrapperRef.current;
    if (!wrapper) return;
    const update = () => {
      const w = wrapper.clientWidth;
      if (w > 0) setBoardScale(Math.min(1, w / BOARD_DESIGN_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
  }, [boardScale]);

  // Runs directly (not via requestAnimationFrame, which browsers can throttle
  // or fully suspend for backgrounded/inactive tabs) so the dashed connector
  // lines always sync to the notes' real measured positions.
  useEffect(() => {
    updatePinPositions();
  }, [updatePinPositions]);

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onBoardMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (activeTool !== "marker" && activeTool !== "eraser") return;
    setIsDrawing(true);
    setLastPos(getCanvasPos(e));
  }

  function onBoardMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (activeTool === "marker") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#8F1B4B";
      ctx.lineWidth = markerSize;
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = eraserSize;
    }
    if (activeTool === "eraser") {
      setPlacedStickers(prev =>
        prev.filter(s => Math.hypot(s.x - pos.x, s.y - pos.y) > eraserSize / 2)
      );
    }
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    setLastPos(pos);
  }

  function onBoardMouseUp() {
    setIsDrawing(false);
    setLastPos(null);
  }

  function onBoardClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (activeTool !== "sticker") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setPlacedStickers(prev => [...prev, {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      emoji: activeSticker,
    }]);
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  return (
    <>
      {/* ── HOME ── */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col justify-start md:justify-center pt-[58vh] md:pt-0 px-8 sm:px-16 lg:px-24 pb-12 md:pb-0 overflow-hidden scroll-mt-16"
      >
        {/* Video — full width on mobile, right-only on desktop */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover object-center md:left-auto md:right-0 md:w-[65%] md:object-left -z-20"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Mobile gradient — bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#8F1B4B]/95 via-[#8F1B4B]/60 to-[#8F1B4B]/10 -z-10 md:hidden" />
        {/* Desktop gradient — left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#8F1B4B] from-[35%] via-[#8F1B4B]/70 via-[55%] to-transparent -z-10 hidden md:block" />

        {/* Hero content */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-lg">
          <motion.p variants={fadeUp} className="hidden md:block text-white/60 tracking-[0.25em] uppercase text-xs mb-5">
            Welcome to my portfolio
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white mb-3 md:mb-5 leading-[1.15]">
            Hi, I&apos;m a{" "}
            <TypewriterText
              segments={[
                { text: "Full-Stack Developer", color: "#FFB6C1" },
                { text: " & " },
                { text: "AI Automation Builder", color: "#FFB6C1" },
              ]}
              startDelay={900}
              speed={35}
            />
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-xs sm:text-sm lg:text-base leading-relaxed mb-2 md:mb-4">
            I build scalable web and mobile apps, systems, and AI-driven tools using React, Java, Python, and Supabase, backed by real results across fintech, insurance, and healthcare.
          </motion.p>
          <motion.p variants={fadeUp} className="text-white/50 text-[10px] sm:text-xs tracking-wide mb-4 md:mb-8">
            BS Computer Science · University of the Philippines Manila · 2026
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 md:gap-4 mb-4 md:mb-0">
            <a
              href="#projects"
              className="px-5 py-2.5 sm:px-7 sm:py-3 bg-white text-[#8F1B4B] font-semibold rounded-full md:hover:bg-white/90 transition-all duration-200 shadow-lg md:hover:-translate-y-0.5 text-xs sm:text-base"
            >
              View My Projects
            </a>
            <a
              href="#contact"
              className="px-5 py-2.5 sm:px-7 sm:py-3 border-2 border-white text-white font-semibold rounded-full md:hover:bg-white md:hover:text-[#8F1B4B] transition-all duration-200 md:hover:-translate-y-0.5 text-xs sm:text-base"
            >
              Contact Me
            </a>
          </motion.div>
        </motion.div>

        {/* Unmute — floating top-right on mobile only, so it doesn't push the CTAs down */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute top-20 right-4 flex flex-col items-center gap-1.5 md:hidden"
        >
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
            className="w-11 h-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
          >
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 4.574a1 1 0 0 0-1.512-.857L7.745 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3.745l3.743 2.283A1 1 0 0 0 13 19.426V4.574z"/>
                <path d="M16.72 8.28a.75.75 0 0 0-1.06 1.06L17.19 11l-1.53 1.53a.75.75 0 1 0 1.06 1.06L18.25 12l1.53 1.53a.75.75 0 0 0 1.06-1.06L19.31 11l1.53-1.53a.75.75 0 0 0-1.06-1.06L18.25 10l-1.53-1.72z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 4.574a1 1 0 0 0-1.512-.857L7.745 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3.745l3.743 2.283A1 1 0 0 0 13 19.426V4.574z"/>
                <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            )}
          </button>
          <span className="text-white/50 text-[9px] tracking-[0.2em] uppercase whitespace-nowrap">
            {muted ? "Unmute Reel" : "Mute Reel"}
          </span>
        </motion.div>

        {/* Unmute — absolute right-center on desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-2 hidden md:flex"
        >
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
            className="w-12 h-12 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 backdrop-blur-sm"
          >
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 4.574a1 1 0 0 0-1.512-.857L7.745 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3.745l3.743 2.283A1 1 0 0 0 13 19.426V4.574z"/>
                <path d="M16.72 8.28a.75.75 0 0 0-1.06 1.06L17.19 11l-1.53 1.53a.75.75 0 1 0 1.06 1.06L18.25 12l1.53 1.53a.75.75 0 0 0 1.06-1.06L19.31 11l1.53-1.53a.75.75 0 0 0-1.06-1.06L18.25 10l-1.53-1.72z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 4.574a1 1 0 0 0-1.512-.857L7.745 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3.745l3.743 2.283A1 1 0 0 0 13 19.426V4.574z"/>
                <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            )}
          </button>
          <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase">
            {muted ? "Unmute Reel" : "Mute Reel"}
          </span>
        </motion.div>

        {/* Scroll arrow — bottom center, desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1"
        >
          <motion.svg
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="h-px w-full" style={{ backgroundColor: "#8F1B4B" }} />

      {/* ── ABOUT ── */}
      <section id="about" className="flex items-center px-6 md:px-16 pt-0 pb-16 bg-[#B72D61] relative scroll-mt-16">

        {/* Sparkle decorations */}
        <motion.svg
          className="absolute top-10 right-16 text-white w-14 h-14"
          viewBox="0 0 24 24" fill="currentColor"
          animate={{ scale: [1, 1.35, 0.85, 1.2, 1], opacity: [0.7, 1, 0.4, 0.9, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M12 0 C12 0 10.5 10.5 0 12 C10.5 13.5 12 24 12 24 C12 24 13.5 13.5 24 12 C13.5 10.5 12 0 12 0Z"/>
        </motion.svg>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* Left: Tablet frame + Education */}
          <div className="flex flex-col items-center gap-6 pt-0">
            <div className="flex justify-center relative w-full" style={{ clipPath: "inset(0 -500px -500px -500px)" }}>
              {/* Sparkles near the tablet */}
              <motion.svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-10 h-10 z-10"
                viewBox="0 0 24 24" fill="currentColor"
                animate={{ scale: [1, 1.3, 0.75, 1.2, 1], opacity: [0.7, 1, 0.3, 0.85, 0.7] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              >
                <path d="M12 0 C12 0 10.5 10.5 0 12 C10.5 13.5 12 24 12 24 C12 24 13.5 13.5 24 12 C13.5 10.5 12 0 12 0Z"/>
              </motion.svg>
              <motion.svg
                className="absolute right-4 bottom-12 text-white w-6 h-6 z-10"
                viewBox="0 0 24 24" fill="currentColor"
                animate={{ scale: [1, 1.5, 0.7, 1.3, 1], opacity: [0.5, 1, 0.2, 0.75, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
              >
                <path d="M12 0 C12 0 10.5 10.5 0 12 C10.5 13.5 12 24 12 24 C12 24 13.5 13.5 24 12 C13.5 10.5 12 0 12 0Z"/>
              </motion.svg>
              <motion.div
                initial={{ y: -120, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.1 }}
                className="relative flex flex-col items-center"
              >
                <div className="w-3 h-28 bg-gray-900" />
                <div className="w-14 h-6 bg-[#FFB6C1] rounded-md" />
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: -8 }}
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={canHover ? { rotate: 0, transition: { type: "spring", stiffness: 200, damping: 18 } } : undefined}
                  transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.5 }}
                  className="w-52 sm:w-64 border-[14px] border-gray-900 rounded-3xl overflow-hidden cursor-pointer"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img src="/about-photo.jpeg" alt="About photo" className="w-full h-full object-cover" />
                </motion.div>
              </motion.div>
            </div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
              className="w-full px-2"
            >
              <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-1.5">Education</p>
              <p className="text-white font-semibold text-sm">BS Computer Science (Statistical Computing)</p>
              <p className="text-white/60 text-xs">University of the Philippines Manila · 2022–2026</p>
            </motion.div>

          </div>

          {/* Right: Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col h-full"
          >
            {/* Spacer above Hello! — gives breathing room without pushing experience up */}
            <div className="flex-1 min-h-[2rem]" />

            {/* All content compact together */}
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">Hello!</h2>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                  I&apos;m{" "}
                  <span className="font-extrabold" style={{ color: "#FFB6C1" }}>Niña Aurelio</span>
                  , a full-stack developer and CS student at the University of the Philippines Manila. I build web and mobile apps, AI automation tools, and systems that get real results.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["React", "Python", "Java", "Supabase"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-full cursor-default transition-all duration-200 md:hover:bg-[#FFB6C1] md:hover:border-[#FFB6C1] md:hover:text-[#8F1B4B]">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Experience — sits directly below badges */}
              <div className="pt-1">
              <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-3">Experience</p>
              <div className="flex flex-col gap-3">
                {[
                  { role: "Freelance Web Developer", company: "Self-Employed", period: "Oct 2025–Present", desc: "AI automation platforms, document summarizers, and a full-stack billing system with Stripe integration." },
                  { role: "SWE Intern – Head", company: "WiseCare Providers", period: "May–Jun 2025", desc: "Led a web-based insurance system; +45% workflow efficiency." },
                  { role: "SWE Intern", company: "LE PAY", period: "Jan–Apr 2025", desc: "Built payment APIs in Java/Spring Boot; −35% transaction latency." },
                  { role: "Facebook Ads Assistant", company: "Laurus Enterprises", period: "Jun 2022–Mar 2024", desc: "Real-time ad dashboard via Facebook Graph API; −70% reporting time, +30% ROI." },
                ].map((exp, i, arr) => (
                  <div key={exp.company} className="group flex gap-3 cursor-default rounded-lg px-2 py-1 -mx-2 md:hover:bg-white/10 transition-all duration-200">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative mt-1 w-4 h-4 flex items-center justify-center">
                        <span className="absolute w-2 h-2 rounded-full bg-white/30 transition-all duration-200 md:group-hover:opacity-0 md:group-hover:scale-0" />
                        <svg
                          className="absolute w-4 h-4 opacity-0 scale-50 transition-all duration-200 md:group-hover:opacity-100 md:group-hover:scale-100"
                          style={{ color: "#FFB6C1" }}
                          viewBox="0 0 24 24" fill="currentColor"
                        >
                          <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                        </svg>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-px bg-white/20 flex-1 mt-1" />
                      )}
                    </div>
                    <div className={`flex-1 min-w-0 ${i < arr.length - 1 ? "pb-3" : ""}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-white font-semibold text-xs md:group-hover:text-white transition-colors duration-200">{exp.role}</p>
                        <p className="text-white/40 text-[9px] whitespace-nowrap shrink-0 md:group-hover:text-white/60 transition-colors duration-200">{exp.period}</p>
                      </div>
                      <p className="text-[10px] mb-0.5 md:group-hover:text-[#ffd6e0] transition-colors duration-200" style={{ color: "#FFB6C1" }}>{exp.company}</p>
                      <p className="text-white/60 text-[10px] leading-relaxed md:group-hover:text-white/80 transition-colors duration-200">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Wave divider — about → expertise */}
      <div className="relative h-24 bg-[#D5407E] overflow-hidden -mt-1">
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="absolute top-0 w-full h-full">
          {/* Back wave */}
          <path d="M0,0 L1440,0 L1440,50 C1080,96 360,96 0,50 Z" fill="#B72D61" opacity="0.4"/>
          {/* Front wave */}
          <path d="M0,0 L1440,0 L1440,30 C1080,75 360,75 0,30 Z" fill="#B72D61"/>
        </svg>
      </div>

      {/* ── EXPERTISE ── */}
      <section id="expertise" className="px-6 py-8 bg-[#D5407E] scroll-mt-16 relative">

        {/* Grid — fades left, right, top borders only */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(to right, transparent, black 22%, black 78%, transparent), linear-gradient(to bottom, transparent, black 20%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 22%, black 78%, transparent), linear-gradient(to bottom, transparent, black 20%)",
          }}
        />

        <div className="w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_8fr] gap-10 lg:gap-14 items-start">

            {/* Left: heading — top-left corner */}
            <div className="flex flex-col items-start">
              <span className="inline-block px-3 py-1 rounded-full border border-white/30 text-white/60 text-[9px] tracking-[0.25em] uppercase mb-4">
                My Expertise
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-[1.1] mb-4">
                Crafting<br />Digital Solutions<br />with Code &amp; AI
              </h2>
              <p className="text-white/60 text-xs leading-relaxed">
                From full-stack web apps to AI automation — I build scalable, real-world products backed by measurable results.
              </p>

              {/* Board toolbar — desktop only */}
              <div className="mt-4 w-full hidden lg:block">
                {/* "Interact with me" badge */}
                <div className="mb-2 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="inline-flex items-center gap-1 bg-[#FFB6C1] text-[#8F1B4B] px-2.5 py-1 rounded-full shadow-sm"
                  >
                    <span className="text-xs">🎨</span>
                    <span className="text-[9px] font-bold tracking-wide">Interact with me!</span>
                  </motion.div>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="text-white/50 text-[8px] italic"
                  >← try the tools</motion.span>
                </div>

                {/* Tool panel */}
                <div className="w-full rounded-xl overflow-hidden shadow-lg border border-white/30"
                  style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff0f5 100%)" }}
                >
                  {/* Header bar */}
                  <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-[#f0d0da]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b8a]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFB6C1]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffd6e0]" />
                    <span className="ml-1 text-[8px] text-[#8F1B4B]/50 tracking-[0.2em] uppercase font-medium">Board Tools</span>
                  </div>

                  {/* Tool buttons */}
                  <div className="flex gap-1.5 p-2">
                    {([
                      { tool: "marker"  as const, icon: "✏️", label: "Marker"  },
                      { tool: "eraser"  as const, icon: "🧹", label: "Eraser"  },
                      { tool: "sticker" as const, icon: "🌸", label: "Sticker" },
                    ] as const).map(({ tool, icon, label }) => (
                      <button
                        key={tool}
                        onClick={() => setActiveTool(activeTool === tool ? null : tool)}
                        className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg border transition-all duration-200 text-[9px] font-semibold ${
                          activeTool === tool
                            ? "bg-[#8F1B4B] text-white border-[#8F1B4B] shadow-md scale-[1.04]"
                            : "bg-white text-[#8F1B4B] border-[#f0c0d0] hover:border-[#8F1B4B]"
                        }`}
                      >
                        <span className="text-sm">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Thickness slider for marker */}
                  {activeTool === "marker" && (
                    <div className="px-2.5 pb-2 pt-1.5 border-t border-[#f0d0da]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[7px] text-[#8F1B4B]/50 uppercase tracking-[0.15em]">Thickness</p>
                        <div className="rounded-full bg-[#8F1B4B]" style={{ width: markerSize * 2.5, height: markerSize * 2.5 }} />
                      </div>
                      <input type="range" min={1} max={12} step={0.5} value={markerSize}
                        onChange={e => setMarkerSize(Number(e.target.value))}
                        className="w-full accent-[#8F1B4B] cursor-pointer h-1" />
                    </div>
                  )}

                  {/* Thickness slider for eraser */}
                  {activeTool === "eraser" && (
                    <div className="px-2.5 pb-2 pt-1.5 border-t border-[#f0d0da]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[7px] text-[#8F1B4B]/50 uppercase tracking-[0.15em]">Eraser Size</p>
                        <div className="rounded-full border-2 border-[#8F1B4B]/40" style={{ width: eraserSize * 0.35, height: eraserSize * 0.35 }} />
                      </div>
                      <input type="range" min={8} max={64} step={2} value={eraserSize}
                        onChange={e => setEraserSize(Number(e.target.value))}
                        className="w-full accent-[#8F1B4B] cursor-pointer h-1" />
                    </div>
                  )}

                  {/* Sticker picker */}
                  {activeTool === "sticker" && (
                    <div className="px-2.5 pb-2 pt-1.5 flex gap-1 flex-wrap border-t border-[#f0d0da]">
                      {["⭐", "💖", "✨", "🌸", "🎀", "🦋", "🍀", "🌈"].map(emoji => (
                        <button key={emoji} onClick={() => setActiveSticker(emoji)}
                          className={`text-sm p-1 rounded-md border transition-all duration-150 ${
                            activeSticker === emoji
                              ? "bg-[#FFB6C1] border-[#FFB6C1] scale-110 shadow-sm"
                              : "bg-white border-[#f0d0da] hover:border-[#FFB6C1]"
                          }`}
                        >{emoji}</button>
                      ))}
                    </div>
                  )}

                  {/* Hint */}
                  <div className="px-2.5 pb-1.5">
                    <p className="text-[7px] text-[#8F1B4B]/40 italic">
                      {!activeTool && "Pick a tool and play on the board ✨"}
                      {activeTool === "marker"  && "Draw anywhere on the white board →"}
                      {activeTool === "eraser"  && "Drag over marker strokes to erase →"}
                      {activeTool === "sticker" && `Click the board to place ${activeSticker} →`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: whiteboard */}
            <div className="w-full">
              <div
                className="relative rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                style={{ background: "#8F1B4B", padding: "12px 12px 22px 12px" }}
              >
                {/* Frame inner highlight */}
                <div className="absolute inset-0 rounded-xl border-t-2 border-l border-white/20 pointer-events-none z-10" />

                {/* Corner screws */}
                {["top-2 left-2", "top-2 right-2", "bottom-6 left-2", "bottom-6 right-2"].map((pos) => (
                  <div key={pos} className={`absolute ${pos} w-2.5 h-2.5 rounded-full bg-[#5a1030] border border-white/10 shadow-inner z-20`} />
                ))}

                {/* Marker tray */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-5 rounded-b-xl flex items-center px-5 gap-2"
                  style={{ background: "#6a1535" }}
                >
                  <div className="w-8 h-1.5 rounded-sm bg-white/30" />
                  <div className="w-5 h-1.5 rounded-sm bg-white/20" />
                  <div className="w-7 h-1.5 rounded-sm bg-white/25" />
                </div>

                {/* White board surface */}
                <div
                  className="relative bg-white rounded-lg overflow-hidden"
                  style={{ boxShadow: "inset 0 2px 14px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.04)" }}
                >
                  {/* Dot grid */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.15]"
                    style={{ backgroundImage: "radial-gradient(circle, #888 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                  />
                  {/* Glossy sheen */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                  {/* Drawing canvas */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    style={{
                      cursor: (() => {
                        const emojiCursor = (emoji: string, hx: number, hy: number) => {
                          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text y='28' font-size='26'>${emoji}</text></svg>`;
                          return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, auto`;
                        };
                        if (activeTool === "marker")  return emojiCursor("✏️",  2, 28);
                        if (activeTool === "eraser")  return emojiCursor("🧹", 4, 28);
                        if (activeTool === "sticker") return emojiCursor(activeSticker, 16, 16);
                        return "default";
                      })(),
                      pointerEvents: activeTool ? "auto" : "none",
                      zIndex: 6,
                    }}
                    onMouseDown={onBoardMouseDown}
                    onMouseMove={onBoardMouseMove}
                    onMouseUp={onBoardMouseUp}
                    onMouseLeave={onBoardMouseUp}
                    onClick={onBoardClick}
                  />
                  {/* Placed stickers */}
                  {placedStickers.map(s => (
                    <div
                      key={s.id}
                      className="absolute text-2xl pointer-events-none select-none"
                      style={{ left: s.x, top: s.y, transform: "translate(-50%,-50%)", zIndex: 7 }}
                    >
                      {s.emoji}
                    </div>
                  ))}

                  {/* Dashed lines — follow pin positions dynamically */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} xmlns="http://www.w3.org/2000/svg">
                    {([[0,1],[1,2],[2,3],[3,4]] as [number,number][]).map(([a, b]) =>
                      pinPositions[a] && pinPositions[b] ? (
                        <line key={`${a}-${b}`}
                          x1={`${pinPositions[a].x}%`} y1={`${pinPositions[a].y}%`}
                          x2={`${pinPositions[b].x}%`} y2={`${pinPositions[b].y}%`}
                          stroke="#8F1B4B" strokeWidth="1.5" strokeDasharray="6,5" strokeOpacity="0.4"
                        />
                      ) : null
                    )}
                  </svg>

                  {/* Sticky notes — absolutely scattered across a fixed-size canvas that's
                      uniformly scaled to fit, so the scatter layout is identical at every
                      screen size (mobile, tablet, desktop), just smaller. */}
                  <div ref={boardScaleWrapperRef} className="relative w-full" style={{ height: BOARD_DESIGN_HEIGHT * boardScale, zIndex: 2 }}>
                    <div
                      ref={boardContainerRef}
                      className="absolute top-0 left-0"
                      style={{ width: BOARD_DESIGN_WIDTH, height: BOARD_DESIGN_HEIGHT, transform: `scale(${boardScale})`, transformOrigin: "top left" }}
                    >
                      {expertiseItems.map((item, idx) => (
                        <motion.div
                          key={item.n}
                          ref={(el) => { cardRefs.current[idx] = el as HTMLDivElement | null; }}
                          className="absolute"
                          drag={!activeTool && boardScale >= 0.999}
                          dragConstraints={boardContainerRef}
                          dragMomentum={false}
                          dragElastic={0.05}
                          onDrag={updatePinPositions}
                          onDragEnd={updatePinPositions}
                          whileDrag={{ scale: 1.06, zIndex: 20 }}
                          style={{ ...item.pos, width: "190px", rotate: item.rot, cursor: activeTool ? "default" : "grab", zIndex: 2 }}
                        >
                          <div className="rounded-lg p-4 md:hover:scale-[1.04] md:hover:rotate-0 transition-transform duration-200 cursor-default flex flex-col"
                            style={{
                              background: item.bg,
                              boxShadow: "0 8px 28px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.09)",
                              borderTop: `4px solid ${item.border}`,
                            }}
                          >
                            {/* Pin inside card */}
                            <div className="flex justify-center mb-2">
                              <div className="w-4 h-4 rounded-full shadow-md" style={{ background: `radial-gradient(circle at 35% 35%, #fff 0%, ${item.pin} 60%)`, border: `1.5px solid ${item.border}` }} />
                            </div>
                            <p className="text-[11px] font-mono mb-1 text-center" style={{ color: item.text, opacity: 0.5 }}>{item.n}</p>
                            <h3 className="font-bold text-sm leading-tight mb-2 text-center" style={{ color: item.text }}>{item.title}</h3>
                            <p className="text-xs leading-relaxed mb-3 text-center" style={{ color: item.text, opacity: 0.75 }}>{item.desc}</p>
                            {/* Project pills */}
                            <div className="flex flex-wrap gap-1.5 mt-auto justify-center">
                              {item.projects.map(p => (
                                <a key={p} href="#projects"
                                  className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-opacity duration-150 md:hover:opacity-80"
                                  style={{ background: item.pill, color: item.text, border: `1px solid ${item.text}22` }}
                                >
                                  {p}
                                </a>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}

      <section id="tech-stack" className="py-24 px-6 scroll-mt-16 relative overflow-hidden bg-[#D5407E]">

        {/* Grid — fades left, right, bottom borders only */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(to right, transparent, black 42%, black 32%, transparent), linear-gradient(to top, transparent, black 20%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 42%, black 32%, transparent), linear-gradient(to top, transparent, black 20%)",
          }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          {/* Header */}
          <div className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full border border-white/30 text-white/60 text-[10px] tracking-[0.25em] uppercase mb-4 font-medium">
              Technical Stack
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Technologies I Work With</h2>
            <p className="text-white/50 text-sm">Full-stack expertise across modern development, AI, and cloud infrastructure.</p>
          </div>

          {/* Category cards */}
          <TechStackGrid
            categories={[
              { category: "Frontend development",   skills: ["React", "Next.js", "JavaScript", "TypeScript", "HTML5", "CSS3"] },
              { category: "Backend development",    skills: ["Java", "Python", "Spring Boot", "Django", "FastAPI", "REST APIs", "PostgreSQL", "Stripe"] },
              { category: "AI & automation",        skills: ["OpenAI API", "Gemini API", "Prompt engineering", "ManyChat", "n8n"] },
              { category: "Tools & cloud",          skills: ["Git", "GitHub", "Docker", "Figma", "Postman", "Vercel", "Supabase", "Google Apps Script"] },
            ]}
          />
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="px-6 py-24 bg-[#7a1740] scroll-mt-16">
        <div className="max-w-7xl mx-auto w-full">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-16 flex items-end justify-between gap-6 flex-wrap"
          >
            <div>
              <p className="text-white/50 tracking-[0.25em] uppercase text-xs mb-3">My Work</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
                Projects That Define<br />My Journey
              </h2>
              <div className="w-20 h-1 rounded-full mb-4" style={{ background: "#FFB6C1" }} />
              <p className="text-white/50 text-sm max-w-md">A curated collection of full-stack apps, AI tools, and systems built with real-world impact.</p>
            </div>

            {/* See more */}
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border-2 border-white text-white md:hover:bg-white md:hover:text-[#7a1740] transition-all duration-200 md:hover:-translate-y-0.5"
            >
              See All Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </motion.div>

          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <ProjectsMarquee projects={projects.slice(0, 5)} />
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="px-6 py-14 md:py-16 bg-[#7a1740] scroll-mt-16">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">

            {/* Left: heading + form */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.p variants={fadeUp} className="text-white/50 tracking-[0.25em] uppercase text-xs mb-2">Let&apos;s Talk</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-2">Get in Touch</motion.h2>
              <motion.div
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.5, ease: "easeOut" } } }}
                className="w-20 h-1 rounded-full mb-3"
                style={{ background: "#FFB6C1", transformOrigin: "left" }}
              />
              <motion.p variants={fadeUp} className="text-white/50 text-sm mb-6">Have a project in mind or just want to say hello? My inbox is always open.</motion.p>

              <motion.div variants={fadeUp}>
                <ContactForm />
              </motion.div>
            </motion.div>

            {/* Right: quick-contact info */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="flex flex-col items-start gap-4 md:pt-1"
            >

              {/* Name */}
              <motion.p variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold text-white">
                Niña Aurelio
              </motion.p>

              {/* Availability — noticeable pill */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#FFB6C1" }} />
                  <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: "#FFB6C1" }} />
                </span>
                <span className="text-white/80 text-xs sm:text-sm font-medium">Open to remote, onsite, or hybrid opportunities</span>
              </motion.div>

              {/* Services offered */}
              <motion.div variants={fadeUp} className="w-full mt-4">
                <p className="text-white/40 tracking-[0.2em] uppercase text-xs mb-2">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {expertiseItems.map((item) => (
                    <span
                      key={item.n}
                      className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium"
                    >
                      {item.title}
                    </span>
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-2">
                  Don&apos;t see what you need? Reach out — happy to discuss if it aligns with my skill set.
                </p>
              </motion.div>

              <motion.p variants={fadeUp} className="text-white/40 tracking-[0.2em] uppercase text-xs mt-4">Other ways to reach me</motion.p>

              {/* Resume download + email + social profiles */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mt-1">
                <motion.a
                  whileTap={{ scale: 0.96 }}
                  href="/resume.pdf"
                  download="Nina-Aurelio-Resume.pdf"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#8F1B4B] font-semibold rounded-full md:hover:bg-white/90 transition-all duration-200 md:hover:-translate-y-0.5 shadow-lg text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                  Download Resume
                </motion.a>
                <motion.a
                  whileTap={{ scale: 0.96 }}
                  href="mailto:nina.aureliooo@gmail.com"
                  aria-label="Email"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-white text-white md:hover:bg-white md:hover:text-[#7a1740] transition-all duration-200 md:hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </motion.a>
                <motion.a
                  whileTap={{ scale: 0.96 }}
                  href="https://www.linkedin.com/in/nina-andrea-aurelio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-white text-white md:hover:bg-white md:hover:text-[#7a1740] transition-all duration-200 md:hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z" />
                  </svg>
                </motion.a>
                <motion.a
                  whileTap={{ scale: 0.96 }}
                  href="https://github.com/nbaurelio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-white text-white md:hover:bg-white md:hover:text-[#7a1740] transition-all duration-200 md:hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </motion.a>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
