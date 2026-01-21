import Link from "next/link";

export default function Home() {
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
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Featured Projects</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="aspect-video w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">
                  Project Image Placeholder
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Project Title {i}</h3>
                <p className="text-muted-foreground mb-4">
                  A brief description of this project. Use this space to highlight key features and technologies used.
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {["React", "Next.js", "Tailwind"].map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                    <Link href="#" className="text-sm font-medium hover:underline underline-offset-4 decoration-primary text-primary">Live Demo</Link>
                    <Link href="#" className="text-sm font-medium hover:underline underline-offset-4 decoration-primary text-primary">GitHub</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
         <div className="mt-12 text-center">
             <p className="text-muted-foreground">More projects coming soon...</p>
         </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Skills & Expertise</h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                 {["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "Docker", "AWS", "Tailwind CSS", "Git", "System Design"].map((skill) => (
                    <div key={skill} className="flex items-center justify-center rounded-lg border bg-background px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                        <span className="font-medium">{skill}</span>
                    </div>
                 ))}
            </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Work Experience</h2>
        <div className="max-w-3xl mx-auto space-y-8">
            {[1, 2].map((i) => (
                <div key={i} className="relative pl-8 border-l border-muted">
                    <span className="absolute top-0 left-[-5px] h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="text-xl font-bold">Software Engineer</h3>
                        <span className="text-sm text-muted-foreground">202{i} - Present</span>
                    </div>
                    <p className="text-primary font-medium mb-2">Company Name {i}</p>
                    <p className="text-muted-foreground">
                        Description of your role and responsibilities. Highlight your achievements and the impact you made.
                        Implemented key features using modern technologies.
                    </p>
                </div>
            ))}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Education</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-10 items-start border rounded-lg p-6 bg-background shadow-sm">
                 <div className="md:w-1/4">
                    <span className="inline-block rounded-md bg-muted px-3 py-1 text-sm font-medium">201{8+i} - 202{0+i}</span>
                 </div>
                 <div className="md:w-3/4">
                    <h3 className="text-xl font-bold mb-1">Bachelor of Science in Computer Science</h3>
                    <p className="text-primary font-medium mb-2">University Name {i}</p>
                    <p className="text-muted-foreground">
                      Graduated with honors. Specialized in Software Engineering and Artificial Intelligence.
                      Participated in various hackathons and coding competitions.
                    </p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hobbies Section */}
      <section id="hobbies" className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">Hobbies & Interests</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
             {["Photography", "Traveling", "Gaming", "Reading", "Cooking", "Hiking", "Music", "Coding"].map((hobby) => (
                <div key={hobby} className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-muted/50 transition-colors aspect-square">
                    {/* Placeholder Icon */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 mb-4 flex items-center justify-center text-primary text-xl font-bold">
                        {hobby[0]}
                    </div>
                    <span className="font-medium">{hobby}</span>
                </div>
             ))}
        </div>
      </section>
    </div>
  );
}
