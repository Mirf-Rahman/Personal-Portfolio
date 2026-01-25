"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type CharacterProps = {
  char: string;
  index: number;
  total: number;
  scrollYProgress: any;
  className?: string;
};

export const ScrollCharacter = ({
  char,
  index,
  total,
  scrollYProgress,
  className,
}: CharacterProps) => {
  const isSpace = char === " ";
  // Create a staggered effect based on index (0 to 1 range across the string)
  // Animation triggers between scroll progress 0.1 and 0.4 roughly, staggered by character
  const step = 0.2 / total; 
  const start = 0.1 + (index * step);
  const end = start + 0.3;

  const y = useTransform(scrollYProgress, [start, end, 1], [40, 0, 0]);
  const opacity = useTransform(scrollYProgress, [start, end, 1], [0, 1, 1]);
  const rotateX = useTransform(scrollYProgress, [start, end, 1], [90, 0, 0]);
  const filter = useTransform(scrollYProgress, [start, end, 1], ["blur(10px)", "blur(0px)", "blur(0px)"]);

  return (
    <motion.span
      className={cn("inline-block transform-style-3d", isSpace && "w-2", className)}
      style={{ y, opacity, rotateX, filter, transformPerspective: 1000 }}
    >
      {char}
    </motion.span>
  );
};

type ScrollTextProps = {
  text: string;
  className?: string;
  charClassName?: string;
  containerClassName?: string;
};

export const ScrollText = ({ text, className, charClassName, containerClassName }: ScrollTextProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.9", "start 0.5"], // Trigger earlier when coming into view
  });

  const characters = text.split("");

  return (
    <div ref={targetRef} className={cn("relative", containerClassName)}>
      <div className={cn("overflow-visible", className)}>
        {characters.map((char, index) => (
          <ScrollCharacter
            key={index}
            char={char}
            index={index}
            total={characters.length}
            scrollYProgress={scrollYProgress}
            className={charClassName}
          />
        ))}
      </div>
    </div>
  );
};

type ScrollElementProps = {
  children: React.ReactNode;
  viewport?: { once?: boolean; amount?: number }; // Keep consistent API
  className?: string;
  delay?: number;
  offset?: any;
};

export const ScrollElement = ({ children, className, delay = 0, offset = ["start 0.95", "start 0.6"] }: ScrollElementProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: offset,
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  
  // Adding filter blur for smoothness
  const filter = useTransform(scrollYProgress, [0, 1], ["blur(8px)", "blur(0px)"]);

  return (
    <div ref={targetRef} className={className}>
      <motion.div style={{ y, opacity, scale, filter }}>
        {children}
      </motion.div>
    </div>
  );
};

// For grouped elements like lists where we want sequential stagger
export const StaggeredScrollElement = ({ children, index, total, className }: { children: React.ReactNode, index: number, total: number, className?: string }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.9", "start 0.7"],
  });

  // Calculate stagger based on index
  // Use modulo 15 to ensure we don't get excessive delays on large lists (like skills)
  const effectiveIndex = index % 15;
  const start = effectiveIndex * 0.05; 
  const end = start + 0.4;
  
  const y = useTransform(scrollYProgress, [start, end], [50, 0]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [start, end], [20, 0]);
  // Add blur transition here too for consistency with "smoother" request
  const filter = useTransform(scrollYProgress, [start, end], ["blur(10px)", "blur(0px)"]);

  return (
    <div ref={targetRef} className={className}>
      <motion.div style={{ y, opacity, rotateX, filter, transformPerspective: 1000 }}>
        {children}
      </motion.div>
    </div>
  );
};
