"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Nav links with translation keys instead of hardcoded labels
const navLinkKeys = [
  { href: "/#projects", labelKey: "projects", isAnchor: true },
  { href: "/#skills", labelKey: "skills", isAnchor: true },
  { href: "/#experience", labelKey: "experience", isAnchor: true },
  { href: "/#education", labelKey: "education", isAnchor: true },
  { href: "/#hobbies", labelKey: "hobbies", isAnchor: true },
  { href: "/testimonials", labelKey: "testimonials", isAnchor: false },
  { href: "/contact", labelKey: "contact", isAnchor: false },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const navbarBlur = useTransform(scrollY, [0, 100], [0, 12]);
  
  // Use useMotionTemplate to properly interpolate motion values
  const backgroundColor = useMotionTemplate`rgba(2, 6, 23, ${navbarOpacity})`;
  const backdropFilter = useMotionTemplate`blur(${navbarBlur}px)`;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  // Handle navigation for all links
  const handleNavigation = (href: string, isAnchor: boolean) => {
    if (isAnchor && pathname === "/") {
      const selector = href.startsWith("/#") ? href.slice(1) : href;
      const element = document.querySelector(selector);
      const lenis = (window as any).__lenis;
      if (lenis && element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 80;
        lenis.scrollTo(targetY, { 
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        element?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (isAnchor) {
      router.push(href);
    } else {
      // Page navigation: from / client router fails; use full navigation
      if (pathname === "/") {
        window.location.href = href;
      } else {
        router.push(href);
      }
    }
  };



  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-[9999]"
      >
        <motion.div
          style={{
            backgroundColor,
            backdropFilter,
          }}
          className="transition-colors duration-300 border-b border-white/5"
        >
          <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  const lenis = (window as any).__lenis;
                  const scrollDurationMs = 1200;
                  if (lenis) {
                    lenis.scrollTo(0, {
                      duration: 1.2,
                      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('portfolio:show-hero'));
                  }, scrollDurationMs + 50);
                }
              }}
            >
              <motion.span
                className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Mirf.dev
              </motion.span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-1">
              {navLinkKeys.map((link) => {
                const baseClass =
                  "relative px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group cursor-pointer";
                if (link.isAnchor) {
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleNavigation(link.href, true)}
                      className={baseClass}
                    >
                      {t(link.labelKey)}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 group-hover:w-3/4 transition-all duration-300" />
                    </button>
                  );
                }
                if (pathname === "/") {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className={baseClass}
                    >
                      {t(link.labelKey)}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 group-hover:w-3/4 transition-all duration-300" />
                    </a>
                  );
                }
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href, false)}
                    className={baseClass}
                  >
                    {t(link.labelKey)}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 group-hover:w-3/4 transition-all duration-300" />
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                <LanguageSwitcher />
                {isPending ? (
                  <div className="h-9 w-20 bg-slate-800/50 animate-pulse rounded-lg" />
                ) : isAdmin ? (
                  <>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
                      {t('admin')}
                    </span>
                    <button
                      onClick={() => router.push("/admin/dashboard")}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium hover:bg-white/10 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t('dashboard')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 text-sm font-medium text-red-400 hover:bg-red-500/20"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </>
                ) : pathname === "/" ? (
                  <a
                    href="/login"
                    className="inline-flex h-9 items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-6 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                  >
                    {t('login')}
                  </a>
                ) : (
                  <button
                    onClick={() => router.push("/login")}
                    className="inline-flex h-9 items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-6 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                  >
                    {t('login')}
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-slate-950/95 backdrop-blur-xl border-l border-white/10 lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="text-lg font-bold">{t('menu')}</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 py-4">
                  {navLinkKeys.map((link) => {
                    const navClass =
                      "flex items-center w-full text-left px-6 py-4 text-lg font-medium text-slate-400 hover:text-white hover:bg-white/5";
                    if (link.isAnchor) {
                      return (
                        <button
                          key={link.href}
                          onClick={() => {
                            handleNavigation(link.href, true);
                            setIsMobileMenuOpen(false);
                          }}
                          className={navClass}
                        >
                          {t(link.labelKey)}
                        </button>
                      );
                    }
                    if (pathname === "/") {
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={navClass}
                        >
                          {t(link.labelKey)}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={link.href}
                        onClick={() => {
                          handleNavigation(link.href, false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={navClass}
                      >
                        {t(link.labelKey)}
                      </button>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-white/10 space-y-4">
                  <div className="flex justify-center">
                    <LanguageSwitcher />
                  </div>
                  {!isPending && !isAdmin &&
                    (pathname === "/" ? (
                      <a
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center w-full h-12 rounded-lg border border-cyan-500/30 bg-cyan-500/10 font-medium text-cyan-400"
                      >
                        {t('login')}
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          router.push("/login");
                        }}
                        className="flex items-center justify-center w-full h-12 rounded-lg border border-cyan-500/30 bg-cyan-500/10 font-medium text-cyan-400"
                      >
                        {t('login')}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16 md:h-20" />
    </>
  );
}
