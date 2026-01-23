import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/experiences/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [exp] = await db.select().from(schema.experiences).where(eq(schema.experiences.id, id));
    if (!exp) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    return NextResponse.json(exp);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}

// PUT /api/experiences/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      company,
      position,
      positionFr,
      description,
      descriptionFr,
      startDate,
      endDate,
      current,
      location,
      order,
      shouldSwap,
    } = body;

    if (order !== undefined && shouldSwap === true) {
      const result = await db.transaction(async (tx) => {
        const [currentExp] = await tx
          .select()
          .from(schema.experiences)
          .where(eq(schema.experiences.id, id));

        if (!currentExp) throw new Error("NOT_FOUND");

        const [targetExp] = await tx
          .select()
          .from(schema.experiences)
          .where(eq(schema.experiences.order, order));

        if (!targetExp) throw new Error("TARGET_NOT_FOUND");

        if (targetExp.id === id) {
          const [updated] = await tx
            .update(schema.experiences)
            .set({ order, updatedAt: new Date() })
            .where(eq(schema.experiences.id, id))
            .returning();
          return { updatedExperience: updated };
        }

        const [updatedExp, swappedExp] = await Promise.all([
          tx
            .update(schema.experiences)
            .set({ order: targetExp.order, updatedAt: new Date() })
            .where(eq(schema.experiences.id, id))
            .returning(),
          tx
            .update(schema.experiences)
            .set({ order: currentExp.order, updatedAt: new Date() })
            .where(eq(schema.experiences.id, targetExp.id))
            .returning(),
        ]);

        return { updatedExperience: updatedExp[0], swappedExperience: swappedExp[0] };
      });

      return NextResponse.json(result.updatedExperience);
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (company !== undefined) updatePayload.company = company;
    if (position !== undefined) updatePayload.position = position;
    if (positionFr !== undefined) updatePayload.positionFr = positionFr || null;
    if (description !== undefined) updatePayload.description = description;
    if (descriptionFr !== undefined) updatePayload.descriptionFr = descriptionFr || null;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = endDate ? new Date(endDate) : null;
    if (current !== undefined) updatePayload.current = current;
    if (location !== undefined) updatePayload.location = location;
    if (order !== undefined) updatePayload.order = order;

    const [updated] = await db
      .update(schema.experiences)
      .set(updatePayload as typeof schema.experiences.$inferInsert)
      .where(eq(schema.experiences.id, id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating experience:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND")
        return NextResponse.json({ error: "Experience not found" }, { status: 404 });
      if (error.message === "TARGET_NOT_FOUND")
        return NextResponse.json({ error: "Target position not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

// DELETE /api/experiences/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.experiences).where(eq(schema.experiences.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
