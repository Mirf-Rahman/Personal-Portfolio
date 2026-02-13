"use client";

import { useRef } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useMotionTemplate, 
  useMotionValue 
} from "framer-motion";
import { WordRotate } from "@/components/ui/word-rotate";
import { ShaderBackground } from "@/components/ui/shader-background";
import { ArrowRight } from "lucide-react";

interface SyntheticHeroProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  passionateText?: string;
  rotatingWords?: string[];
  traits?: string[];
  ctaButtons?: Array<{ text: string; href?: string; primary?: boolean; isAnchor?: boolean }>;
  microDetails?: Array<string>;
}

// Full Container Stagger
const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

// Item Fade Up
const heroItemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// Name Stagger
const nameContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// Name Line Animation
const nameLineVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
  },
};

// Traits Stagger
const traitContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const traitItemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function SyntheticHero({
  title = "Mir Faiyazur Rahman",
  description = "Computer Science Student & Full Stack Developer",
  passionateText = "I'm a passionate",
  rotatingWords = ["Full Stack Developer", "Problem Solver", "Creative Thinker"],
  traits = [],
  ctaButtons = [
    { text: "Explore the Canvas", href: "#explore", primary: true },
    { text: "Learn More", href: "#learn-more" },
  ],
}: SyntheticHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollY } = useScroll();
  const shaderOpacity = useTransform(scrollY, [0, 800, 2000], [1, 0.6, 0]);

  // Split name lines
  const nameWords = title.split(" ");
  const firstName = nameWords.slice(0, -1).join(" ");
  const lastName = nameWords[nameWords.length - 1];

  // Mouse Tracking for Spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Anchor Scrolling Fix
  const handleAnchorClick = (href: string) => {
    const lenis = (window as any).__lenis;
    const el = document.querySelector(href);
    if (el && lenis) {
      lenis.scrollTo(el, { offset: -80, duration: 1.2 });
    } else if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden pt-0 pointer-events-none"
    >
      {/* Shader Background */}
      <motion.div 
        style={{ opacity: shaderOpacity, pointerEvents: "none" }} 
        className="fixed inset-0 z-0 h-full w-full"
      >
        <ShaderBackground />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-6xl mx-auto pointer-events-auto mt-[-5vh]">
        
        {/* Main Content Container */}
        <motion.div
          className="flex flex-col items-center"
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible" // Re-triggers on scroll
          viewport={{ once: false, amount: 0.15 }}
        >
          
          {/* ===== SPOTLIGHT NAME ===== */}
          <motion.div 
            className="mb-4 md:mb-6 relative group" 
            variants={heroItemVariants}
            onMouseMove={handleMouseMove}
          >
            {/* Base Layer: Animated Gradient Text */}
            <motion.h1
              className="font-display font-bold tracking-tight leading-[1.15] text-center cursor-default relative z-10 text-5xl sm:text-7xl md:text-8xl lg:text-9xl hero-name-gradient"
              variants={nameLineVariants}
            >
              {firstName}<br/>{lastName}
            </motion.h1>

            {/* Spotlight Layer: Brighter White/Cyan Text (masked) */}
            <motion.h1
              className="font-display font-bold tracking-tight leading-[1.15] text-center cursor-default absolute inset-0 z-20 pointer-events-none text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              aria-hidden="true"
              style={{
                maskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
                WebkitMaskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
              }}
              variants={nameLineVariants}
            >
              {firstName}<br/>{lastName}
            </motion.h1>
          </motion.div>

          {/* ===== SUBTITLE ===== */}
          <motion.div variants={heroItemVariants} className="mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-3">
              <motion.div 
                className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-cyan-500/40"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ transformOrigin: "right" }}
              />
              <p className="text-sm sm:text-base md:text-lg font-light tracking-[0.15em] text-slate-400 uppercase">
                {description}
              </p>
              <motion.div 
                className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-cyan-500/40"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </motion.div>

          {/* ===== TRAITS ===== */}
          {traits.length > 0 && (
            <motion.div
              className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-2.5 px-2"
              variants={heroItemVariants}
            >
              {traits.map((trait, i) => (
                <span
                  key={trait}
                  className="px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium 
                    bg-white/[0.04] backdrop-blur-md border border-white/[0.08] 
                    text-slate-300/90 hover:text-cyan-200 hover:border-cyan-500/30
                    hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]
                    hover:scale-105
                    transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-cyan-400/60 mr-1.5 align-middle" />
                  {trait}
                </span>
              ))}
            </motion.div>
          )}

          {/* ===== ROTATING WORDS ===== */}
          <motion.div
            variants={heroItemVariants}
            className="mb-8 flex flex-col items-center justify-center gap-0.5 text-base sm:text-lg md:text-xl font-light text-slate-400/80 px-4"
          >
            <span>{passionateText}</span>
            <WordRotate
              words={rotatingWords}
              className="font-mono font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#38bdf8] to-[#06b6d4] px-1 text-lg sm:text-xl md:text-2xl"
              duration={3000}
            />
          </motion.div>

          {/* ===== CTA BUTTONS ===== */}
          <motion.div
            variants={heroItemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4"
          >
            {ctaButtons.map((button, index) => {
              const isPrimary = button.primary ?? index === 0;

              const primaryClasses = `
                group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30
                transition-all duration-300 cursor-pointer overflow-hidden
                hover:from-cyan-400 hover:to-blue-400
              `;

              const secondaryClasses = `
                group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium
                bg-white/[0.04] backdrop-blur-sm border border-white/[0.1] text-slate-300
                hover:bg-white/[0.08] hover:border-white/15 hover:text-white
                transition-all duration-300 cursor-pointer
              `;

              const classes = isPrimary ? primaryClasses : secondaryClasses;

              if (button.href) {
                const href = button.href;
                if (button.isAnchor || href.startsWith("#")) {
                  return (
                    <motion.button
                      key={index}
                      className={classes}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleAnchorClick(href);
                      }}
                    >
                      {isPrimary && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      )}
                      <span className="relative flex items-center gap-2">
                        {button.text}
                        {!isPrimary && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </motion.button>
                  );
                }
                
                return (
                  <motion.a 
                    key={index} 
                    href={href} 
                    className={classes}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isPrimary && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    <span className="relative flex items-center gap-2">
                      {button.text}
                      {!isPrimary && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                    </span>
                  </motion.a>
                );
              }

              return (
                <motion.button 
                  key={index} 
                  className={classes}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isPrimary && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                  <span className="relative flex items-center gap-2">
                    {button.text}
                    {!isPrimary && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
