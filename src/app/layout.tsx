import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Niña Aurelio | Full-Stack Developer & AI Automation Builder";
const description =
  "Portfolio of Niña Andrea Aurelio, a full-stack developer and AI automation builder based in Manila, Philippines. Building scalable web and mobile apps, AI-driven tools, and systems with real results across fintech, insurance, and healthcare.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Niña Aurelio",
    "Full-Stack Developer",
    "AI Automation Builder",
    "Software Engineer Philippines",
    "React Developer",
    "Web Developer Manila",
  ],
  authors: [{ name: "Niña Andrea Aurelio" }],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Niña Andrea Aurelio",
  jobTitle: "Full-Stack Developer & AI Automation Builder",
  email: "mailto:nina.aureliooo@gmail.com",
  sameAs: ["https://www.linkedin.com/in/nina-andrea-aurelio", "https://github.com/nbaurelio"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manila",
    addressCountry: "PH",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of the Philippines Manila",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
