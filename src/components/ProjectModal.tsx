"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/data/projects";
import TechPill from "./TechPill";

function isGitHub(url: string) {
  return url.includes("github.com");
}

const GITHUB_ICON = (
  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
);

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(45,10,25,0.6)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
          style={{ background: "#FFF8FA", border: "1.5px solid #FFD6E0" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center md:hover:bg-white transition-colors z-10"
            style={{ color: "#8F1B4B", background: "#FFE0EC" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 sm:p-7">
            {/* Category + year */}
            <div className="flex items-center gap-2 mb-4 pr-8">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] text-white"
                style={{ background: "#8F1B4B" }}
              >
                {project.tags}
              </span>
              <span className="text-xs font-medium" style={{ color: "#C94080", opacity: 0.7 }}>{project.year}</span>
            </div>

            {/* Title */}
            <h2 className="font-extrabold text-2xl mb-3" style={{ color: "#8F1B4B" }}>{project.title}</h2>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#8F1B4B", opacity: 0.8 }}>{project.desc}</p>

            {/* Tech stack */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "#C94080" }}>
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <TechPill
                    key={t}
                    tech={t}
                    excludeTitle={project.title}
                    label="Also used in"
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-default border border-[#FFB6C1] text-[#C94080] bg-white transition-all duration-200 md:hover:scale-105 md:hover:bg-[#8F1B4B] md:hover:text-white md:hover:border-[#8F1B4B]"
                  />
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "#C94080" }}>
                Links
              </p>
              <div className="flex flex-wrap gap-2">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 md:hover:-translate-y-0.5 shadow-sm"
                    style={{ background: "#8F1B4B" }}
                  >
                    {isGitHub(project.link) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        {GITHUB_ICON}
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
                    {isGitHub(project.link) ? "View on GitHub" : "View Project"}
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ background: "#FFE0EC", color: "#8F1B4B", opacity: 0.6 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    Confidential
                  </span>
                )}

                {project.appLink && (
                  <a
                    href={project.appLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 md:hover:-translate-y-0.5"
                    style={{ border: "1px solid #FFB6C1", color: "#8F1B4B", background: "white" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
                    </svg>
                    Live App
                  </a>
                )}

                {project.facebook && (
                  <a
                    href={project.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 md:hover:-translate-y-0.5"
                    style={{ border: "1px solid #FFB6C1", color: "#8F1B4B", background: "white" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
                    </svg>
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
