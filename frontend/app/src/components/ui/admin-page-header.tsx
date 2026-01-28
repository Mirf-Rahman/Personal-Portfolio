"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  customAction?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  customAction,
}: AdminPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-display tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 font-light tracking-wide text-sm">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {customAction}
        
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <ShimmerButton
               className="shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)]"
               shimmerColor="rgba(255, 255, 255, 0.3)"
               shimmerSize="0.1em"
               borderRadius="12px"
               background="#0f172a"
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  {actionLabel}
                </span>
              </div>
            </ShimmerButton>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
