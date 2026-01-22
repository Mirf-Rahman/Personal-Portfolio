import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// POST /api/skills/swap-order - Atomically swap order of two skills (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { skillId1, skillId2 } = body;

    if (!skillId1 || !skillId2) {
      return NextResponse.json(
        { error: "Both skillId1 and skillId2 are required" },
        { status: 400 }
      );
    }

    if (skillId1 === skillId2) {
      return NextResponse.json(
        { error: "Cannot swap a skill with itself" },
        { status: 400 }
      );
    }

    // Perform atomic swap in a transaction
    const result = await db.transaction(async (tx) => {
      // Get both skills
      const [skill1, skill2] = await Promise.all([
        tx
          .select()
          .from(schema.skills)
          .where(eq(schema.skills.id, skillId1)),
        tx
          .select()
          .from(schema.skills)
          .where(eq(schema.skills.id, skillId2)),
      ]);

      if (!skill1[0]) {
        throw new Error("NOT_FOUND_1");
      }

      if (!skill2[0]) {
        throw new Error("NOT_FOUND_2");
      }

      // Swap orders atomically: both updates in same transaction
      const [updatedSkill1, updatedSkill2] = await Promise.all([
        tx
          .update(schema.skills)
          .set({
            order: skill2[0].order,
            updatedAt: new Date(),
          })
          .where(eq(schema.skills.id, skillId1))
          .returning(),
        tx
          .update(schema.skills)
          .set({
            order: skill1[0].order,
            updatedAt: new Date(),
          })
          .where(eq(schema.skills.id, skillId2))
          .returning(),
      ]);

      return {
        skill1: updatedSkill1[0],
        skill2: updatedSkill2[0],
      };
    });

    return NextResponse.json({
      message: "Skills swapped successfully",
      skill1: result.skill1,
      skill2: result.skill2,
    });
  } catch (error) {
    console.error("Error swapping skill orders:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND_1") {
        return NextResponse.json(
          { error: "First skill not found" },
          { status: 404 }
        );
      }
      if (error.message === "NOT_FOUND_2") {
        return NextResponse.json(
          { error: "Second skill not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to swap skill orders" },
      { status: 500 }
    );
  }
}
