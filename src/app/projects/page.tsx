"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { projects } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsPage() {
  return (
    <section className="px-6 pt-32 pb-24 bg-[#7a1740] min-h-screen relative overflow-hidden">

      {/* Grid — matches the dot-grid pattern used on the Expertise / Tech Stack sections */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 12%, black 70%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 12%, black 70%, transparent)",
        }}
      />

      {/* Sparkle decorations — matches the About / Expertise sections */}
      <motion.svg
        className="absolute top-24 right-10 text-white w-10 h-10 pointer-events-none hidden sm:block"
        viewBox="0 0 24 24" fill="currentColor"
        animate={{ scale: [1, 1.35, 0.85, 1.2, 1], opacity: [0.5, 0.9, 0.3, 0.7, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M12 0 C12 0 10.5 10.5 0 12 C10.5 13.5 12 24 12 24 C12 24 13.5 13.5 24 12 C13.5 10.5 12 0 12 0Z"/>
      </motion.svg>
      <motion.svg
        className="absolute top-40 right-32 text-white w-5 h-5 pointer-events-none hidden lg:block"
        viewBox="0 0 24 24" fill="currentColor"
        animate={{ scale: [1, 1.5, 0.7, 1.3, 1], opacity: [0.3, 0.7, 0.15, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <path d="M12 0 C12 0 10.5 10.5 0 12 C10.5 13.5 12 24 12 24 C12 24 13.5 13.5 24 12 C13.5 10.5 12 0 12 0Z"/>
      </motion.svg>

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link
            href="/#projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 bg-white/10 text-white/60 md:hover:text-white md:hover:bg-white/20 md:hover:border-white/40 text-sm font-medium mb-8 transition-all duration-200 md:hover:-translate-x-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mb-16"
        >
          <p className="text-white/50 tracking-[0.25em] uppercase text-xs mb-3">My Work</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            All Projects
          </h1>
          <motion.div
            className="h-1 rounded-full mb-4"
            style={{ background: "#FFB6C1", transformOrigin: "left" }}
            initial={{ scaleX: 0, width: 80 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          />
          <p className="text-white/50 text-sm max-w-md">Every full-stack app, AI tool, and system I&apos;ve built, from academic projects to production systems.</p>
        </motion.div>

        {/* Grid — each card animates in as its row scrolls into view */}
        <div className="project-hover-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
