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
      "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
      "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    };

    // Seed Skills
    const skills = await db.insert(schema.skills).values([
      { name: "React", category: "Frontend", order: 1, iconUrl: skillIcons["React"] },
      { name: "TypeScript", category: "Frontend", order: 2, iconUrl: skillIcons["TypeScript"] },
      { name: "Next.js", category: "Frontend", order: 3, iconUrl: skillIcons["Next.js"] },
      { name: "Node.js", category: "Backend", order: 4, iconUrl: skillIcons["Node.js"] },
      { name: "PostgreSQL", category: "Database", order: 5, iconUrl: skillIcons["PostgreSQL"] },
      { name: "Docker", category: "DevOps", order: 6, iconUrl: skillIcons["Docker"] },
    ]).returning();
    console.log(`✅ Seeded ${skills.length} skills`);

    // Seed Projects
    const projects = await db.insert(schema.projects).values([
      {
        title: "Personal Portfolio",
        description: "A modern portfolio website built with Next.js and PostgreSQL",
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
        featured: true,
        order: 1,
      },
      {
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with real-time inventory management",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        featured: true,
        order: 2,
      },
    ]).returning();
    console.log(`✅ Seeded ${projects.length} projects`);

    // Seed Education
    const educationEntries = await db.insert(schema.education).values([
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
    ]).returning();
    console.log(`✅ Seeded ${educationEntries.length} education entries`);

    // Seed Experiences
    const experiencesData = await db.insert(schema.experiences).values([
      {
        company: "L'Original (Artur.art)",
        position: "Junior Full Stack Developer (Internship)",
        description: "Led development of enterprise web applications using React and Next.js",
        location: "Montreal, QC",
        startDate: new Date("2026-02-01"),
        endDate: null,
        current: true,
        order: 1,
      }
    ]).returning();
    console.log(`✅ Seeded ${experiencesData.length} experiences`);

    // Seed Hobbies
    const hobbiesData = await db.insert(schema.hobbies).values([
      { name: "Photography", description: "Landscape and street photography", order: 1 },
      { name: "Reading", description: "Science fiction and technology books", order: 2 },
      { name: "Hiking", description: "Exploring nature trails", order: 3 },
    ]).returning();
    console.log(`✅ Seeded ${hobbiesData.length} hobbies`);

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
