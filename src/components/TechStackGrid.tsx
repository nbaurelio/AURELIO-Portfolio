"use client";

import { useEffect, useState } from "react";
import TechCategoryCard from "./TechCategoryCard";

interface Category {
  category: string;
  skills: string[];
}

export default function TechStackGrid({ categories }: { categories: Category[] }) {
  const totalSkills = categories.reduce((sum, c) => sum + c.skills.length, 0);
  const [globalIndex, setGlobalIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setGlobalIndex(i => (i + 1) % totalSkills);
    }, 700);
    return () => clearInterval(id);
  }, [totalSkills]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map(({ category, skills }, i) => {
        const offset = categories.slice(0, i).reduce((sum, c) => sum + c.skills.length, 0);
        const localIndex = globalIndex - offset;
        const activeIndex = localIndex >= 0 && localIndex < skills.length ? localIndex : -1;
        return (
          <TechCategoryCard key={category} category={category} skills={skills} activeIndex={activeIndex} />
        );
      })}
    </div>
  );
}
