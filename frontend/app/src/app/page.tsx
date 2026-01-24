"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { BlurFade } from "@/components/ui/blur-fade";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { SparklesText } from "@/components/ui/sparkles-text";
import {
  ArrowDown,
  ExternalLink,
  Github,
  Briefcase,
  GraduationCap,
  MessageSquareQuote,
  ChevronRight,
} from "lucide-react";

// Dynamic import for SyntheticHero (uses @react-three/fiber which doesn't work in SSR)
const SyntheticHero = dynamic(
  () => import("@/components/ui/synthetic-hero").then((mod) => mod.SyntheticHero),
  { ssr: false }
);

// Types
interface Project {
  id: string;
  title: string;
  description: string;
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
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  content: string;
  imageUrl: string | null;
  order: number;
}

interface HomeData {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  testimonials: Testimonial[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function Home() {
  const [data, setData] = useState<HomeData>({
    projects: [],
    skills: [],
    experiences: [],
    education: [],
    testimonials: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  
  // Parallax effects for different sections
  const projectsY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const skillsY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const experienceY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // Smooth scroll with Lenis - TEMPORARILY DISABLED FOR DEBUGGING
  // TODO: Re-enable after fixing navigation issue
  /*
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
  */

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, skillsRes, experiencesRes, educationRes, testimonialsRes] =
          await Promise.allSettled([
            fetch(`${API_URL}/api/projects`, { cache: "no-store" }),
            fetch(`${API_URL}/api/skills`, { cache: "no-store" }),
            fetch(`${API_URL}/api/experiences`, { cache: "no-store" }),
            fetch(`${API_URL}/api/education`, { cache: "no-store" }),
            fetch(`${API_URL}/api/testimonials`, { cache: "no-store" }),
          ]);

        const [projects, skills, experiences, education, testimonials] = await Promise.all([
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
        ]);

        setData({ projects, skills, experiences, education, testimonials });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredProjects = data.projects.filter((p) => p.featured);

  return (
    <div ref={containerRef} className="flex flex-col bg-slate-950 relative overflow-x-hidden">
      {/* Global Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <BackgroundPaths />
        <StarsBackground />
        <ShootingStars starColor="#06b6d4" trailColor="#3b82f6" minSpeed={15} maxSpeed={30} />
      </div>

      {/* Scroll Progress Indicator - pointer-events-none so it never blocks navbar/links */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 pointer-events-none bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 origin-left z-[90] shadow-lg shadow-cyan-500/50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ===== HERO SECTION with Synthetic Hero ===== */}
      <SyntheticHero
        title="Hey, I'm Mir Faiyazur Rahman"
        description="A passionate Full Stack Developer building modern web applications and turning complex problems into elegant solutions."
        badgeText="Available for Opportunities"
        badgeLabel="Status"
        ctaButtons={[
          { 
            text: "View Projects", 
            href: "#projects", 
            primary: true,
            isAnchor: true
          },
          { 
            text: "Contact Me", 
            href: "/contact",
            isAnchor: false
          },
        ]}
      />

      {/* ===== PROJECTS SECTION ===== */}
      <section id="projects" className="relative py-32 md:py-40">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <BlurFade>
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Featured <SparklesText className="text-cyan-400">Projects</SparklesText>
              </motion.h2>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                A selection of projects showcasing my skills in web development.
              </p>
            </motion.div>
          </BlurFade>

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[350px] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => (
                <BlurFade key={project.id} delay={index * 0.1}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                  >
                    <BorderBeam size={250} duration={12} delay={index * 2} colorFrom="#06b6d4" colorTo="#3b82f6" />
                    <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
                      {project.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-400 mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        {project.liveUrl && (
                          <Link
                            href={project.liveUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="w-4 h-4" /> Live
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
                </BlurFade>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No featured projects yet.</div>
          )}
        </div>
      </section>

      {/* ===== SKILLS SECTION with LAMP ===== */}
      <section id="skills" className="relative py-32 md:py-40">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <BlurFade>
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Skills & <span className="text-cyan-400">Expertise</span>
              </motion.h2>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                Technologies and tools I work with.
              </p>
            </motion.div>
          </BlurFade>

          {/* Lamp Effect Behind Skills */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-30">
              <div className="w-full max-w-4xl">
                <LampContainer className="min-h-0 py-0">
                  <div />
                </LampContainer>
              </div>
            </div>

            {data.skills.length > 0 ? (
              <motion.div
                className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {data.skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 20 },
                      visible: { opacity: 1, scale: 1, y: 0 },
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.1, y: -4, transition: { duration: 0.2 } }}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-default"
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
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-8 text-slate-500">Skills coming soon...</div>
            )}
          </div>
        </div>
      </section>

      {/* ===== EXPERIENCE SECTION ===== */}
      <section id="experience" className="relative py-32 md:py-40">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <BlurFade>
            <motion.div 
              className="flex items-center gap-3 justify-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Briefcase className="w-6 h-6 text-cyan-400" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-bold">
                Work <span className="text-cyan-400">Experience</span>
              </h2>
            </motion.div>
          </BlurFade>

          {data.experiences.length > 0 ? (
            <div className="max-w-3xl mx-auto relative">
              {/* Timeline Line */}
              <motion.div
                className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/30 to-transparent"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
              />

              <div className="space-y-8">
                {data.experiences.map((exp, index) => (
                  <BlurFade key={exp.id} delay={index * 0.1}>
                    <motion.div
                      className="relative pl-12 md:pl-20"
                      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                    >
                      <motion.div
                        className="absolute left-2 md:left-6 top-2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      />
                      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{exp.position}</h3>
                          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs mt-2 sm:mt-0">
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                          </span>
                        </div>
                        <p className="text-cyan-400 font-medium mb-3">
                          {exp.company} • {exp.location}
                        </p>
                        <p className="text-slate-400 leading-relaxed">{exp.description}</p>
                      </div>
                    </motion.div>
                  </BlurFade>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">Experience coming soon...</div>
          )}
        </div>
      </section>

      {/* ===== EDUCATION SECTION ===== */}
      <section id="education" className="relative py-32 md:py-40">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <BlurFade>
            <motion.div 
              className="flex items-center gap-3 justify-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-bold">
                <span className="text-blue-400">Education</span>
              </h2>
            </motion.div>
          </BlurFade>

          {data.education.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {data.education.map((edu, index) => (
                <BlurFade key={edu.id} delay={index * 0.1}>
                  <motion.div
                    className="flex flex-col md:flex-row gap-4 md:gap-8 items-start rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/30 hover:bg-white/10 transition-all group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ x: 8, transition: { duration: 0.3 } }}
                  >
                    <div className="md:w-1/4 flex-shrink-0">
                      <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                        {formatDate(edu.startDate)} -{" "}
                        {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : ""}
                      </span>
                    </div>
                    <div className="md:w-3/4">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-blue-400 font-medium mb-2">{edu.institution}</p>
                      {edu.description && <p className="text-slate-400">{edu.description}</p>}
                    </div>
                  </motion.div>
                </BlurFade>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">Education coming soon...</div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section id="testimonials" className="relative py-32 md:py-40">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <BlurFade>
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center justify-center gap-3 mb-6">
                <motion.div 
                  className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <MessageSquareQuote className="w-6 h-6 text-purple-400" />
                </motion.div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                What People <span className="text-purple-400">Say</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                Kind words from colleagues and clients.
              </p>
            </motion.div>
          </BlurFade>

          {data.testimonials.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
                {data.testimonials.map((t, index) => (
                  <BlurFade key={t.id} delay={index * 0.1}>
                    <motion.div
                      className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-purple-500/30 hover:bg-white/10 transition-all group"
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.12, duration: 0.6, ease: "easeOut" }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    >
                      <div className="mb-4">
                        <svg
                          className="h-8 w-8 text-purple-500/30 mb-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.059 14.929 15.489C15.536 14.919 16.486 14.489 17.779 14.199L18.429 14.029L18.429 8.939L17.779 9.179C12.879 10.979 11.279 15.339 10.979 21L14.017 21ZM5.00003 21L8.03803 21C7.73803 15.339 6.13803 10.979 1.23803 9.179L0.588028 8.939L0.588028 14.029L1.23803 14.199C2.53103 14.489 3.48103 14.919 4.08803 15.489C4.69503 16.059 5.00003 16.896 5.00003 18L5.00003 21Z" />
                        </svg>
                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
                          &quot;{t.content}&quot;
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                          {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{t.name}</p>
                          {(t.position || t.company) && (
                            <p className="text-xs text-slate-400">
                              {t.position}
                              {t.position && t.company ? " at " : ""}
                              {t.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </BlurFade>
                ))}
              </div>

              <BlurFade delay={0.3}>
                <div className="flex justify-center">
                  <Button className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90" asChild>
                    <a href="/testimonials" className="inline-flex items-center">
                      Leave a Testimonial
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </BlurFade>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-6">No testimonials yet. Be the first!</p>
              <Button className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl" asChild>
                <a href="/testimonials">Leave a Testimonial</a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
