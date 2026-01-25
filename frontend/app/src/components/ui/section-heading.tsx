"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ScrollElement } from "@/components/ui/text-scroll-animation";

interface SectionHeadingProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  gradient?: string; // Optional custom gradient text class
  iconColor?: string; // Optional specific icon color (e.g. text-purple-400), defaults to cyan
}

export function SectionHeading({
  title,
  description,
  icon: Icon,
  className,
  gradient = "from-cyan-400 via-blue-500 to-purple-500",
  iconColor = "text-cyan-400",
}: SectionHeadingProps) {
  return (
    <div className={cn("relative z-10 flex flex-col items-center justify-center text-center", className)}>
      <ScrollElement viewport={{ once: true }} className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              whileHover={{ 
                scale: 1.2, 
                rotate: 15,
                filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))"
              }}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl cursor-default group"
              style={{
                boxShadow: "0 0 15px -5px rgba(0, 0, 0, 0.5), inset 0 0 20px -10px rgba(255, 255, 255, 0.1)"
              }}
            >
              <Icon className={cn("w-8 h-8 md:w-10 md:h-10 transition-colors duration-300", iconColor)} />
            </motion.div>
          )}

          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight py-2"
          >
            <span
              className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient",
                gradient
              )}
            >
              {title}
            </span>
          </motion.h2>
        </div>

        {description && (
          <motion.p
            className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}
      </ScrollElement>
    </div>
  );
}
