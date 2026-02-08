"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { SparklesText } from "@/components/ui/sparkles-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { ScrollElement } from "@/components/ui/text-scroll-animation";
import { ArrowLeft, ExternalLink, Github, FolderGit2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  titleFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  technologies: string[];
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const DEFAULT_PROJECT_IMAGE = "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${API_URL}/api/projects`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/50 to-slate-950" />
        <BackgroundPaths />
        <StarsBackground />
        <ShootingStars
          starColor="#06b6d4"
          trailColor="#3b82f6"
          minSpeed={15}
          maxSpeed={30}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{tHome("sections.projects.title")}</span>
            </Link>
          </motion.div>

          {/* Section Heading with Icon and SparklesText */}
          <div className="flex flex-col items-center justify-center text-center mb-16">
            {/* Icon Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 backdrop-blur-md shadow-xl mb-6"
            >
              <FolderGit2 className="w-10 h-10 text-cyan-400" />
            </motion.div>

            {/* Title with SparklesText */}
            <SparklesText
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight"
              sparklesCount={10}
              colors={{ first: "#06b6d4", second: "#a855f7" }}
            >
              {t("title")}
            </SparklesText>

            {/* Description */}
            <motion.p
              className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t("description")}
            </motion.p>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[350px] rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <ScrollElement key={project.id}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-500/20"
                    whileHover={{
                      y: -12,
                      scale: 1.02,
                      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    }}
                  >
                    <BorderBeam
                      size={250}
                      duration={12}
                      delay={index * 2}
                      colorFrom="#06b6d4"
                      colorTo="#3b82f6"
                    />
                    <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.imageUrl || DEFAULT_PROJECT_IMAGE}
                        alt={
                          locale === "fr" && project.titleFr
                            ? project.titleFr
                            : project.title
                        }
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                        {locale === "fr" && project.titleFr
                          ? project.titleFr
                          : project.title}
                      </h3>
                      <p className="text-slate-400 mb-4 line-clamp-3">
                        {locale === "fr" && project.descriptionFr
                          ? project.descriptionFr
                          : project.description}
                      </p>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {project.technologies.map((tech, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: i * 0.05,
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                            whileHover={{
                              scale: 1.1,
                              y: -2,
                              boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                            }}
                            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium cursor-default transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        {project.liveUrl && (
                          <Link
                            href={project.liveUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="w-4 h-4" />{" "}
                            {t("viewProject")}
                          </Link>
                        )}
                        {project.githubUrl && (
                          <Link
                            href={project.githubUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
                          >
                            <Github className="w-4 h-4" /> {t("codeLabel")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </ScrollElement>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              {t("empty")}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
