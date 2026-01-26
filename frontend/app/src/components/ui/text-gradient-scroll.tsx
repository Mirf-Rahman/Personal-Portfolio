"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGradientScrollProps {
  text: string;
  className?: string;
}

export function TextGradientScroll({ text, className }: TextGradientScrollProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p ref={containerRef} className={cn("flex flex-wrap justify-center leading-relaxed", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const characters = children.split("");
  const amount = range[1] - range[0];
  const step = amount / characters.length;

  return (
    <span className="relative mr-[0.2em] inline-block">
      {characters.map((char, i) => {
        const charStart = range[0] + (i * step);
        const charEnd = range[0] + ((i + 1) * step);
        return (
          <Char key={i} progress={progress} range={[charStart, charEnd]}>
            {char}
          </Char>
        );
      })}
    </span>
  );
};

interface CharProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Char = ({ children, progress, range }: CharProps) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  
  return (
    <motion.span style={{ opacity }}>
      {children}
    </motion.span>
  );
};
