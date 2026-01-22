import Link from "next/link";
import Image from "next/image";

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

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getHomeData() {
  try {
    const [projectsRes, skillsRes, experiencesRes, educationRes, hobbiesRes] = await Promise.all([
      fetch(`${API_URL}/api/projects`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/skills`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/experiences`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/education`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/hobbies`, { next: { revalidate: 60 } }),
    ]);

    const [projects, skills, experiences, education, hobbies] = await Promise.all([
      projectsRes.ok ? projectsRes.json() : [],
      skillsRes.ok ? skillsRes.json() : [],
      experiencesRes.ok ? experiencesRes.json() : [],
      educationRes.ok ? educationRes.json() : [],
      hobbiesRes.ok ? hobbiesRes.json() : [],
    ]);

    return { projects, skills, experiences, education, hobbies };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { projects: [], skills: [], experiences: [], education: [], hobbies: [] };
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default async function Home() {
  const { projects, skills, experiences, education, hobbies } = await getHomeData();

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

      {/* Projects Section */}
      <section id="projects" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Featured Projects</h2>
        {projects.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(projects as Project[]).slice(0, 6).map((project) => (
              <div key={project.id} className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground relative">
                  {project.imageUrl ? (
                    <Image src={project.imageUrl} alt={project.title} fill className="object-cover" unoptimized />
                  ) : (
                    "No Image"
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span key={tech} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Skills & Expertise</h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {(skills as Skill[]).map((skill) => (
                <div key={skill.id} className="flex items-center justify-center rounded-lg border bg-background px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
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
                <div className="w-12 h-12 rounded-full bg-primary/10 mb-4 flex items-center justify-center text-primary text-xl font-bold">
                  {hobby.name[0]}
                </div>
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
    </div>
  );
}
