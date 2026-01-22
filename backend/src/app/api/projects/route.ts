import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/projects - List all projects (public)
export async function GET() {
  try {
    const projects = await db
      .select()
      .from(schema.projects)
      .orderBy(schema.projects.order);

    const res = NextResponse.json(projects);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, titleFr, description, descriptionFr, technologies, imageUrl, liveUrl, githubUrl, featured, order } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    let orderValue = typeof order === "number" && order > 0 ? order : 0;
    if (orderValue === 0) {
      const rows = await db.select({ order: schema.projects.order }).from(schema.projects);
      const maxOrder = rows.length ? Math.max(...rows.map((r) => r.order)) : 0;
      orderValue = maxOrder + 1;
    }

    const [newProject] = await db
      .insert(schema.projects)
      .values({
        title,
        titleFr: titleFr || null,
        description,
        descriptionFr: descriptionFr || null,
        technologies: technologies || [],
        imageUrl: imageUrl || null,
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured: featured || false,
        order: orderValue,
      })
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
