"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";

type Status = "idle" | "submitting" | "success" | "error";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot — a real visitor never fills this hidden field, bots often do.
    if (honeypot) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      // FormData (not JSON) — avoids the CORS preflight that Web3Forms doesn't answer for cross-origin JSON requests.
      const formData = new FormData();
      formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "");
      formData.append("subject", `New message from ${name} via portfolio site`);
      formData.append("from_name", name);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — please try again.");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm"
      >
        Thanks for reaching out! Your message has been sent — I&apos;ll get back to you soon.
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={stagger}
      className="flex flex-col gap-3 text-left"
    >
      {/* Honeypot — hidden from real visitors, catches bots */}
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      <motion.input
        variants={fadeUp}
        type="text"
        required
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-5 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
      />
      <motion.input
        variants={fadeUp}
        type="email"
        required
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-5 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
      />
      <motion.textarea
        variants={fadeUp}
        required
        rows={4}
        placeholder="Your Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-5 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors resize-none"
      />

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#FFB6C1] text-sm"
        >
          {errorMessage}
        </motion.p>
      )}

      <motion.button
        variants={fadeUp}
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-3 bg-white text-[#8F1B4B] font-semibold rounded-xl md:hover:bg-white/90 transition-all duration-200 md:hover:-translate-y-0.5 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </motion.button>
    </motion.form>
  );
}
