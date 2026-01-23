import Link from "next/link";

// Types for API responses
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

interface Hobby {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
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

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getHomeData() {
  try {
    const [projectsRes, skillsRes, experiencesRes, educationRes, hobbiesRes, testimonialsRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/projects`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/skills`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/experiences`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/education`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/hobbies`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/testimonials`, { cache: 'no-store' }),
    ]);

    const [projects, skills, experiences, education, hobbies, testimonials] = await Promise.all([
      projectsRes.status === 'fulfilled' && projectsRes.value.ok 
        ? projectsRes.value.json().catch(() => []) 
        : [],
      skillsRes.status === 'fulfilled' && skillsRes.value.ok 
        ? skillsRes.value.json().catch(() => []) 
        : [],
      experiencesRes.status === 'fulfilled' && experiencesRes.value.ok 
        ? experiencesRes.value.json().catch(() => []) 
        : [],
      educationRes.status === 'fulfilled' && educationRes.value.ok 
        ? educationRes.value.json().catch(() => []) 
        : [],
      hobbiesRes.status === 'fulfilled' && hobbiesRes.value.ok 
        ? hobbiesRes.value.json().catch(() => []) 
        : [],
      testimonialsRes.status === 'fulfilled' && testimonialsRes.value.ok 
        ? testimonialsRes.value.json().catch(() => []) 
        : [],
    ]);

    return { projects, skills, experiences, education, hobbies, testimonials };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { projects: [], skills: [], experiences: [], education: [], hobbies: [], testimonials: [] };
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { projects, skills, experiences, education, hobbies, testimonials } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/50 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Hey, I&apos;m <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Mir Faiyazur Rahman</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl mb-8">
              A passionate Full Stack Developer building modern web applications. 
              Turning complex problems into elegant solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#projects"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                View Projects
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Contact Me
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Projects Section - only featured projects */}
      <section id="projects" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Featured Projects</h2>
        {(() => {
          const featuredProjects = (projects as Project[]).filter((p) => p.featured === true);
          return featuredProjects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => {
                const techs = Array.isArray(project.technologies) ? project.technologies : [];
                return (
                  <div key={project.id} className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground relative overflow-hidden">
                      {project.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "No Image"
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {techs.map((tech, i) => (
                          <span key={`${tech}-${i}`} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-1">
                        {project.liveUrl && (
                          <Link href={project.liveUrl} target="_blank" className="text-sm font-medium hover:underline underline-offset-4 decoration-primary text-primary">
                            Live Demo
                          </Link>
                        )}
                        {project.githubUrl && (
                          <Link href={project.githubUrl} target="_blank" className="text-sm font-medium hover:underline underline-offset-4 decoration-primary text-primary">
                            GitHub
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No featured projects yet.</p>
            </div>
          );
        })()}
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Skills & Expertise</h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {(skills as Skill[]).map((skill) => (
                <div key={skill.id} className="flex items-center gap-3 rounded-lg border bg-background px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                  {skill.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={skill.iconUrl}
                      alt={skill.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  ) : null}
                  <span className="font-medium">{skill.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Skills coming soon...</p>
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Work Experience</h2>
        {experiences.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {(experiences as Experience[]).map((exp) => (
              <div key={exp.id} className="relative pl-8 border-l border-muted">
                <span className="absolute top-0 left-[-5px] h-2.5 w-2.5 rounded-full bg-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-xl font-bold">{exp.position}</h3>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                  </span>
                </div>
                <p className="text-primary font-medium mb-2">{exp.company} • {exp.location}</p>
                <p className="text-muted-foreground">{exp.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Experience coming soon...</p>
          </div>
        )}
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Education</h2>
          {education.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {(education as Education[]).map((edu) => (
                <div key={edu.id} className="flex flex-col md:flex-row gap-4 md:gap-10 items-start border rounded-lg p-6 bg-background shadow-sm">
                  <div className="md:w-1/4">
                    <span className="inline-block rounded-md bg-muted px-3 py-1 text-sm font-medium">
                      {formatDate(edu.startDate)} - {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : ""}
                    </span>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold mb-1">{edu.degree} in {edu.field}</h3>
                    <p className="text-primary font-medium mb-2">{edu.institution}</p>
                    {edu.description && <p className="text-muted-foreground">{edu.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Education coming soon...</p>
            </div>
          )}
        </div>
      </section>

      {/* Hobbies Section */}
      <section id="hobbies" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Hobbies & Interests</h2>
        {hobbies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {(hobbies as Hobby[]).map((hobby) => (
              <div key={hobby.id} className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-muted/50 transition-colors aspect-square">
                {hobby.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hobby.iconUrl}
                    alt={hobby.name}
                    className="w-12 h-12 object-contain mb-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 mb-4 flex items-center justify-center text-primary text-xl font-bold">
                    {hobby.name[0]}
                  </div>
                )}
                <span className="font-medium">{hobby.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Hobbies coming soon...</p>
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              What People Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Kind words from colleagues, clients, and friends I&apos;ve had the pleasure of working with.
            </p>
          </div>
          
          {testimonials.length > 0 ? (
            <>
              <div className="overflow-x-auto pb-4 mb-8">
                <div className="flex gap-6 min-w-max px-2">
                  {(testimonials as Testimonial[]).map((t) => (
                    <div key={t.id} className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm w-[350px] flex-shrink-0">
                      <div className="mb-4">
                        <svg
                          className="h-8 w-8 text-primary/20 mb-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.059 14.929 15.489C15.536 14.919 16.486 14.489 17.779 14.199L18.429 14.029L18.429 8.939L17.779 9.179C12.879 10.979 11.279 15.339 10.979 21L14.017 21ZM5.00003 21L8.03803 21C7.73803 15.339 6.13803 10.979 1.23803 9.179L0.588028 8.939L0.588028 14.029L1.23803 14.199C2.53103 14.489 3.48103 14.919 4.08803 15.489C4.69503 16.059 5.00003 16.896 5.00003 18L5.00003 21Z" />
                        </svg>
                        <p className="text-muted-foreground italic line-clamp-4">&quot;{t.content}&quot;</p>
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          {(t.position || t.company) && (
                            <p className="text-xs text-muted-foreground">
                              {t.position}{t.position && t.company ? " at " : ""}{t.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <Link
                  href="/testimonials"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Leave a Testimonial
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">No testimonials yet. Be the first to leave one!</p>
              <Link
                href="/testimonials"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Leave a Testimonial
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
