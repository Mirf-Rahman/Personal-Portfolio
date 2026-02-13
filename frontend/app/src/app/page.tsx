"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Lenis from "lenis";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { BlurFade } from "@/components/ui/blur-fade";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { SparklesText } from "@/components/ui/sparkles-text";
import { SyntheticHero } from "@/components/ui/synthetic-hero";
import {
  ScrollElement,
  StaggeredScrollElement,
} from "@/components/ui/text-scroll-animation";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";
import { PremiumTestimonials } from "@/components/ui/premium-testimonials";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ArrowDown,
  ExternalLink,
  Github,
  Briefcase,
  GraduationCap,
  MessageSquareQuote,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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

interface Skill {
  id: string;
  name: string;
  category: string;
  iconUrl: string | null;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  positionFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  degreeFr?: string | null;
  field: string;
  fieldFr?: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  descriptionFr?: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  content: string;
  contentFr?: string | null;
  imageUrl: string | null;
  order: number;
}

interface Hobby {
  id: string;
  name: string;
  nameFr: string | null;
  description: string | null;
  descriptionFr: string | null;
  iconUrl: string | null;
  order: number;
}

interface HomeData {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  testimonials: Testimonial[];
  hobbies: Hobby[];
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = RAW_API_URL.replace(/\/api\/?$/, "") || RAW_API_URL;
const DEFAULT_PROJECT_IMAGE =
  "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg";

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === "fr" ? "fr-CA" : "en-US",
    {
      year: "numeric",
      month: "short",
    },
  );
}

export default function Home() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const [data, setData] = useState<HomeData>({
    projects: [],
    skills: [],
    experiences: [],
    education: [],
    testimonials: [],
    hobbies: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const isHashNavigatingRef = useRef(false);
  const heroHiddenByHashRef = useRef(false);
  const pendingHashRef = useRef<string | null>(null);
  const lastScrollYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [hideHero, setHideHero] = useState(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash) return true;
      if (pendingHashRef.current) return true;
    }
    return false;
  });
  const [sectionToScrollAfterReveal, setSectionToScrollAfterReveal] = useState<
    string | null
  >(null);

  const { scrollYProgress } = useScroll();

  const projectsY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const skillsY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const experienceY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    const hasHash = !!window.location.hash;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (!hasHash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const hasHash = !!window.location.hash;
    const isHashNavigating = isHashNavigatingRef.current;
    if (!hasHash && !isHashNavigating) {
      lenis.scrollTo(0, { immediate: true });
    }

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      (window as any).__lenis = lenisRef.current;
    }
    return () => {
      delete (window as any).__lenis;
    };
  }, [lenisRef.current]);

  useEffect(() => {
    const onShowHero = () => {
      heroHiddenByHashRef.current = false;
      setHideHero(false);
    };
    window.addEventListener("portfolio:show-hero", onShowHero);
    return () => window.removeEventListener("portfolio:show-hero", onShowHero);
  }, []);

  useEffect(() => {
    if (!hideHero || !heroHiddenByHashRef.current) return;

    const reveal = () => {
      if (!heroHiddenByHashRef.current) return;
      heroHiddenByHashRef.current = false;
      setHideHero(false);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const last = lastScrollYRef.current;
      lastScrollYRef.current = scrollY;
      if (last > 80 && scrollY < 80) reveal();
    };

    const handleWheel = (e: WheelEvent) => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY <= 120 && e.deltaY < 0 && heroHiddenByHashRef.current)
        reveal();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [hideHero]);

  useLayoutEffect(() => {
    if (!sectionToScrollAfterReveal || hideHero || !lenisRef.current) return;
    const hash = sectionToScrollAfterReveal.startsWith("#")
      ? sectionToScrollAfterReveal
      : `#${sectionToScrollAfterReveal}`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(hash) as HTMLElement | null;
        if (el && lenisRef.current) {
          el.scrollIntoView({ block: "start", behavior: "auto" });
          const afterScroll = window.scrollY ?? document.documentElement.scrollTop;
          const topOffset =
            hash === "#skills" || hash === "skills" ? -100 : 80;
          const y = Math.max(0, afterScroll - topOffset);
          window.scrollTo(0, y);
          document.documentElement.scrollTop = y;
          document.body.scrollTop = y;
          lenisRef.current.scrollTo(y, { immediate: true });
          lastScrollYRef.current = y;
          requestAnimationFrame(() => {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(y, { immediate: true });
              window.scrollTo(0, y);
            }
          });
        }
        setHashScrollDone(true);
        setSectionToScrollAfterReveal(null);
      });
    });
  }, [sectionToScrollAfterReveal, hideHero]);

  const [pendingHash, setPendingHash] = useState<string | null>(null);
  const [hashScrollDone, setHashScrollDone] = useState(true);

  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      isHashNavigatingRef.current = true;
      heroHiddenByHashRef.current = true;
      pendingHashRef.current = hash;
      setHideHero(true);
      setHashScrollDone(false);
      setPendingHash(hash);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (pendingHashRef.current) {
      setHideHero(true);
      setHashScrollDone(false);
      setPendingHash(pendingHashRef.current);
    }
  }, []);

  useEffect(() => {
    if (pendingHash && !isLoading && lenisRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = document.querySelector(pendingHash);
          if (element && lenisRef.current) {
            const rect = element.getBoundingClientRect();
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            const topOffset =
              pendingHash === "#skills" || pendingHash === "skills" ? -100 : 80;
            const targetY = Math.max(0, rect.top + scrollTop - topOffset);

            window.scrollTo(0, targetY);
            document.documentElement.scrollTop = targetY;
            document.body.scrollTop = targetY;
            lenisRef.current.scrollTo(targetY, { immediate: true });
            lastScrollYRef.current = targetY;

            isHashNavigatingRef.current = false;
            const hashForReveal = pendingHash.startsWith("#")
              ? pendingHash
              : `#${pendingHash}`;
            setSectionToScrollAfterReveal(hashForReveal);
            setHideHero(false);
          } else {
            setHideHero(false);
            isHashNavigatingRef.current = false;
            setHashScrollDone(true);
          }
          pendingHashRef.current = null;
          setPendingHash(null);
        });
      });
    }
  }, [pendingHash, isLoading]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          projectsRes,
          skillsRes,
          experiencesRes,
          educationRes,
          testimonialsRes,
          hobbiesRes,
        ] = await Promise.allSettled([
          fetch(`${API_URL}/api/projects`, { cache: "no-store" }),
          fetch(`${API_URL}/api/skills`, { cache: "no-store" }),
          fetch(`${API_URL}/api/experiences`, { cache: "no-store" }),
          fetch(`${API_URL}/api/education`, { cache: "no-store" }),
          fetch(`${API_URL}/api/testimonials`, { cache: "no-store" }),
          fetch(`${API_URL}/api/hobbies`, { cache: "no-store" }),
        ]);

        const [
          projects,
          skills,
          experiences,
          education,
          testimonials,
          hobbies,
        ] = await Promise.all([
          projectsRes.status === "fulfilled" && projectsRes.value.ok
            ? projectsRes.value.json().catch(() => [])
            : [],
          skillsRes.status === "fulfilled" && skillsRes.value.ok
            ? skillsRes.value.json().catch(() => [])
            : [],
          experiencesRes.status === "fulfilled" && experiencesRes.value.ok
            ? experiencesRes.value.json().catch(() => [])
            : [],
          educationRes.status === "fulfilled" && educationRes.value.ok
            ? educationRes.value.json().catch(() => [])
            : [],
          testimonialsRes.status === "fulfilled" && testimonialsRes.value.ok
            ? testimonialsRes.value.json().catch(() => [])
            : [],
          hobbiesRes.status === "fulfilled" && hobbiesRes.value.ok
            ? hobbiesRes.value.json().catch(() => [])
            : [],
        ]);

        setData({
          projects,
          skills,
          experiences,
          education,
          testimonials,
          hobbies,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredProjects = data.projects.filter((p) => p.featured).slice(0, 3);

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-slate-950 relative overflow-x-hidden"
    >
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

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 pointer-events-none bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 origin-left z-[90] shadow-lg shadow-cyan-500/50"
        style={{ scaleX: scrollYProgress }}
      />

      {pendingHash &&
        pendingHash !== "#projects" &&
        pendingHash !== "projects" &&
        !hashScrollDone && (
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 z-[45] pointer-events-none"
            aria-hidden
          />
        )}

      <div>
        {!hideHero && (
          <>
            <SyntheticHero
              title={t("hero.title")}
              description={t("hero.description")}
              badgeText={t("hero.badge")}
              badgeLabel={t("hero.badgeLabel")}
              passionateText={t("hero.passionate")}
              rotatingWords={t.raw("hero.rotatingWords") as string[]}
              traits={t.raw("hero.traits") as string[]}
              ctaButtons={[
                {
                  text: t("hero.viewProjects"),
                  href: "#projects",
                  primary: true,
                  isAnchor: true,
                },
                {
                  text: tNav("contactMe"),
                  href: "/contact",
                  isAnchor: false,
                },
              ]}
            />
            <div className="container px-4 md:px-6 mx-auto relative z-10 mb-20 md:mb-32">
              <TextGradientScroll
                text={t("hero.scrollText")}
                className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight"
              />
            </div>
          </>
        )}
      </div>

      <section id="projects" className="relative py-32 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading
            title={t("sections.projects.title")}
            description={t("sections.projects.description")}
            className="mb-20"
          />

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[350px] rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => (
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
                      <p className="text-slate-400 mb-4">
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
                            {t("sections.live")}
                          </Link>
                        )}
                        {project.githubUrl && (
                          <Link
                            href={project.githubUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
                          >
                            <Github className="w-4 h-4" /> Code
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
              {t("sections.projects.empty")}
            </div>
          )}

          {featuredProjects.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-300 font-semibold hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 hover:text-cyan-200 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                {t("sections.viewAllProjects")}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="skills" className="relative py-32 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading
            title={t("sections.skills.title")}
            description={t("sections.skills.description")}
            className="mb-20 relative z-20"
          />

          <div className="relative w-full h-24 -mt-8 flex justify-center items-start pointer-events-none z-0">
            <div className="w-full max-w-4xl scale-50 md:scale-100">
              <LampContainer className="min-h-0 h-full bg-transparent w-full">
                <div />
              </LampContainer>
            </div>
          </div>

          <div className="relative">
            {data.skills.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                {data.skills.map((skill, index) => (
                  <StaggeredScrollElement
                    key={skill.id}
                    index={index}
                    total={data.skills.length}
                    className="inline-block"
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        y: -4,
                        transition: {
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-default"
                    >
                      {skill.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={skill.iconUrl}
                          alt={skill.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                          {skill.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-white/90 group-hover:text-cyan-400 transition-colors">
                        {skill.name}
                      </span>
                    </motion.div>
                  </StaggeredScrollElement>
                ))}
              </div>
            ) : isLoading ? (
              <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-24 rounded-xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                {t("sections.skills.empty")}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== EXPERIENCE SECTION ===== */}
      <section id="experience" className="relative py-32 md:py-40">
        {/* Section ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading
            title={t("sections.experience.title")}
            icon={Briefcase}
            className="mb-20"
            gradient="from-cyan-400 via-blue-500 to-purple-500"
            iconColor="text-cyan-400"
          />

          {data.experiences.length > 0 ? (
            <div className="max-w-3xl mx-auto relative">
              <motion.div
                className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/30 to-transparent"
                initial={{ scaleY: 0, opacity: 0 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top" }}
              />

              <div className="space-y-8">
                {data.experiences.map((exp, index) => (
                  <StaggeredScrollElement
                    key={exp.id}
                    index={index}
                    total={data.experiences.length}
                    className="relative"
                  >
                    <div className="pl-12 md:pl-20">
                      <motion.div
                        className="absolute left-2 md:left-6 top-2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                        }}
                      />
                      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-cyan-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-cyan-500/10 transition-all group">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {locale === "fr" && exp.positionFr
                              ? exp.positionFr
                              : exp.position}
                          </h3>
                          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs mt-2 sm:mt-0">
                            {formatDate(exp.startDate, locale)} -{" "}
                            {exp.current
                              ? t("sections.present")
                              : exp.endDate
                                ? formatDate(exp.endDate, locale)
                                : ""}
                          </span>
                        </div>
                        <p className="text-cyan-400 font-medium mb-3">
                          {exp.company} • {exp.location}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          {locale === "fr" && exp.descriptionFr
                            ? exp.descriptionFr
                            : exp.description}
                        </p>
                      </div>
                    </div>
                  </StaggeredScrollElement>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pl-12 md:pl-20">
                  <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              {t("sections.experience.empty")}
            </div>
          )}
        </div>
      </section>

      {/* ===== EDUCATION SECTION ===== */}
      <section id="education" className="relative py-32 md:py-40">
        {/* Section ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading
            title={t("sections.education.title")}
            icon={GraduationCap}
            className="mb-20"
            gradient="from-blue-400 via-indigo-500 to-cyan-500"
            iconColor="text-blue-400"
          />

          {data.education.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {data.education.map((edu, index) => (
                <StaggeredScrollElement
                  key={edu.id}
                  index={index}
                  total={data.education.length}
                >
                  <motion.div
                    className="flex flex-col md:flex-row gap-4 md:gap-8 items-start rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
                    whileHover={{
                      x: 12,
                      scale: 1.02,
                      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    }}
                  >
                    <div className="md:w-1/4 flex-shrink-0">
                      <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                        {formatDate(edu.startDate, locale)} -{" "}
                        {edu.current
                          ? t("sections.present")
                          : edu.endDate
                            ? formatDate(edu.endDate, locale)
                            : ""}
                      </span>
                    </div>
                    <div className="md:w-3/4">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {locale === "fr" && edu.degreeFr && edu.fieldFr
                          ? `${edu.degreeFr} – ${edu.fieldFr}`
                          : `${edu.degree} in ${edu.field}`}
                      </h3>
                      <p className="text-blue-400 font-medium mb-2">
                        {edu.institution}
                      </p>
                      {(locale === "fr"
                        ? edu.descriptionFr
                        : edu.description) && (
                        <p className="text-slate-400">
                          {locale === "fr" && edu.descriptionFr
                            ? edu.descriptionFr
                            : edu.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </StaggeredScrollElement>
              ))}
            </div>
          ) : isLoading ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              {t("sections.education.empty")}
            </div>
          )}
        </div>
      </section>

      <section id="testimonials" className="relative py-32 md:py-40">
        <SectionHeading
          title={t("sections.testimonials.title")}
          description={t("sections.testimonials.description")}
          icon={MessageSquareQuote}
          className="mb-12"
          gradient="from-purple-400 via-pink-500 to-red-500"
          iconColor="text-purple-400"
        />

        {data.testimonials.length > 0 ? (
          <div className="relative">
            <ScrollElement delay={0.2}>
              <PremiumTestimonials
                testimonials={data.testimonials.map((testimonial) => ({
                  id: testimonial.id,
                  name: testimonial.name,
                  role: testimonial.position || "",
                  company: testimonial.company || "",
                  text:
                    locale === "fr" && testimonial.contentFr
                      ? testimonial.contentFr
                      : testimonial.content,
                  rating: 0,
                  avatar: testimonial.imageUrl || "",
                  results: [],
                }))}
              />
            </ScrollElement>

            <ScrollElement
              delay={0.4}
              className="flex justify-center z-20"
              offset={["start 1", "start 0.9"]}
            >
              <Button
                className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 shadow-lg shadow-purple-500/20"
                asChild
              >
                <a href="/testimonials" className="inline-flex items-center">
                  {t("sections.testimonials.cta")}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </ScrollElement>
          </div>
        ) : isLoading ? (
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <div className="h-48 rounded-2xl bg-white/5 animate-pulse max-w-2xl mx-auto" />
            <div className="mt-6 h-10 w-48 rounded-xl bg-white/5 animate-pulse mx-auto" />
          </div>
        ) : (
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <p className="text-slate-500 mb-6">
              {t("sections.testimonials.empty")}
            </p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              asChild
            >
              <a href="/testimonials">{t("sections.testimonials.cta")}</a>
            </Button>
          </div>
        )}
      </section>

      <section id="hobbies" className="relative py-32 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading
            title={t("sections.hobbies.title")}
            description={t("sections.hobbies.description")}
            icon={Sparkles}
            className="mb-20"
            gradient="from-green-400 via-emerald-500 to-teal-500"
            iconColor="text-green-400"
          />

          {data.hobbies.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {data.hobbies.map((hobby, index) => {
                const isImageUrl =
                  hobby.iconUrl &&
                  (hobby.iconUrl.startsWith("http://") ||
                    hobby.iconUrl.startsWith("https://"));

                return (
                  <StaggeredScrollElement
                    key={hobby.id}
                    index={index}
                    total={data.hobbies.length}
                  >
                    <motion.div
                      className="group relative rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-green-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-green-500/10 transition-all h-full flex flex-col"
                      whileHover={{ y: -5 }}
                    >
                      {hobby.iconUrl && (
                        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 group-hover:scale-110 transition-transform overflow-hidden">
                          {isImageUrl ? (
                            <img
                              src={hobby.iconUrl}
                              alt={
                                locale === "fr" && hobby.nameFr
                                  ? hobby.nameFr
                                  : hobby.name
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{hobby.iconUrl}</span>
                          )}
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {locale === "fr" && hobby.nameFr
                          ? hobby.nameFr
                          : hobby.name}
                      </h3>
                      {(locale === "fr"
                        ? hobby.descriptionFr
                        : hobby.description) && (
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {locale === "fr" && hobby.descriptionFr
                            ? hobby.descriptionFr
                            : hobby.description}
                        </p>
                      )}
                    </motion.div>
                  </StaggeredScrollElement>
                );
              })}
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-500">{t("sections.hobbies.empty")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
