"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Expertise", href: "/#expertise" },
  { label: "Tech Stack", href: "/#tech-stack" },
  { label: "Projects", href: "/#projects" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.85 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.split("#")[1]);
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "0px 0px -50% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  const linkColor = scrolled ? "#111827" : "rgba(255,255,255,0.6)";
  const linkActiveColor = scrolled ? "#111827" : "#ffffff";
  const barColor = scrolled ? "#8F1B4B" : "#ffffff";

  return (
    <nav
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      }}
      className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
    >
      <div className="w-full px-6 lg:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/#home" className="font-extrabold text-3xl tracking-tight">
          <span style={{ color: scrolled ? "#111827" : "#ffffff", transition: "color 0.4s" }}>
            Aurelio
          </span>
          <span style={{ color: scrolled ? "#8F1B4B" : "#FFB6C1", transition: "color 0.4s" }}>.</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const id = link.href.split("#")[1];
            const isActive = activeSection === id;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    color: isActive ? linkActiveColor : linkColor,
                    transition: "color 0.3s",
                  }}
                  className="relative pb-1 hover:opacity-100"
                  onMouseEnter={e => (e.currentTarget.style.color = linkActiveColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = isActive ? linkActiveColor : linkColor)}
                >
                  {link.label}
                  <span
                    style={{
                      backgroundColor: barColor,
                      width: isActive ? "100%" : "0%",
                      transition: "width 0.3s, background-color 0.4s",
                    }}
                    className="absolute bottom-0 left-0 h-[2px]"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Contact Me button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 1.2 }}
          className="hidden md:block"
        >
          <Link
            href="/#contact"
            className="relative inline-flex items-center px-6 py-2.5 rounded-full font-semibold text-sm overflow-hidden hover:scale-105 transition-transform duration-200 shadow-lg"
            style={
              scrolled
                ? { backgroundImage: "linear-gradient(135deg, #8F1B4B 0%, #C94080 100%)", color: "#ffffff" }
                : { backgroundImage: "linear-gradient(135deg, #ffffff 0%, #FFD6E0 100%)", color: "#8F1B4B" }
            }
          >
            {/* Shine sweep */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.75) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "150%"] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", repeatDelay: 2.2 }}
            />
            <span className="relative z-10">Contact Me</span>
          </Link>
        </motion.div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ backgroundColor: scrolled ? "#111827" : "#ffffff", transition: "background-color 0.4s" }}
              className={`block w-6 h-0.5 transition-transform duration-300 ${
                i === 0 && menuOpen ? "rotate-45 translate-y-2" :
                i === 1 && menuOpen ? "opacity-0" :
                i === 2 && menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={
              scrolled
                ? { type: "spring", bounce: 0.5, duration: 0.6 }
                : { duration: 0.2, ease: "easeOut" }
            }
            style={{
              backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(143,27,75,0.95)",
            }}
            className="md:hidden overflow-hidden"
          >
            <ul
              style={{ borderTopColor: scrolled ? "#f3f4f6" : "rgba(255,255,255,0.1)" }}
              className="flex flex-col border-t px-6 py-4 gap-4 text-sm font-medium"
            >
              {navLinks.map((link) => {
                const id = link.href.split("#")[1];
                const isActive = activeSection === id;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        color: isActive
                          ? (scrolled ? "#111827" : "#ffffff")
                          : (scrolled ? "#6b7280" : "rgba(255,255,255,0.6)"),
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="relative inline-flex px-5 py-2 rounded-full text-sm font-semibold overflow-hidden shadow-md"
                  style={
                    scrolled
                      ? { backgroundImage: "linear-gradient(135deg, #8F1B4B 0%, #C94080 100%)", color: "#ffffff" }
                      : { backgroundImage: "linear-gradient(135deg, #ffffff 0%, #FFD6E0 100%)", color: "#8F1B4B" }
                  }
                >
                  <motion.span
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.75) 50%, transparent 70%)" }}
                    animate={{ x: ["-100%", "150%"] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", repeatDelay: 2.2 }}
                  />
                  <span className="relative z-10">Contact Me</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
