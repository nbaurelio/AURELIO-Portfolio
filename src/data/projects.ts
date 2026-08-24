export interface Project {
  tags: string;
  title: string;
  year: string;
  desc: string;
  tech: string[];
  // Omit to mark the project confidential — the card shows a "Confidential"
  // badge instead of a "View Project" link.
  link?: string;
  // Optional secondary links, each shown as a small icon button next to "View Project".
  facebook?: string;
  appLink?: string;
}

export const projects: Project[] = [
  {
    tags: "HEALTHCARE • FULL-STACK",
    title: "C.U.R.A. 2.0",
    year: "2026",
    desc: "Responsive patient referral management system for UP Manila College of Dentistry, streamlining referral submission, real-time status tracking, and role-based workflows.",
    tech: ["TypeScript", "React", "Supabase", "Vercel"],
    link: "https://drive.google.com/file/d/1gSAZptzKZrdOOI4K8D2FyH8U4g43ldgb/view?usp=sharing",
    appLink: "https://drive.google.com/file/d/11-Zc1p-RfibfVyn4QK93xmZKul2d9jw6/view?usp=sharing",
  },
  {
    tags: "HEALTHCARE • MOBILE",
    title: "RadDesk",
    year: "2025",
    desc: "A Responsive radiology information system for secure DICOM image management, remote reading, telehealth integration, and automated reporting workflows.",
    tech: ["TypeScript", "React", "Supabase", "Vercel"],
    link: "https://raddeskph.com/",
    facebook: "https://facebook.com/quintaramed",
    appLink: "https://app.raddeskph.com/",
  },
  {
    tags: "AI • AUTOMATION",
    title: "AI Document Summarizer",
    year: "2025",
    desc: "AI-powered document summarizer using Gemini API that reduced manual review time by 60%.",
    tech: ["Python", "Gemini API", "Supabase", "Vercel"],
    link: "https://github.com/nbaurelio/AI-Document-Summarizer",
  },
  {
    tags: "AI • SALES • AUTOMATION",
    title: "Sales Automation Platform",
    year: "2025",
    desc: "Multi-channel AI sales automation platform automating lead capture, follow-ups, and live agent routing across web, email, and phone. Improved response efficiency by 50%.",
    tech: ["ManyChat", "n8n", "Gemini API", "WordPress", "PHP", "WooCommerce"],
    link: "https://salesmaximizer.tech/",
    appLink: "https://xtremesuccess.technology/",
  },
  {
    tags: "ACADEMIC • FULL-STACK",
    title: "Special Problem Info System (S.P.I.S.)",
    year: "2025",
    desc: "A web platform for UP Manila's DPSM department to archive and manage undergraduate research submissions, with role-based access for guests, faculty advisers, and staff.",
    tech: ["Django", "PostgreSQL", "HTML", "CSS", "Java","Google SSO Integration", "Python", "DSpace scraping"],
    link: "https://github.com/smpuang/128SPIS.git",
    appLink: "https://drive.google.com/file/d/1rUO_3yeHlgMNO_LwJOZsxbXRrCt3IzCo/view?usp=sharing",
  },
  {
    tags: "E-COMMERCE • FULL-STACK",
    title: "Shopping Website",
    year: "2023",
    desc: "Shopping website with add-to-cart, checkout, and product management features for 15+ products.",
    tech: ["Spring Boot", "Java", "PostgreSQL", "HTML", "CSS"],
  },
  {
    tags: "SYSTEMS • INVENTORY",
    title: "Cafeteria Inventory System",
    year: "2022",
    desc: "Live inventory tracking system for a cafeteria with 20+ inventory items.",
    tech: ["Python", "HTML", "CSS", "PostgreSQL"],
    link: "https://drive.google.com/file/d/1wCdr6igBXb0e4HRuAiOegiaCdNSyg2UH/view?usp=sharing",
    appLink: "https://github.com/cidivinag/CMSC127_CoffeeShop_System.git",
  },
];
