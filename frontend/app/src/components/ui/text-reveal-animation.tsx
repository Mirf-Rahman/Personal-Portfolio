"use client";

import { motion } from "framer-motion";

interface TextRevealProps {
  word?: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ word = "Animations", className = "", delay = 0 }: TextRevealProps) {
  // Split text into valid characters (handle emojis/special chars properly if needed, but split("") works for basic latin)
  const characters = word.split("");

  return (
    <span className={className}>
      <span className="inline-flex flex-wrap reveal-text-wrapper">
        {characters.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }} // Re-triggers when scrolling back
            transition={{ 
              duration: 0.5, 
              delay: delay + (i * 0.015), 
              ease: "easeOut" 
            }}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
