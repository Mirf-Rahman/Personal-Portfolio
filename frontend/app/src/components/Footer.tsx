"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface ContactInfo {
  email: string;
  linkedIn?: string;
  github?: string;
}

const DEFAULT_LINKEDIN =
  "https://www.linkedin.com/in/faiyazur-rahman-mir-828173309/";
const DEFAULT_GITHUB = "https://github.com/Mirf-Rahman";
const DEFAULT_EMAIL = "mirfaiyazrahman@gmail.com";

// Footer links with translation keys
const footerLinkKeys = [
  { href: "/#projects", labelKey: "projects" },
  { href: "/#skills", labelKey: "skills" },
  { href: "/#experience", labelKey: "experience" },
  { href: "/contact", labelKey: "contact" },
  { href: "/#testimonials", labelKey: "testimonials" },
];

export function Footer() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const pathname = usePathname();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    fetchApi<ContactInfo | null>("/api/contact-info")
      .then((data) => setContactInfo(data ?? null))
      .catch(() => setContactInfo(null));
  }, []);

  const socialLinks = [
    {
      href: contactInfo?.github?.trim() || DEFAULT_GITHUB,
      icon: Github,
      label: "GitHub",
      hoverColor: "hover:text-white hover:bg-gray-800",
    },
    {
      href: contactInfo?.linkedIn?.trim() || DEFAULT_LINKEDIN,
      icon: Linkedin,
      label: "LinkedIn",
      hoverColor: "hover:text-white hover:bg-blue-600",
    },
    {
      href: `mailto:${contactInfo?.email?.trim() || DEFAULT_EMAIL}`,
      icon: Mail,
      label: "Email",
      hoverColor: "hover:text-white hover:bg-cyan-600",
    },
  ];

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-background to-muted/20">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content - Single Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          {/* Brand */}
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold gradient-text-cyan">MFR</span>
          </Link>

          {/* Quick Links - Center */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinkKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Social Links - Right */}
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <motion.div
                key={social.label}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={social.href}
                  target={
                    social.href.startsWith("mailto") ? undefined : "_blank"
                  }
                  rel={
                    social.href.startsWith("mailto")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  aria-label={social.label}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-muted-foreground transition-all ${social.hoverColor}`}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              {tFooter("copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {tFooter("designedBy")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
