"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  {
    href: "https://github.com/Mirf-Rahman",
    icon: Github,
    label: "GitHub",
    hoverColor: "hover:text-white hover:bg-gray-800",
  },
  {
    href: "https://www.linkedin.com/in/faiyazur-rahman-mir-828173309",
    icon: Linkedin,
    label: "LinkedIn",
    hoverColor: "hover:text-white hover:bg-blue-600",
  },
  {
    href: "mailto:mirfaiyazrahman@gmail.com",
    icon: Mail,
    label: "Email",
    hoverColor: "hover:text-white hover:bg-cyan-600",
  },
];

// Footer links with translation keys
const footerLinkKeys = [
  { href: "/#projects", labelKey: "projects" },
  { href: "/#skills", labelKey: "skills" },
  { href: "/#experience", labelKey: "experience" },
  { href: "/contact", labelKey: "contact" },
  { href: "/testimonials", labelKey: "testimonials" },
];

export function Footer() {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  
  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-background to-muted/20">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold gradient-text-cyan">
                Mirf.dev
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {tFooter('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              {tFooter('quickLinks')}
            </h3>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
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
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{tFooter('connect')}</h3>
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {tFooter('copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {tFooter('designedBy')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

