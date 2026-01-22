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

    // Seed Skills
    const skills = await db.insert(schema.skills).values([
      { name: "React", category: "Frontend", order: 1 },
      { name: "TypeScript", category: "Frontend", order: 2 },
      { name: "Next.js", category: "Frontend", order: 3 },
      { name: "Node.js", category: "Backend", order: 4 },
      { name: "PostgreSQL", category: "Database", order: 5 },
      { name: "Docker", category: "DevOps", order: 6 },
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
        institution: "University of Example",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: new Date("2018-09-01"),
        endDate: new Date("2022-05-15"),
        current: false,
        description: "Focused on software engineering and data structures",
        order: 1,
      },
    ]).returning();
    console.log(`✅ Seeded ${educationEntries.length} education entries`);

    // Seed Experiences
    const experiencesData = await db.insert(schema.experiences).values([
      {
        company: "Tech Corp",
        position: "Senior Full Stack Developer",
        description: "Led development of enterprise web applications using React and Node.js",
        location: "San Francisco, CA",
        startDate: new Date("2022-06-01"),
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
