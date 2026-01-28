"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShineBorder } from "@/components/ui/shine-border";
import { 
  LayoutDashboard, 
  Code2, 
  FolderKanban, 
  Briefcase, 
  GraduationCap, 
  Gamepad2, 
  Quote, 
  MessageSquare,
  ArrowRight,
  Plus
} from "lucide-react";

interface Stats {
  skills: number;
  projects: number;
  experiences: number;
  education: number;
  hobbies: number;
  testimonials: number;
  messages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [stats, setStats] = useState<Stats>({
    skills: 0,
    projects: 0,
    experiences: 0,
    education: 0,
    hobbies: 0,
    testimonials: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [skills, projects, experiences, education, hobbies, testimonials, messages] = await Promise.all([
          fetchApi<any[]>("/api/skills").catch(() => []),
          fetchApi<any[]>("/api/projects").catch(() => []),
          fetchApi<any[]>("/api/experiences").catch(() => []),
          fetchApi<any[]>("/api/education").catch(() => []),
          fetchApi<any[]>("/api/hobbies").catch(() => []),
          authenticatedFetch<any[]>("/api/testimonials/all").catch(() => []),
          authenticatedFetch<any[]>("/api/messages").catch(() => []),
        ]);

        setStats({
          skills: skills.length,
          projects: projects.length,
          experiences: experiences.length,
          education: education.length,
          hobbies: hobbies.length,
          testimonials: testimonials.length,
          messages: messages.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const cards = [
    { titleKey: "sidebar.skills", count: stats.skills, href: "/admin/skills", icon: Code2, color: ["#38bdf8", "#818cf8", "#c084fc"] },
    { titleKey: "sidebar.projects", count: stats.projects, href: "/admin/projects", icon: FolderKanban, color: ["#f472b6", "#e879f9", "#c084fc"] },
    { titleKey: "sidebar.experience", count: stats.experiences, href: "/admin/experience", icon: Briefcase, color: ["#fbbf24", "#fb923c", "#f87171"] },
    { titleKey: "sidebar.education", count: stats.education, href: "/admin/education", icon: GraduationCap, color: ["#2dd4bf", "#38bdf8", "#818cf8"] },
    { titleKey: "sidebar.hobbies", count: stats.hobbies, href: "/admin/hobbies", icon: Gamepad2, color: ["#a78bfa", "#818cf8", "#6366f1"] },
    { titleKey: "sidebar.testimonials", count: stats.testimonials, href: "/admin/testimonials", icon: Quote, color: ["#4ade80", "#2dd4bf", "#38bdf8"] },
    { titleKey: "sidebar.messages", count: stats.messages, href: "/admin/messages", icon: MessageSquare, color: ["#fb923c", "#f87171", "#f472b6"] },
  ];

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold font-display tracking-tight text-white">
          {t("dashboard.title")}
        </h1>
        <p className="text-slate-400 font-light tracking-wide">
          {t("dashboard.welcome")}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-40 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.titleKey} variants={item}>
                <Link href={card.href} className="group block h-full">
                  <ShineBorder
                    className="relative h-full w-full p-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                    shineColor={card.color}
                    borderWidth={1.5}
                    duration={10}
                  >
                    <div className="flex items-start justify-between mb-8">
                       <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.05] group-hover:scale-110 transition-transform duration-300">
                         <Icon className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                       </div>
                       <span className="text-xs font-medium text-slate-500 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                         View All <ArrowRight className="w-3 h-3" />
                       </span>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">
                        {t(card.titleKey)}
                      </h3>
                      <p className="text-4xl font-bold text-white font-display">
                        {card.count}
                      </p>
                    </div>
                  </ShineBorder>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-white/[0.08] bg-black/20 backdrop-blur-xl p-8"
        >
          <h3 className="font-display font-semibold text-xl text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded-full" />
            {t("dashboard.quickActions")}
          </h3>
          <div className="grid gap-3">
             {[
               { href: "/admin/projects", label: t("dashboard.addNewProject"), icon: Plus },
               { href: "/admin/skills", label: t("dashboard.addNewSkill"), icon: Plus },
               { href: "/admin/experience", label: t("dashboard.addExperience"), icon: Plus },
             ].map((action, idx) => (
                <Link 
                  key={idx} 
                  href={action.href}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-cyan-500/30 group transition-all"
                >
                  <span className="text-slate-300 group-hover:text-white font-medium">{action.label}</span>
                  <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                    <action.icon className="w-4 h-4" />
                  </div>
                </Link>
             ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

