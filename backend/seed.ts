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
      // Ensure contact info exists (for DBs seeded before contact_info was added)
      const existingContact = await db
        .select()
        .from(schema.contactInfo)
        .limit(1);
      if (existingContact.length === 0) {
        await db.insert(schema.contactInfo).values({
          email: "mirfaiyazrahman@gmail.com",
          linkedIn:
            "https://www.linkedin.com/in/faiyazur-rahman-mir-828173309/",
          github: "https://github.com/Mirf-Rahman",
        });
        console.log("✅ Seeded contact info.");
      }
      console.log("✅ Database already seeded. Skipping...");
      await client.end();
      return;
    }

    console.log("📝 Seeding initial data...");

    // Default icon URLs for skills (devicons + simple-icons for crisper SVGs)
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
      Java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      "Spring Boot":
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
      Tailwind:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
      HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      JavaScript:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      Vite: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg",
      Git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
      GraphQL: "https://cdn.simpleicons.org/graphql/E10098",
      Redis:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
      Flask:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
      FastAPI:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
      SQL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      Maven:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/maven/maven-original.svg",
      "C#": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
      Grafana:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg",
      Linux:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
      "Raspberry Pi":
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg",
      MQTT: "https://cdn.simpleicons.org/eclipsemosquitto/06b6d4",
      "Better Auth":
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      Azure:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
      Kotlin:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
      PHP: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
      Swift:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
      "ASP.NET MVC":
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg",
      Laravel:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
      Supabase: "https://cdn.simpleicons.org/supabase/3ECF8E",
      MongoDB:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    };

    // Seed Skills (only skills with icons in skillIcons above)
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
          name: "JavaScript",
          category: "Frontend",
          order: 4,
          iconUrl: skillIcons["JavaScript"],
        },
        {
          name: "Tailwind",
          category: "Frontend",
          order: 5,
          iconUrl: skillIcons["Tailwind"],
        },
        {
          name: "HTML",
          category: "Frontend",
          order: 6,
          iconUrl: skillIcons["HTML"],
        },
        {
          name: "CSS",
          category: "Frontend",
          order: 7,
          iconUrl: skillIcons["CSS"],
        },
        {
          name: "Vite",
          category: "Frontend",
          order: 8,
          iconUrl: skillIcons["Vite"],
        },
        {
          name: "Node.js",
          category: "Backend",
          order: 9,
          iconUrl: skillIcons["Node.js"],
        },
        {
          name: "Java",
          category: "Backend",
          order: 10,
          iconUrl: skillIcons["Java"],
        },
        {
          name: "Spring Boot",
          category: "Backend",
          order: 11,
          iconUrl: skillIcons["Spring Boot"],
        },
        {
          name: "Python",
          category: "Backend",
          order: 12,
          iconUrl: skillIcons["Python"],
        },
        {
          name: "Flask",
          category: "Backend",
          order: 13,
          iconUrl: skillIcons["Flask"],
        },
        {
          name: "FastAPI",
          category: "Backend",
          order: 14,
          iconUrl: skillIcons["FastAPI"],
        },
        {
          name: "GraphQL",
          category: "Backend",
          order: 15,
          iconUrl: skillIcons["GraphQL"],
        },
        {
          name: "Better Auth",
          category: "Backend",
          order: 16,
          iconUrl: skillIcons["Better Auth"],
        },
        {
          name: "PHP",
          category: "Backend",
          order: 17,
          iconUrl: skillIcons["PHP"],
        },
        {
          name: "Laravel",
          category: "Backend",
          order: 18,
          iconUrl: skillIcons["Laravel"],
        },
        {
          name: "ASP.NET MVC",
          category: "Backend",
          order: 19,
          iconUrl: skillIcons["ASP.NET MVC"],
        },
        {
          name: "PostgreSQL",
          category: "Database",
          order: 20,
          iconUrl: skillIcons["PostgreSQL"],
        },
        {
          name: "MongoDB",
          category: "Database",
          order: 21,
          iconUrl: skillIcons["MongoDB"],
        },
        {
          name: "SQL",
          category: "Database",
          order: 22,
          iconUrl: skillIcons["SQL"],
        },
        {
          name: "Redis",
          category: "Database",
          order: 23,
          iconUrl: skillIcons["Redis"],
        },
        {
          name: "Supabase",
          category: "Database",
          order: 24,
          iconUrl: skillIcons["Supabase"],
        },
        {
          name: "Docker",
          category: "DevOps",
          order: 25,
          iconUrl: skillIcons["Docker"],
        },
        {
          name: "Azure",
          category: "DevOps",
          order: 26,
          iconUrl: skillIcons["Azure"],
        },
        {
          name: "Git",
          category: "DevOps",
          order: 27,
          iconUrl: skillIcons["Git"],
        },
        {
          name: "Maven",
          category: "DevOps",
          order: 28,
          iconUrl: skillIcons["Maven"],
        },
        {
          name: "Grafana",
          category: "DevOps",
          order: 29,
          iconUrl: skillIcons["Grafana"],
        },
        {
          name: "Linux",
          category: "DevOps",
          order: 30,
          iconUrl: skillIcons["Linux"],
        },
        {
          name: "C#",
          category: "Languages",
          order: 31,
          iconUrl: skillIcons["C#"],
        },
        {
          name: "Kotlin",
          category: "Languages",
          order: 32,
          iconUrl: skillIcons["Kotlin"],
        },
        {
          name: "Swift",
          category: "Languages",
          order: 33,
          iconUrl: skillIcons["Swift"],
        },
        {
          name: "Raspberry Pi",
          category: "IoT",
          order: 34,
          iconUrl: skillIcons["Raspberry Pi"],
        },
        {
          name: "MQTT",
          category: "IoT",
          order: 35,
          iconUrl: skillIcons["MQTT"],
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
          titleFr: "CityPulse Montréal 2035",
          description:
            "AI-powered urban stress digital twin for Montréal city planning with real-time visualization and scenario modeling.",
          descriptionFr:
            "Jumeau numérique du stress urbain alimenté par l'IA pour l'urbanisme montréalais, avec visualisation en temps réel et modélisation de scénarios.",
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
          titleFr: "Aman Skies",
          description:
            "Weather forecast app with integrated prayer times, notifications, and air quality tracking.",
          descriptionFr:
            "Application météo avec heures de prière, notifications et suivi de la qualité de l'air.",
          technologies: [
            "React",
            "TypeScript",
            "Vite",
            "OpenWeather API",
            "Axios",
            "date-fns",
            "Vitest",
          ],
          liveUrl: "https://weather-app-mir.vercel.app",
          githubUrl: "https://github.com/Mirf-Rahman/aman-skies",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 2,
        },
        {
          title: "Football Microservice",
          titleFr: "Microservice Football",
          description:
            "Java Spring Boot microservices architecture demo for a football store with API Gateway and multiple service domains.",
          descriptionFr:
            "Démo d'architecture microservices Java Spring Boot pour une boutique football avec passerelle API et plusieurs domaines.",
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
        {
          title: "Passion Jerseys Online Store",
          titleFr: "Boutique en ligne Passion Jerseys",
          description:
            "Full-stack web app: multi-variant catalogue, personalization, secure checkout, and bilingual admin dashboard. A bilingual (EN/FR) e-commerce solution for selling customized sports jerseys.",
          descriptionFr:
            "Application web full-stack : catalogue multi-variantes, personnalisation, paiement sécurisé et tableau de bord admin bilingue. Solution e-commerce bilingue (EN/FR) pour la vente de maillots sportifs personnalisés.",
          technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Spring Boot",
            "Java",
            "Better Auth",
            "PostgreSQL",
            "Stripe",
          ],
          liveUrl: "https://passionjerseys.me/",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 4,
        },
        {
          title: "Retail Inventory Platform",
          titleFr: "Plateforme de gestion d'inventaire retail",
          description:
            "Multi-store Demand Forecasting & Auto-Replenishment SaaS. Comprehensive retail inventory management with intelligent demand forecasting, automated purchase order generation, and real-time analytics.",
          descriptionFr:
            "SaaS de prévision de la demande multi-magasins et réapprovisionnement automatique. Gestion complète de l'inventaire retail avec prévision intelligente, génération automatique de bons de commande et analytiques en temps réel.",
          technologies: [
            "Java",
            "Spring Boot",
            "Python",
            "FastAPI",
            "React",
            "TypeScript",
            "PostgreSQL",
            "TimescaleDB",
            "Redis",
            "GraphQL",
            "Docker",
            "Prometheus",
            "Grafana",
            "dbt",
          ],
          githubUrl:
            "https://github.com/AmineBaha-oss/retail-inventory-platform",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: false,
          order: 5,
        },
        {
          title: "Champlain Pet Clinic",
          titleFr: "Clinique vétérinaire Champlain",
          description:
            "Full-stack simulation of a veterinary clinic built with microservices architecture; collaborated with 44 students. Developed the customers service, created CRUD endpoints, handled API flows through the Gateway.",
          descriptionFr:
            "Simulation full-stack d'une clinique vétérinaire en architecture microservices; collaboration avec 44 étudiants. Développement du service clients, création des endpoints CRUD, gestion des flux API via la passerelle.",
          technologies: [
            "Java",
            "Spring Boot",
            "React",
            "REST",
            "Docker Compose",
            "JUnit",
            "MockMvc",
            "Postman",
            "Agile",
            "Scrum",
          ],
          githubUrl: "https://github.com/cgerard321/champlain_petclinic",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 6,
        },
        {
          title: "SwiftRover",
          titleFr: "SwiftRover",
          description:
            "IoT Smart Mobile Robot (Raspberry Pi) - Complete IoT system with telemetry, autonomous navigation, and Flask web application for remote monitoring and control. Line-following with IR sensors, obstacle avoidance with ultrasonic, live data to Adafruit IO.",
          descriptionFr:
            "Robot mobile intelligent IoT (Raspberry Pi) - Système IoT complet avec télémétrie, navigation autonome et application web Flask pour le contrôle à distance. Suivi de ligne avec capteurs IR, évitement d'obstacles avec ultrason, données en direct vers Adafruit IO.",
          technologies: [
            "Python",
            "Flask",
            "Raspberry Pi",
            "GPIO",
            "MQTT",
            "Adafruit IO",
            "PostgreSQL",
          ],
          liveUrl: "https://swiftrover.onrender.com",
          githubUrl: "https://github.com/AarushP06/SwiftRover",
          imageUrl:
            "https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/GitHub-Logo.jpg",
          featured: true,
          order: 7,
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
          degreeFr: "DEC",
          field: "Computer Science",
          fieldFr: "Informatique",
          startDate: new Date("2023-08-01"),
          endDate: new Date("2026-06-15"),
          current: false,
          description: "Focused on software engineering and data structures",
          descriptionFr:
            "Concentration en génie logiciel et structures de données",
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
          company: "Champlain College Saint-Lambert",
          position: "Peer Tutor - Computer Science",
          positionFr: "Tuteur - Informatique",
          description:
            "One-on-one and group tutoring in Java, C#, data structures, SQL, and web fundamentals.",
          descriptionFr:
            "Tutorat individuel et en groupe en Java, C#, structures de données, SQL et bases du web.",
          location: "Saint-Lambert, QC",
          startDate: new Date("2025-09-01"),
          endDate: new Date("2025-10-31"),
          current: false,
          order: 1,
        },
        {
          company: "L'Original (Artur.art)",
          position: "Junior Full Stack Developer (Internship)",
          positionFr: "Développeur Full Stack Junior (Stage)",
          description:
            "Led development of enterprise web applications using React and Next.js",
          descriptionFr:
            "Direction du développement d'applications web d'entreprise avec React et Next.js",
          location: "Montreal, QC",
          startDate: new Date("2026-03-31"),
          endDate: new Date("2026-05-31"),
          current: false,
          order: 2,
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
          nameFr: "Jeux vidéo",
          description: "Story & FPS games on PC",
          descriptionFr: "Jeux narratifs et FPS sur PC",
          order: 1,
        },
        {
          name: "Visual Arts",
          nameFr: "Arts visuels",
          description: "Traditional painting & digital design",
          descriptionFr: "Peinture traditionnelle et design numérique",
          order: 2,
        },
        {
          name: "Video Editing",
          nameFr: "Montage vidéo",
          description: "Visual storytelling with Premiere Pro",
          descriptionFr: "Raconter des histoires en vidéo avec Premiere Pro",
          order: 3,
        },
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
          contentFr:
            "Travailler avec ce développeur a été un réel plaisir. Livraison de code de qualité à temps, et d'excellentes compétences en résolution de problèmes. Le souci du détail et les bonnes pratiques le distinguent vraiment.",
          approved: true,
          order: 1,
        },
        {
          name: "Michael Chen",
          position: "CTO",
          company: "StartupHub",
          content:
            "Exceptional technical skills combined with great communication. They quickly understood our complex requirements and delivered a scalable solution that exceeded our expectations. Would definitely work with them again!",
          contentFr:
            "Compétences techniques exceptionnelles et excellente communication. Ils ont vite saisi nos besoins complexes et livré une solution évolutive au-delà de nos attentes. Je retravaillerais volontiers avec eux !",
          approved: true,
          order: 2,
        },
        {
          name: "Emily Rodriguez",
          position: "Engineering Lead",
          company: "Digital Solutions Ltd.",
          content:
            "One of the most talented developers I've had the pleasure of working with. Their expertise in full-stack development and modern frameworks helped us launch our product ahead of schedule. Highly recommended!",
          contentFr:
            "L'un des développeurs les plus talentueux avec qui j'ai travaillé. Leur maîtrise du full-stack et des frameworks modernes nous a permis de lancer notre produit en avance. Je recommande vivement !",
          approved: true,
          order: 3,
        },
        {
          name: "David Thompson",
          position: "Founder & CEO",
          company: "InnovateLab",
          content:
            "Not only did they deliver excellent code, but they also provided valuable insights on architecture and user experience. Their proactive approach and dedication to the project made all the difference. A true professional!",
          contentFr:
            "En plus d'un excellent code, ils ont apporté des idées précieuses sur l'architecture et l'expérience utilisateur. Leur approche proactive et leur dévouement ont tout changé. Un vrai professionnel !",
          approved: true,
          order: 4,
        },
        {
          name: "Lisa Wang",
          position: "Head of Development",
          company: "CloudTech Solutions",
          content:
            "Impressive technical abilities and a genuine passion for creating elegant solutions. They tackled challenging problems with creativity and efficiency. Their collaborative nature made them a valuable team member throughout the project.",
          contentFr:
            "Capacités techniques impressionnantes et une vraie passion pour des solutions élégantes. Ils ont abordé des problèmes complexes avec créativité et efficacité. Leur esprit collaboratif en a fait un atout pour l'équipe.",
          approved: true,
          order: 5,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${testimonialsData.length} testimonials`);

    // Seed contact info (singleton)
    const existingContact = await db.select().from(schema.contactInfo).limit(1);
    if (existingContact.length === 0) {
      await db.insert(schema.contactInfo).values({
        email: "mirfaiyazrahman@gmail.com",
        linkedIn: "https://www.linkedin.com/in/faiyazur-rahman-mir-828173309/",
        github: "https://github.com/Mirf-Rahman",
      });
      console.log("✅ Seeded contact info.");
    }

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
