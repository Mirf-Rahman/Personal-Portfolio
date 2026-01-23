import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/hobbies/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [hobby] = await db.select().from(schema.hobbies).where(eq(schema.hobbies.id, id));
    if (!hobby) return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    return NextResponse.json(hobby);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hobby" }, { status: 500 });
  }
}

// PUT /api/hobbies/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nameFr, description, descriptionFr, iconUrl, order, shouldSwap } = body;

    if (order !== undefined && shouldSwap === true) {
      const result = await db.transaction(async (tx) => {
        const [currentHobby] = await tx
          .select()
          .from(schema.hobbies)
          .where(eq(schema.hobbies.id, id));

        if (!currentHobby) throw new Error("NOT_FOUND");

        const [targetHobby] = await tx
          .select()
          .from(schema.hobbies)
          .where(eq(schema.hobbies.order, order));

        if (!targetHobby) throw new Error("TARGET_NOT_FOUND");

        if (targetHobby.id === id) {
          const [updated] = await tx
            .update(schema.hobbies)
            .set({ order, updatedAt: new Date() })
            .where(eq(schema.hobbies.id, id))
            .returning();
          return { updatedHobby: updated };
        }

        const [updatedHobby, swappedHobby] = await Promise.all([
          tx
            .update(schema.hobbies)
            .set({ order: targetHobby.order, updatedAt: new Date() })
            .where(eq(schema.hobbies.id, id))
            .returning(),
          tx
            .update(schema.hobbies)
            .set({ order: currentHobby.order, updatedAt: new Date() })
            .where(eq(schema.hobbies.id, targetHobby.id))
            .returning(),
        ]);

        return { updatedHobby: updatedHobby[0], swappedHobby: swappedHobby[0] };
      });

      return NextResponse.json(result.updatedHobby);
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updatePayload.name = name;
    if (nameFr !== undefined) updatePayload.nameFr = nameFr || null;
    if (description !== undefined) updatePayload.description = description || null;
    if (descriptionFr !== undefined) updatePayload.descriptionFr = descriptionFr || null;
    if (iconUrl !== undefined) updatePayload.iconUrl = iconUrl || null;
    if (order !== undefined) updatePayload.order = order;

    const [updated] = await db
      .update(schema.hobbies)
      .set(updatePayload as typeof schema.hobbies.$inferInsert)
      .where(eq(schema.hobbies.id, id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating hobby:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND")
        return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
      if (error.message === "TARGET_NOT_FOUND")
        return NextResponse.json({ error: "Target position not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update hobby" }, { status: 500 });
  }
}

// DELETE /api/hobbies/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.hobbies).where(eq(schema.hobbies.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    return NextResponse.json({ message: "Hobby deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete hobby" }, { status: 500 });
  }
}
