import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, gt, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/skills/[id] - Get a single skill (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [skill] = await db
      .select()
      .from(schema.skills)
      .where(eq(schema.skills.id, id));

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Error fetching skill:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

// PUT /api/skills/[id] - Update a skill (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, iconUrl, order, shouldSwap } = body;

    // If order is being changed and shouldSwap is true, swap the orders atomically
    if (order !== undefined && shouldSwap === true) {
      // Perform atomic swap in a transaction
      const result = await db.transaction(async (tx) => {
        // Get the current skill
        const [currentSkill] = await tx
          .select()
          .from(schema.skills)
          .where(eq(schema.skills.id, id));

        if (!currentSkill) {
          throw new Error("NOT_FOUND");
        }

        // Find the skill with the target order
        const [targetSkill] = await tx
          .select()
          .from(schema.skills)
          .where(eq(schema.skills.order, order));

        if (!targetSkill) {
          throw new Error("TARGET_NOT_FOUND");
        }

        // Skip swap if trying to swap with itself
        if (targetSkill.id === id) {
          // Just update the skill without swapping
          const [updatedSkill] = await tx
            .update(schema.skills)
            .set({
              ...(name && { name }),
              ...(category && { category }),
              ...(iconUrl !== undefined && { iconUrl }),
              order,
              updatedAt: new Date(),
            })
            .where(eq(schema.skills.id, id))
            .returning();
          return { updatedSkill, targetSkill: null };
        }

        // Swap orders atomically: both updates in same transaction
        const [updatedSkill, swappedSkill] = await Promise.all([
          tx
            .update(schema.skills)
            .set({
              ...(name && { name }),
              ...(category && { category }),
              ...(iconUrl !== undefined && { iconUrl }),
              order,
              updatedAt: new Date(),
            })
            .where(eq(schema.skills.id, id))
            .returning(),
          tx
            .update(schema.skills)
            .set({
              order: currentSkill.order,
              updatedAt: new Date(),
            })
            .where(eq(schema.skills.id, targetSkill.id))
            .returning(),
        ]);

        return { updatedSkill: updatedSkill[0], targetSkill: swappedSkill[0] };
      });

      return NextResponse.json(result.updatedSkill);
    }

    // Regular update without swapping
    const [updatedSkill] = await db
      .update(schema.skills)
      .set({
        ...(name && { name }),
        ...(category && { category }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(order !== undefined && { order }),
        updatedAt: new Date(),
      })
      .where(eq(schema.skills.id, id))
      .returning();

    if (!updatedSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[id] - Delete a skill (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // First get the order of the skill being deleted
    const [skillToDelete] = await db
      .select({ order: schema.skills.order })
      .from(schema.skills)
      .where(eq(schema.skills.id, id));

    if (!skillToDelete) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const deletedOrder = skillToDelete.order;

    // Delete the skill and reorder remaining items in a transaction
    await db.transaction(async (tx) => {
      // Delete the skill
      await tx
        .delete(schema.skills)
        .where(eq(schema.skills.id, id));

      // Decrement order of all items with higher order using Drizzle sql
      await tx.execute(sql`UPDATE skills SET "order" = "order" - 1 WHERE "order" > ${deletedOrder}`);
    });

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
