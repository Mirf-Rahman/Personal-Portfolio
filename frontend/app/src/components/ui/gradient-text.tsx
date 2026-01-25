"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children: React.ReactNode;
}

function GradientText({
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent bg-[size:300%_100%] animate-shimmer",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(to right, hsl(var(--color-1)), hsl(var(--color-2)), hsl(var(--color-3)), hsl(var(--color-4)), hsl(var(--color-1)))",
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export { GradientText };
