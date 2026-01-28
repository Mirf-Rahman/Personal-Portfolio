"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20 backdrop-blur-xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function AdminTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-white/[0.03] border-b border-white/[0.05]">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-6 py-4 font-medium text-slate-400 uppercase tracking-wider text-xs font-mono", className)}>
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-white/[0.05]">{children}</tbody>;
}

export function AdminTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("group hover:bg-white/[0.02] transition-colors", className)}>
      {children}
    </tr>
  );
}

export function AdminTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-6 py-4 text-slate-300 font-light", className)} {...props}>
      {children}
    </td>
  );
}
