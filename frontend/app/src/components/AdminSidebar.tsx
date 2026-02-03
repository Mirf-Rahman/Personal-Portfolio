"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Code2, 
  FolderKanban, 
  Briefcase, 
  GraduationCap, 
  Gamepad2, 
  Quote, 
  MessageSquare, 
  Contact, 
  FileText,
  LogOut,
  Settings,
  User,
  PanelLeftOpen,
  PanelLeftClose
} from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ 
  isCollapsed = false, 
  onToggleCollapse,
  isMobile = false,
  onCloseMobile
}: AdminSidebarProps) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { key: "skills", href: "/admin/skills", icon: Code2 },
    { key: "projects", href: "/admin/projects", icon: FolderKanban },
    { key: "experience", href: "/admin/experience", icon: Briefcase },
    { key: "education", href: "/admin/education", icon: GraduationCap },
    { key: "hobbies", href: "/admin/hobbies", icon: Gamepad2 },
    { key: "testimonials", href: "/admin/testimonials", icon: Quote },
    { key: "messages", href: "/admin/messages", icon: MessageSquare },
    { key: "contactInfo", href: "/admin/contact", icon: Contact },
    { key: "resume", href: "/admin/resumes", icon: FileText },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside 
      className={cn(
        "h-full flex flex-col border-r border-white/[0.08] bg-slate-950/60 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className={cn(
        "border-b border-white/[0.08] flex items-center justify-between",
        isCollapsed ? "p-4 justify-center" : "p-6"
      )}>
        <Link href="/" className="flex items-center gap-3 group" onClick={handleLinkClick}>
          <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
             <div className="h-4 w-4 rounded-full bg-cyan-400/80 shadow-[0_0_10px_cyan]" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h2 className="text-lg font-bold font-display tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                {t("panel")}
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                {t("access")}
              </p>
            </motion.div>
          )}
        </Link>
        
        {!isCollapsed && !isMobile && (
           <button
             onClick={onToggleCollapse}
             className="text-slate-500 hover:text-white transition-colors"
           >
             <PanelLeftClose className="h-5 w-5" />
           </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={handleLinkClick}
                title={isCollapsed ? t(`sidebar.${item.key}`) : undefined}
                className={cn(
                  "relative group flex items-center rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-200 shadow-[0_0_20px_-10px_rgba(34,211,238,0.3)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Icon className={cn(
                  "relative z-10 transition-colors",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5",
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium relative z-10 whitespace-nowrap"
                  >
                    {t(`sidebar.${item.key}`)}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={cn(
        "border-t border-white/[0.08] p-4 flex flex-col gap-4",
        isCollapsed ? "items-center" : ""
      )}>
        {isCollapsed && !isMobile && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title={t("expand")}
          >
             <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}

        <div className={cn(
          "flex items-center gap-3",
          isCollapsed ? "justify-center" : "w-full"
        )}>
          <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center shadow-inner">
            <User className="h-5 w-5 text-purple-400" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{t("role")}</p>
              <p className="text-xs text-slate-500 truncate">admin@portfolio.com</p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center rounded-xl transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 text-slate-400",
            isCollapsed ? "w-full justify-center p-2" : "w-full gap-3 px-3 py-2.5"
          )}
          title={isCollapsed ? t("logout") : undefined}
        >
          <LogOut className={cn("transition-transform group-hover:scale-110", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
          {!isCollapsed && <span className="text-sm font-medium">{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
