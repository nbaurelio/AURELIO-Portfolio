"use client";

import { useEffect, useState } from "react";

interface Segment {
  text: string;
  color?: string;
}

export default function TypewriterText({
  segments,
  speed = 35,
  startDelay = 0,
}: {
  segments: Segment[];
  speed?: number;
  startDelay?: number;
}) {
  const full = segments.map(s => s.text).join("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      let i = 0;
      const tick = () => {
        i++;
        setCount(i);
        if (i < full.length) timer = setTimeout(tick, speed);
      };
      tick();
    }, startDelay);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, [full, speed, startDelay]);

  const done = count >= full.length;

  return (
    <>
      {segments.map((seg, idx) => {
        const consumedBefore = segments.slice(0, idx).reduce((sum, s) => sum + s.text.length, 0);
        const take = Math.max(0, Math.min(seg.text.length, count - consumedBefore));
        if (take === 0) return null;
        return (
          <span key={idx} style={seg.color ? { color: seg.color } : undefined}>
            {seg.text.slice(0, take)}
          </span>
        );
      })}
      <span
        aria-hidden
        className="typewriter-cursor inline-block w-[2px] h-[0.85em] align-middle ml-0.5 bg-current"
        style={{ opacity: done ? undefined : 1 }}
      />
    </>
  );
}
