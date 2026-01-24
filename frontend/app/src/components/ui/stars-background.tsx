"use client";

import { cn } from "@/lib/utils";

interface StarsBackgroundProps {
  className?: string;
}

export function StarsBackground({ className }: StarsBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_80%)]" />
      
      {/* Stars pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, #eee, transparent),
            radial-gradient(2px 2px at 40px 70px, #fff, transparent),
            radial-gradient(2px 2px at 50px 160px, #ddd, transparent),
            radial-gradient(2px 2px at 90px 40px, #fff, transparent),
            radial-gradient(2px 2px at 130px 80px, #fff, transparent),
            radial-gradient(2px 2px at 160px 120px, #ddd, transparent),
            radial-gradient(1px 1px at 180px 200px, #eee, transparent),
            radial-gradient(1px 1px at 200px 50px, #fff, transparent),
            radial-gradient(1px 1px at 220px 150px, #ddd, transparent),
            radial-gradient(1px 1px at 250px 90px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          animation: 'twinkle 5s ease-in-out infinite',
        }}
      />
      
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
