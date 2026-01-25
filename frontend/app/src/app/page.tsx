"use client";

import Link from "next/link";
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
import { SyntheticHero } from "@/components/ui/synthetic-hero";
import {
  ScrollElement,
  StaggeredScrollElement,
} from "@/components/ui/text-scroll-animation";
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
    hobbies: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // Parallax effects for different sections - subtle depth
  const projectsY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const skillsY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const experienceY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Smooth scroll with Lenis
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

  // Fetch data
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

        const [projects, skills, experiences, education, testimonials, hobbies] =
          await Promise.all([
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

        setData({ projects, skills, experiences, education, testimonials, hobbies });
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
    <div
      ref={containerRef}
      className="flex flex-col bg-slate-950 relative overflow-x-hidden"
    >
      {/* Global Background Layers with smooth gradient base */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Ambient gradient background that complements the shader */}
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
            isAnchor: true,
          },
          {
            text: "Contact Me",
            href: "/contact",
            isAnchor: false,
          },
        ]}
      />

      {/* ===== PROJECTS SECTION ===== */}
      <section id="projects" className="relative py-32 md:py-40">
        {/* Section ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading 
            title="Featured Projects" 
            description="A selection of projects showcasing my skills."
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
                      <p className="text-slate-400 mb-4 line-clamp-2">
                        {project.description}
                      </p>
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
                </ScrollElement>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No featured projects yet.
            </div>
          )}
        </div>
      </section>

      {/* ===== SKILLS SECTION with LAMP ===== */}
      <section id="skills" className="relative py-32 md:py-40">
        {/* Section ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading 
            title="Skills & Expertise" 
            description="Technologies and tools I work with."
            className="mb-20 relative z-20"
          />

          {/* Lamp Effect positioned under text */}
          <div className="relative w-full h-24 -mt-8 flex justify-center items-start pointer-events-none z-0">
            <div className="w-full max-w-4xl scale-50 md:scale-100">
              <LampContainer className="min-h-0 h-full bg-transparent w-full">
                <div />
              </LampContainer>
            </div>
          </div>

          {/* Skills Grid */}
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
            ) : (
              <div className="text-center py-8 text-slate-500">
                Skills coming soon...
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
            title="Work Experience"
            icon={Briefcase}
            className="mb-20"
            gradient="from-cyan-400 via-blue-500 to-purple-500"
            iconColor="text-cyan-400"
          />

          {data.experiences.length > 0 ? (
            <div className="max-w-3xl mx-auto relative">
              {/* Timeline Line */}
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
                            {exp.position}
                          </h3>
                          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs mt-2 sm:mt-0">
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current
                              ? "Present"
                              : exp.endDate
                                ? formatDate(exp.endDate)
                                : ""}
                          </span>
                        </div>
                        <p className="text-cyan-400 font-medium mb-3">
                          {exp.company} • {exp.location}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  </StaggeredScrollElement>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Experience coming soon...
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
            title="Education"
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
                        {formatDate(edu.startDate)} -{" "}
                        {edu.current
                          ? "Present"
                          : edu.endDate
                            ? formatDate(edu.endDate)
                            : ""}
                      </span>
                    </div>
                    <div className="md:w-3/4">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-blue-400 font-medium mb-2">
                        {edu.institution}
                      </p>
                      {edu.description && (
                        <p className="text-slate-400">{edu.description}</p>
                      )}
                    </div>
                  </motion.div>
                </StaggeredScrollElement>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Education coming soon...
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section id="testimonials" className="relative py-32 md:py-40">
        <SectionHeading
          title="Testimonials"
          description="Feedback from people I know and I have collaborated with."
          icon={MessageSquareQuote}
          className="mb-12"
          gradient="from-purple-400 via-pink-500 to-red-500"
          iconColor="text-purple-400"
        />

        {data.testimonials.length > 0 ? (
          <div className="relative">
            <ScrollElement delay={0.2}>
              <PremiumTestimonials
                testimonials={data.testimonials.map((t) => ({
                  id: t.id,
                  name: t.name,
                  role: t.position || "",
                  company: t.company || "",
                  text: t.content,
                  rating: 0,
                  avatar: t.imageUrl || "",
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
                  Leave a Testimonial
                  <ChevronRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </ScrollElement>
          </div>
        ) : (
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <p className="text-slate-500 mb-6">
              No testimonials yet. Be the first!
            </p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              asChild
            >
              <a href="/testimonials">Leave a Testimonial</a>
            </Button>
          </div>
        )}
      </section>

      {/* ===== HOBBIES & INTERESTS SECTION ===== */}
      <section id="hobbies" className="relative py-32 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/10 to-transparent pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <SectionHeading
            title="Hobbies & Interests"
            description="Beyond code – what I love to do in my free time."
            icon={Sparkles}
            className="mb-20"
            gradient="from-green-400 via-emerald-500 to-teal-500"
            iconColor="text-green-400"
          />

          {data.hobbies.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {data.hobbies.map((hobby, index) => {
                const isImageUrl = hobby.iconUrl && (hobby.iconUrl.startsWith('http://') || hobby.iconUrl.startsWith('https://'));
                
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
                              alt={hobby.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{hobby.iconUrl}</span>
                          )}
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {hobby.name}
                      </h3>
                      {hobby.description && (
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {hobby.description}
                        </p>
                      )}
                    </motion.div>
                  </StaggeredScrollElement>
                );
              })}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-500">No hobbies added yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
