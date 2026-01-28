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
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
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
    { key: "resume", href: "/admin/resume", icon: FileText },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <aside className="h-full w-72 flex flex-col border-r border-white/[0.08] bg-slate-950/60 backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
             <div className="h-4 w-4 rounded-full bg-cyan-400/80 shadow-[0_0_10px_cyan]" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display tracking-tight text-white group-hover:text-cyan-200 transition-colors">
              {t("panel")}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Admin Access
            </p>
          </div>
        </Link>
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
                className={cn(
                  "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
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
                  "h-5 w-5 relative z-10 transition-colors",
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                
                <span className="text-sm font-medium relative z-10">
                  {t(`sidebar.${item.key}`)}
                </span>
                
                {isActive && (
                  <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/[0.08] bg-black/20">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Administrator</p>
              <p className="text-xs text-slate-500 truncate">admin@portfolio.com</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
