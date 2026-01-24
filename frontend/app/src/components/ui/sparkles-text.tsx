"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesProps {
  children: React.ReactNode;
  className?: string;
  sparklesCount?: number;
  colors?: { first: string; second: string };
}

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
}

const generateSparkle = (colors: { first: string; second: string }): Sparkle => {
  return {
    id: Math.random().toString(36).substring(2, 9),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color: Math.random() > 0.5 ? colors.first : colors.second,
    delay: Math.random() * 2,
    scale: Math.random() * 0.5 + 0.5,
  };
};

export function SparklesText({
  children,
  className,
  sparklesCount = 10,
  colors = { first: "#06b6d4", second: "#3b82f6" },
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const initialSparkles = Array.from({ length: sparklesCount }, () =>
      generateSparkle(colors)
    );
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      setSparkles((current) => {
        const newSparkles = [...current];
        const randomIndex = Math.floor(Math.random() * newSparkles.length);
        newSparkles[randomIndex] = generateSparkle(colors);
        return newSparkles;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [sparklesCount, colors]);

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.span
            key={sparkle.id}
            className="pointer-events-none absolute"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              color: sparkle.color,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, sparkle.scale, 0],
            }}
            transition={{
              duration: 1.5,
              delay: sparkle.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 2 + 1,
            }}
          >
            <svg
              viewBox="0 0 160 160"
              fill="none"
              className="h-3 w-3"
            >
              <path
                d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
                fill="currentColor"
              />
            </svg>
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
