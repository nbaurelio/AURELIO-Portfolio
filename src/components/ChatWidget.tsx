"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "model";
  text: string;
}

const GREETING = "Hi, BFF! 👋 Ask me anything about my background, skills, and projects (and a fun fact or two, if you're curious). What would you like to know?";

const SUGGESTED_QUESTIONS = [
  "What technologies do you work with?",
  "Are you available for new opportunities?",
  "What kind of role are you looking for?",
  "What projects have you worked on?",
  "Can I see your resume?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCallout, setShowCallout] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Nudge first-time visitors toward the chatbot: pop a callout a couple
  // seconds after the button lands, then auto-dismiss if it's ignored.
  useEffect(() => {
    const showTimer = setTimeout(() => setShowCallout(true), 2800);
    const hideTimer = setTimeout(() => setShowCallout(false), 10000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || loading) return;

    const history = messages;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function openChat() {
    setOpen(true);
    setShowCallout(false);
  }

  return (
    <>
      {/* Callout nudge — points visitors to the chatbot */}
      <AnimatePresence>
        {showCallout && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[60] max-w-[210px] pl-4 pr-2.5 py-3 rounded-2xl rounded-br-sm shadow-xl flex items-start gap-1.5"
            style={{ background: "#FFF8FA", border: "1.5px solid #FFD6E0" }}
          >
            <button
              type="button"
              onClick={openChat}
              className="text-[#8F1B4B] text-xs font-medium leading-snug flex-1 text-left"
            >
              Got questions? Chat with me — I answer instantly! 👋
            </button>
            <button
              type="button"
              onClick={() => setShowCallout(false)}
              aria-label="Dismiss"
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[#8F1B4B]/40 md:hover:text-[#8F1B4B] md:hover:bg-[#FFD6E0]/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.5 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-lg md:hover:scale-105 transition-transform duration-200"
        style={{ background: "linear-gradient(135deg, #8F1B4B 0%, #C94080 100%)" }}
      >
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
            style={{ background: "#FFB6C1" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[60] w-[calc(100vw-3rem)] sm:w-96 h-[min(28rem,70vh)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: "#FFF8FA", border: "1.5px solid #FFD6E0" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "linear-gradient(135deg, #8F1B4B 0%, #C94080 100%)" }}>
              <div className="relative w-9 h-9 shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40">
                  <img src="/about-photo.jpeg" alt="Niña Andrea Aurelio" className="w-full h-full object-cover" />
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: "#90EE90" }}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Niña Andrea Aurelio</p>
                <p className="text-white/70 text-[10px]">🟢 Online now</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              <div
                className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm self-start"
                style={{ background: "#FFE0EC", color: "#8F1B4B" }}
              >
                {GREETING}
              </div>
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-full bg-white text-xs font-medium md:hover:bg-[#FFE0EC] transition-colors disabled:opacity-50"
                      style={{ border: "1px solid #FFD6E0", color: "#C94080" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words ${
                    m.role === "user" ? "self-end rounded-tr-sm font-medium" : "self-start rounded-tl-sm"
                  }`}
                  style={m.role === "user" ? { background: "#8F1B4B", color: "#fff" } : { background: "#FFE0EC", color: "#8F1B4B" }}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="self-start flex items-center gap-1 px-3.5 py-2.5 rounded-2xl rounded-tl-sm" style={{ background: "#FFE0EC" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#8F1B4B99" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
              {error && <p className="text-[#C94080] text-xs px-1">{error}</p>}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 shrink-0" style={{ borderTop: "1px solid #FFD6E0" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                maxLength={500}
                disabled={loading}
                className="flex-1 min-w-0 px-3.5 py-2 bg-white rounded-full text-sm placeholder-[#8F1B4B]/35 focus:outline-none transition-colors disabled:opacity-50"
                style={{ border: "1px solid #FFD6E0", color: "#8F1B4B" }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                style={{ background: "#8F1B4B" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
