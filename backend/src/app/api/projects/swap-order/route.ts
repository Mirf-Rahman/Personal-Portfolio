import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// POST /api/projects/swap-order - Atomically swap order of two projects (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId1, projectId2 } = body;

    if (!projectId1 || !projectId2) {
      return NextResponse.json(
        { error: "Both projectId1 and projectId2 are required" },
        { status: 400 }
      );
    }

    if (projectId1 === projectId2) {
      return NextResponse.json(
        { error: "Cannot swap a project with itself" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [proj1, proj2] = await Promise.all([
        tx.select().from(schema.projects).where(eq(schema.projects.id, projectId1)),
        tx.select().from(schema.projects).where(eq(schema.projects.id, projectId2)),
      ]);

      if (!proj1[0]) throw new Error("NOT_FOUND_1");
      if (!proj2[0]) throw new Error("NOT_FOUND_2");

      const [updated1, updated2] = await Promise.all([
        tx
          .update(schema.projects)
          .set({ order: proj2[0].order, updatedAt: new Date() })
          .where(eq(schema.projects.id, projectId1))
          .returning(),
        tx
          .update(schema.projects)
          .set({ order: proj1[0].order, updatedAt: new Date() })
          .where(eq(schema.projects.id, projectId2))
          .returning(),
      ]);

      return { project1: updated1[0], project2: updated2[0] };
    });

    return NextResponse.json({
      message: "Projects swapped successfully",
      project1: result.project1,
      project2: result.project2,
    });
  } catch (error) {
    console.error("Error swapping project orders:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND_1") {
        return NextResponse.json({ error: "First project not found" }, { status: 404 });
      }
      if (error.message === "NOT_FOUND_2") {
        return NextResponse.json({ error: "Second project not found" }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to swap project orders" },
      { status: 500 }
    );
  }
}
