"use client";

import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import { useCanHover } from "@/hooks/useCanHover";

interface TechPillProps {
  tech: string;
  className: string;
  style?: CSSProperties;
  /** Omit this project title from the "used in" list — for a pill already inside that project's own card. */
  excludeTitle?: string;
  label?: string;
}

export default function TechPill({ tech, className, style, excludeTitle, label = "Used in" }: TechPillProps) {
  const canHover = useCanHover();
  const [hovered, setHovered] = useState(false);
  const relatedProjects = projects
    .filter((p) => p.tech.includes(tech) && p.title !== excludeTitle)
    .map((p) => p.title);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => canHover && setHovered(true)}
        onMouseLeave={() => canHover && setHovered(false)}
        className={className}
        style={style}
      >
        {tech}
      </span>
      <AnimatePresence>
        {hovered && relatedProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 w-max max-w-[220px] px-3 py-2 rounded-xl shadow-xl pointer-events-none"
            style={{ background: "#fff", border: "1px solid #FFD6E0" }}
          >
            <p className="text-[9px] uppercase tracking-wide mb-1 font-semibold" style={{ color: "#C94080" }}>
              {label}
            </p>
            <ul className="text-xs font-medium leading-relaxed" style={{ color: "#8F1B4B" }}>
              {relatedProjects.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 w-2 h-2 rotate-45"
              style={{ background: "#fff", borderRight: "1px solid #FFD6E0", borderBottom: "1px solid #FFD6E0" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
