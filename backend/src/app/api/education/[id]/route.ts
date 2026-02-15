import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, gt, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/education/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [edu] = await db.select().from(schema.education).where(eq(schema.education.id, id));
    if (!edu) return NextResponse.json({ error: "Education not found" }, { status: 404 });
    return NextResponse.json(edu);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 });
  }
}

// PUT /api/education/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      institution,
      degree,
      degreeFr,
      field,
      fieldFr,
      startDate,
      endDate,
      current,
      description,
      descriptionFr,
      order,
      shouldSwap,
    } = body;

    if (order !== undefined && shouldSwap === true) {
      const result = await db.transaction(async (tx) => {
        const [currentEdu] = await tx
          .select()
          .from(schema.education)
          .where(eq(schema.education.id, id));

        if (!currentEdu) throw new Error("NOT_FOUND");

        const [targetEdu] = await tx
          .select()
          .from(schema.education)
          .where(eq(schema.education.order, order));

        if (!targetEdu) throw new Error("TARGET_NOT_FOUND");

        if (targetEdu.id === id) {
          const [updated] = await tx
            .update(schema.education)
            .set({ order, updatedAt: new Date() })
            .where(eq(schema.education.id, id))
            .returning();
          return { updatedEducation: updated };
        }

        const [updatedEdu, swappedEdu] = await Promise.all([
          tx
            .update(schema.education)
            .set({ order: targetEdu.order, updatedAt: new Date() })
            .where(eq(schema.education.id, id))
            .returning(),
          tx
            .update(schema.education)
            .set({ order: currentEdu.order, updatedAt: new Date() })
            .where(eq(schema.education.id, targetEdu.id))
            .returning(),
        ]);

        return { updatedEducation: updatedEdu[0], swappedEducation: swappedEdu[0] };
      });

      return NextResponse.json(result.updatedEducation);
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (institution !== undefined) updatePayload.institution = institution;
    if (degree !== undefined) updatePayload.degree = degree;
    if (degreeFr !== undefined) updatePayload.degreeFr = degreeFr || null;
    if (field !== undefined) updatePayload.field = field;
    if (fieldFr !== undefined) updatePayload.fieldFr = fieldFr || null;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = endDate ? new Date(endDate) : null;
    if (current !== undefined) updatePayload.current = current;
    if (description !== undefined) updatePayload.description = description || null;
    if (descriptionFr !== undefined) updatePayload.descriptionFr = descriptionFr || null;
    if (order !== undefined) updatePayload.order = order;

    const [updated] = await db
      .update(schema.education)
      .set(updatePayload as typeof schema.education.$inferInsert)
      .where(eq(schema.education.id, id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Education not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating education:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND")
        return NextResponse.json({ error: "Education not found" }, { status: 404 });
      if (error.message === "TARGET_NOT_FOUND")
        return NextResponse.json({ error: "Target position not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update education" }, { status: 500 });
  }
}

// DELETE /api/education/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    
    // First get the order of the education being deleted
    const [eduToDelete] = await db
      .select({ order: schema.education.order })
      .from(schema.education)
      .where(eq(schema.education.id, id));

    if (!eduToDelete) return NextResponse.json({ error: "Education not found" }, { status: 404 });

    const deletedOrder = eduToDelete.order;

    // Delete the education and reorder remaining items in a transaction
    await db.transaction(async (tx) => {
      // Delete the education
      await tx
        .delete(schema.education)
        .where(eq(schema.education.id, id));

      // Decrement order of all items with higher order using Drizzle sql
      await tx.execute(sql`UPDATE education SET "order" = "order" - 1 WHERE "order" > ${deletedOrder}`);
    });

    return NextResponse.json({ message: "Education deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete education" }, { status: 500 });
  }
}
