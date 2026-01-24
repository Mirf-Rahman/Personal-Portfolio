"use client";

import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  className?: string;
  variant?: "default" | "hero" | "subtle";
}

export function AnimatedBackground({ 
  className = "", 
  variant = "default" 
}: AnimatedBackgroundProps) {
  const orbs = variant === "hero" ? [
    { size: "w-[600px] h-[600px]", position: "top-1/4 left-1/4", color: "from-cyan-500/20 to-blue-500/20", delay: 0 },
    { size: "w-[500px] h-[500px]", position: "top-1/3 right-1/4", color: "from-purple-500/15 to-pink-500/15", delay: 2 },
    { size: "w-[400px] h-[400px]", position: "bottom-1/4 left-1/3", color: "from-blue-500/15 to-cyan-500/15", delay: 4 },
  ] : variant === "subtle" ? [
    { size: "w-[300px] h-[300px]", position: "top-0 right-0", color: "from-cyan-500/10 to-transparent", delay: 0 },
    { size: "w-[200px] h-[200px]", position: "bottom-0 left-0", color: "from-blue-500/10 to-transparent", delay: 1 },
  ] : [
    { size: "w-[400px] h-[400px]", position: "top-1/4 left-1/4", color: "from-cyan-500/15 to-blue-500/15", delay: 0 },
    { size: "w-[350px] h-[350px]", position: "bottom-1/4 right-1/4", color: "from-purple-500/10 to-blue-500/10", delay: 2 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient orbs */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.size} ${orb.position} rounded-full bg-gradient-radial ${orb.color} blur-3xl`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: [1, 1.1, 1],
            y: [0, -30, 0],
          }}
          transition={{
            opacity: { duration: 1, delay: orb.delay * 0.2 },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: orb.delay },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: orb.delay },
          }}
        />
      ))}
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background" />
    </div>
  );
}
