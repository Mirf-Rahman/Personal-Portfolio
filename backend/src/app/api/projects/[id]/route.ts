import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/projects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id));
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      titleFr,
      description,
      descriptionFr,
      technologies,
      imageUrl,
      liveUrl,
      githubUrl,
      featured,
      order,
      shouldSwap,
    } = body;

    if (order !== undefined && shouldSwap === true) {
      const result = await db.transaction(async (tx) => {
        const [currentProject] = await tx
          .select()
          .from(schema.projects)
          .where(eq(schema.projects.id, id));

        if (!currentProject) throw new Error("NOT_FOUND");

        const [targetProject] = await tx
          .select()
          .from(schema.projects)
          .where(eq(schema.projects.order, order));

        if (!targetProject) throw new Error("TARGET_NOT_FOUND");

        if (targetProject.id === id) {
          const [updated] = await tx
            .update(schema.projects)
            .set({ order, updatedAt: new Date() })
            .where(eq(schema.projects.id, id))
            .returning();
          return { updatedProject: updated };
        }

        const [updatedProject, swappedProject] = await Promise.all([
          tx
            .update(schema.projects)
            .set({ order: targetProject.order, updatedAt: new Date() })
            .where(eq(schema.projects.id, id))
            .returning(),
          tx
            .update(schema.projects)
            .set({ order: currentProject.order, updatedAt: new Date() })
            .where(eq(schema.projects.id, targetProject.id))
            .returning(),
        ]);

        return {
          updatedProject: updatedProject[0],
          swappedProject: swappedProject[0],
        };
      });

      return NextResponse.json(result.updatedProject);
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (title !== undefined) updatePayload.title = title;
    if (titleFr !== undefined) updatePayload.titleFr = titleFr || null;
    if (description !== undefined) updatePayload.description = description;
    if (descriptionFr !== undefined)
      updatePayload.descriptionFr = descriptionFr || null;
    if (technologies !== undefined) updatePayload.technologies = technologies;
    if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl || null;
    if (liveUrl !== undefined) updatePayload.liveUrl = liveUrl || null;
    if (githubUrl !== undefined) updatePayload.githubUrl = githubUrl || null;
    if (featured !== undefined) updatePayload.featured = featured;
    if (order !== undefined) updatePayload.order = order;

    const [updated] = await db
      .update(schema.projects)
      .set(updatePayload as typeof schema.projects.$inferInsert)
      .where(eq(schema.projects.id, id))
      .returning();
    if (!updated)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND")
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      if (error.message === "TARGET_NOT_FOUND")
        return NextResponse.json(
          { error: "Target position not found" },
          { status: 404 },
        );
    }
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(schema.projects)
      .where(eq(schema.projects.id, id))
      .returning();
    if (!deleted)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
