"use client";

import { motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { useCanHover } from "@/hooks/useCanHover";
import TechPill from "./TechPill";

export default function ProjectCard({ project }: { project: Project }) {
  const canHover = useCanHover();
  return (
    <motion.div
      whileHover={canHover ? { y: -10, scale: 1.035, zIndex: 20, transition: { duration: 0.25, ease: "easeOut" } } : undefined}
      className="project-card-item relative h-full rounded-2xl p-6 flex flex-col cursor-default transition-shadow duration-300 md:hover:shadow-[0_20px_45px_rgba(143,27,75,0.35)]"
      style={{ background: "#FFF0F5", border: "1.5px solid #FFD6E0" }}
    >
      {/* Category badge + year */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] text-white"
          style={{ background: "#8F1B4B" }}
        >
          {project.tags}
        </span>
        <span className="text-[10px] font-medium" style={{ color: "#C94080", opacity: 0.6 }}>{project.year}</span>
      </div>

      {/* Title */}
      <h3 className="font-extrabold text-lg mb-2" style={{ color: "#8F1B4B" }}>{project.title}</h3>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#8F1B4B", opacity: 0.65 }}>{project.desc}</p>

      {/* Tech pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tech.map(t => (
          <TechPill
            key={t}
            tech={t}
            excludeTitle={project.title}
            label="Also used in"
            className="px-3 py-1 rounded-full text-xs font-medium cursor-default border border-[#FFB6C1] text-[#C94080] bg-[#FFF8FA] transition-all duration-200 md:hover:scale-105 md:hover:bg-[#8F1B4B] md:hover:text-white md:hover:border-[#8F1B4B]"
          />
        ))}
      </div>

      {/* Links */}
      <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "#FFD6E0" }}>
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-150 md:hover:opacity-70"
            style={{ color: "#8F1B4B" }}
          >
            View Project
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold cursor-default"
            style={{ color: "#8F1B4B", opacity: 0.5 }}
          >
            Confidential
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
        )}

        <div className="flex items-center gap-2">
          {project.appLink && (
            <a
              href={project.appLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} app`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 md:hover:scale-110"
              style={{ color: "#8F1B4B", border: "1px solid #FFB6C1" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </a>
          )}

          {project.facebook && (
            <a
              href={project.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on Facebook`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 md:hover:scale-110"
              style={{ color: "#8F1B4B", border: "1px solid #FFB6C1" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
