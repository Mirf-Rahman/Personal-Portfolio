"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { ShaderBackground } from "@/components/ui/shader-background";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-full min-h-screen bg-slate-950 pt-20">
      <div className="fixed inset-0 z-0">
        <ShaderBackground />
      </div>

      {/* Mobile Header (Hidden as we now keep sidebar visible or use Main Navbar) */}
      {/* We can keep this hidden or remove it if Main Navbar is enough */}
      <div className="hidden"></div>

      {/* Mobile Sidebar form Drawer/Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 md:hidden"
            >
              <AdminSidebar 
                isMobile 
                onCloseMobile={() => setIsMobileMenuOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Always visible, collapses on mobile */}
      <div className="relative z-10 h-full transition-all duration-300 shrink-0">
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pt-4 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
           <PageTransition>
             {children}
           </PageTransition>
        </div>
      </main>
    </div>
  );
}
