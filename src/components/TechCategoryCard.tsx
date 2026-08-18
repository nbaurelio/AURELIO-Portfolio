"use client";

export default function TechCategoryCard({
  category,
  skills,
  activeIndex,
}: {
  category: string;
  skills: string[];
  activeIndex: number;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      style={{ background: "#FFF0F5", border: "1.5px solid #FFD6E0" }}
    >
      <h3 className="font-extrabold text-[#8F1B4B] text-sm mb-3 tracking-wide">{category}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={skill}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-default border-[1.5px] transition-all duration-500 md:hover:scale-105 md:hover:bg-[#8F1B4B] md:hover:text-white md:hover:border-[#8F1B4B] ${
              i === activeIndex
                ? "scale-105 bg-[#8F1B4B] text-white border-[#8F1B4B]"
                : "border-[#FFB6C1] text-[#C94080] bg-[#FFF8FA]"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
