/**
 * Script to add default icon URLs to existing skills
 * Run this script to populate icon URLs for skills that don't have them
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema.js";
import { eq, isNull } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;

// Default icon URLs for common technologies
const defaultIcons: Record<string, string> = {
  "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  "HTML5": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  "CSS3": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  "Git": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  "GitHub": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  "AWS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
  "Linux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  "Express": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  "TailwindCSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg",
  "Vue.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  "Angular": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
  "Java": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  "C#": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  "Ruby": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg",
  "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  "Rust": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg",
};

async function addSkillIcons() {
  console.log("🎨 Adding icon URLs to skills...");

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // Get all skills without icon URLs
    const skillsWithoutIcons = await db
      .select()
      .from(schema.skills)
      .where(isNull(schema.skills.iconUrl));

    console.log(`Found ${skillsWithoutIcons.length} skills without icons`);

    let updated = 0;
    for (const skill of skillsWithoutIcons) {
      const iconUrl = defaultIcons[skill.name];
      if (iconUrl) {
        await db
          .update(schema.skills)
          .set({ iconUrl, updatedAt: new Date() })
          .where(eq(schema.skills.id, skill.id));
        console.log(`✅ Added icon for ${skill.name}`);
        updated++;
      } else {
        console.log(`⚠️  No default icon found for ${skill.name}`);
      }
    }

    console.log(`\n✨ Updated ${updated} skills with icon URLs`);
  } catch (error) {
    console.error("❌ Error adding skill icons:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addSkillIcons()
    .then(() => {
      console.log("✅ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
}

export { addSkillIcons };
