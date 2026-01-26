import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/lib/db/schema.js";

const connectionString = process.env.DATABASE_URL!;

async function seed() {
  console.log("🌱 Starting database seed...");

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // Check if data already exists
    const existingSkills = await db.query.skills.findMany();
    if (existingSkills.length > 0) {
      console.log("✅ Database already seeded. Skipping...");
      await client.end();
      return;
    }

    console.log("📝 Seeding initial data...");

    // Default icon URLs for skills
    const skillIcons: Record<string, string> = {
      React:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      TypeScript:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      "Next.js":
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
      "Node.js":
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      PostgreSQL:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      Docker:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      Python:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    };

    // Seed Skills
    const skills = await db
      .insert(schema.skills)
      .values([
        {
          name: "React",
          category: "Frontend",
          order: 1,
          iconUrl: skillIcons["React"],
        },
        {
          name: "TypeScript",
          category: "Frontend",
          order: 2,
          iconUrl: skillIcons["TypeScript"],
        },
        {
          name: "Next.js",
          category: "Frontend",
          order: 3,
          iconUrl: skillIcons["Next.js"],
        },
        {
          name: "Node.js",
          category: "Backend",
          order: 4,
          iconUrl: skillIcons["Node.js"],
        },
        {
          name: "PostgreSQL",
          category: "Database",
          order: 5,
          iconUrl: skillIcons["PostgreSQL"],
        },
        {
          name: "Docker",
          category: "DevOps",
          order: 6,
          iconUrl: skillIcons["Docker"],
        },
      ])
      .returning();
    console.log(`✅ Seeded ${skills.length} skills`);

    // Seed Projects
    const projects = await db
      .insert(schema.projects)
      .values([
        {
          title: "CityPulse Montréal 2035",
          description:
            "AI-powered urban stress digital twin for Montréal city planning with real-time visualization and scenario modeling.",
          technologies: [
            "Next.js",
            "TypeScript",
            "Flask",
            "GeoPandas",
            "deck.gl",
            "MapLibre GL",
          ],
          githubUrl: "https://github.com/MBF-YVL/hackathon-project",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 1,
        },
        {
          title: "Aman Skies",
          description:
            "Weather forecast app with integrated prayer times, notifications, and air quality tracking.",
          technologies: [
            "React",
            "TypeScript",
            "Vite",
            "OpenWeather API",
            "Axios",
            "date-fns",
            "Vitest",
          ],
          githubUrl: "https://github.com/Mirf-Rahman/aman-skies",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 2,
        },
        {
          title: "Football Microservice",
          description:
            "Java Spring Boot microservices architecture demo for a football store with API Gateway and multiple service domains.",
          technologies: [
            "Java",
            "Spring Boot",
            "Spring Data JPA",
            "Spring Security",
            "PostgreSQL",
            "Docker",
            "Maven",
          ],
          githubUrl: "https://github.com/Mirf-Rahman/football-microservice",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 3,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${projects.length} projects`);

    // Seed Education
    const educationEntries = await db
      .insert(schema.education)
      .values([
        {
          institution: "Champlain College Saint-Lambert",
          degree: "DEC",
          field: "Computer Science",
          startDate: new Date("2023-08-01"),
          endDate: new Date("2026-06-15"),
          current: false,
          description: "Focused on software engineering and data structures",
          order: 1,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${educationEntries.length} education entries`);

    // Seed Experiences
    const experiencesData = await db
      .insert(schema.experiences)
      .values([
        {
          company: "L'Original (Artur.art)",
          position: "Junior Full Stack Developer (Internship)",
          description:
            "Led development of enterprise web applications using React and Next.js",
          location: "Montreal, QC",
          startDate: new Date("2026-02-01"),
          endDate: null,
          current: true,
          order: 1,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${experiencesData.length} experiences`);

    // Seed Hobbies
    const hobbiesData = await db
      .insert(schema.hobbies)
      .values([
        {
          name: "Gaming",
          description: "Story & FPS games on PC",
          order: 1,
        },
        {
          name: "Visual Arts",
          description: "Traditional painting & digital design",
          order: 2,
        },
        { name: "Video Editing", description: "Visual storytelling with Premiere Pro", order: 3 },
      ])
      .returning();
    console.log(`✅ Seeded ${hobbiesData.length} hobbies`);

    // Seed Testimonials
    const testimonialsData = await db
      .insert(schema.testimonials)
      .values([
        {
          name: "Sarah Johnson",
          position: "Senior Product Manager",
          company: "TechCorp Inc.",
          content:
            "Working with this developer was an absolute pleasure. They delivered high-quality code on time and showed exceptional problem-solving skills. Their attention to detail and commitment to best practices really set them apart.",
          approved: true,
          order: 1,
        },
        {
          name: "Michael Chen",
          position: "CTO",
          company: "StartupHub",
          content:
            "Exceptional technical skills combined with great communication. They quickly understood our complex requirements and delivered a scalable solution that exceeded our expectations. Would definitely work with them again!",
          approved: true,
          order: 2,
        },
        {
          name: "Emily Rodriguez",
          position: "Engineering Lead",
          company: "Digital Solutions Ltd.",
          content:
            "One of the most talented developers I've had the pleasure of working with. Their expertise in full-stack development and modern frameworks helped us launch our product ahead of schedule. Highly recommended!",
          approved: true,
          order: 3,
        },
        {
          name: "David Thompson",
          position: "Founder & CEO",
          company: "InnovateLab",
          content:
            "Not only did they deliver excellent code, but they also provided valuable insights on architecture and user experience. Their proactive approach and dedication to the project made all the difference. A true professional!",
          approved: true,
          order: 4,
        },
        {
          name: "Lisa Wang",
          position: "Head of Development",
          company: "CloudTech Solutions",
          content:
            "Impressive technical abilities and a genuine passion for creating elegant solutions. They tackled challenging problems with creativity and efficiency. Their collaborative nature made them a valuable team member throughout the project.",
          approved: true,
          order: 5,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${testimonialsData.length} testimonials`);

    console.log("🎉 Database seeding completed successfully!");

    await client.end();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await client.end();
    process.exit(1);
  }

  process.exit(0);
}

seed();
