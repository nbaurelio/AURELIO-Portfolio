"use client";

import { useState } from "react";
import type { Project } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import { useCanHover } from "@/hooks/useCanHover";

export default function ProjectsMarquee({ projects }: { projects: Project[] }) {
  const [paused, setPaused] = useState(false);
  const canHover = useCanHover();
  const loop = [...projects, ...projects];

  return (
    <div
      className="marquee-mask overflow-hidden py-12 -my-12"
      onMouseEnter={() => canHover && setPaused(true)}
      onMouseLeave={() => canHover && setPaused(false)}
    >
      <div
        className="marquee-track project-hover-group flex gap-6"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {loop.map((project, i) => (
          <div key={`${project.title}-${i}`} className="shrink-0 w-[280px] sm:w-[320px]">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
