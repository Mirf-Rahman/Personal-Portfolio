"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import Link from "next/link";

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

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const cards = [
    { titleKey: "sidebar.skills", count: stats.skills, href: "/admin/skills", icon: "⚡", color: "from-blue-600 to-cyan-600" },
    { titleKey: "sidebar.projects", count: stats.projects, href: "/admin/projects", icon: "🚀", color: "from-purple-600 to-pink-600" },
    { titleKey: "sidebar.experience", count: stats.experiences, href: "/admin/experience", icon: "💼", color: "from-amber-600 to-orange-600" },
    { titleKey: "sidebar.education", count: stats.education, href: "/admin/education", icon: "🎓", color: "from-teal-600 to-cyan-600" },
    { titleKey: "sidebar.hobbies", count: stats.hobbies, href: "/admin/hobbies", icon: "🎯", color: "from-indigo-600 to-violet-600" },
    { titleKey: "sidebar.testimonials", count: stats.testimonials, href: "/admin/testimonials", icon: "💬", color: "from-green-600 to-emerald-600" },
    { titleKey: "sidebar.messages", count: stats.messages, href: "/admin/messages", icon: "📧", color: "from-orange-600 to-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("dashboard.welcome")}</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.titleKey} href={card.href} className="group">
              <div className="relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:scale-105">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{card.icon}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {t("dashboard.viewAll")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t(card.titleKey)}</p>
                    <p className="text-3xl font-bold">{card.count}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">{t("dashboard.quickActions")}</h3>
          <div className="space-y-2">
            <Link href="/admin/projects" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.addNewProject")}
            </Link>
            <Link href="/admin/skills" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.addNewSkill")}
            </Link>
            <Link href="/admin/experience" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.addExperience")}
            </Link>
            <Link href="/admin/education" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.addEducation")}
            </Link>
            <Link href="/admin/hobbies" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.addHobby")}
            </Link>
            <Link href="/admin/testimonials" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.reviewTestimonials")}
            </Link>
            <Link href="/admin/messages" className="flex items-center gap-2 text-sm hover:underline text-primary">
              <span>→</span> {t("dashboard.checkMessages")}
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">{t("dashboard.contentManagement")}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/experience" className="flex items-center justify-center p-3 rounded border hover:bg-accent text-sm">
              {t("sidebar.experience")}
            </Link>
            <Link href="/admin/education" className="flex items-center justify-center p-3 rounded border hover:bg-accent text-sm">
              {t("sidebar.education")}
            </Link>
            <Link href="/admin/hobbies" className="flex items-center justify-center p-3 rounded border hover:bg-accent text-sm">
              {t("sidebar.hobbies")}
            </Link>
            <Link href="/admin/resume" className="flex items-center justify-center p-3 rounded border hover:bg-accent text-sm">
              {t("sidebar.resume")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
