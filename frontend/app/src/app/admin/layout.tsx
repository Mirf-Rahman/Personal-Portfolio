"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { PageTransition } from "@/components/PageTransition";

import { ShaderBackground } from "@/components/ui/shader-background";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0">
        <ShaderBackground />
      </div>

      {/* Sidebar - fixed width */}
      <div className="relative z-10 hidden md:block h-full">
        <AdminSidebar />
      </div>

      {/* Main Content Area - flex-1 to take remaining width */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
           <PageTransition>
             {children}
           </PageTransition>
        </div>
      </main>
    </div>
  );
}
