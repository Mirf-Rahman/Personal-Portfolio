"use client";

import { motion, type Variants } from "framer-motion";

type AnimationVariant = 
  | "fadeIn" 
  | "blurIn" 
  | "slideUp" 
  | "slideDown" 
  | "slideLeft" 
  | "slideRight"
  | "scaleUp";

type AnimationType = "text" | "word" | "character";

interface TextAnimateProps {
  children: string;
  className?: string;
  segmentClassName?: string;
  delay?: number;
  duration?: number;
  by?: AnimationType;
  animation?: AnimationVariant;
  once?: boolean;
  startOnView?: boolean;
}

const defaultVariants: Record<AnimationVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  blurIn: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
};

const staggerTimings: Record<AnimationType, number> = {
  text: 0.06,
  word: 0.05,
  character: 0.03,
};

export function TextAnimate({
  children,
  className = "",
  segmentClassName = "",
  delay = 0,
  duration = 0.5,
  by = "word",
  animation = "slideUp",
  once = true,
  startOnView = true,
}: TextAnimateProps) {
  const segments = by === "character" 
    ? children.split("") 
    : by === "word" 
    ? children.split(" ") 
    : [children];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerTimings[by],
        delayChildren: delay,
      },
    },
  };

  const itemVariants = defaultVariants[animation];

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      initial="hidden"
      whileInView={startOnView ? "visible" : undefined}
      animate={!startOnView ? "visible" : undefined}
      viewport={startOnView ? { once, margin: "-50px" } : undefined}
      variants={containerVariants}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          className={`inline-block ${segmentClassName}`}
          variants={itemVariants}
          transition={{ duration, ease: "easeOut" }}
        >
          {segment}
          {by === "word" && index < segments.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Typewriter effect component
interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
}

export function Typewriter({
  text,
  className = "",
  delay = 0,
  speed = 0.05,
  cursor = true,
}: TypewriterProps) {
  const characters = text.split("");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
      },
    },
  };

  const characterVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={characterVariants}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          className="inline-block w-[3px] h-[1em] bg-primary ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.span>
  );
}
