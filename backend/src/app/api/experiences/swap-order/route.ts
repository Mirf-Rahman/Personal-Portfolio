import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// POST /api/experiences/swap-order - Atomically swap order of two experiences (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { experienceId1, experienceId2 } = body;

    if (!experienceId1 || !experienceId2) {
      return NextResponse.json(
        { error: "Both experienceId1 and experienceId2 are required" },
        { status: 400 }
      );
    }

    if (experienceId1 === experienceId2) {
      return NextResponse.json(
        { error: "Cannot swap an experience with itself" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [exp1, exp2] = await Promise.all([
        tx.select().from(schema.experiences).where(eq(schema.experiences.id, experienceId1)),
        tx.select().from(schema.experiences).where(eq(schema.experiences.id, experienceId2)),
      ]);

      if (!exp1[0]) throw new Error("NOT_FOUND_1");
      if (!exp2[0]) throw new Error("NOT_FOUND_2");

      const [updated1, updated2] = await Promise.all([
        tx
          .update(schema.experiences)
          .set({ order: exp2[0].order, updatedAt: new Date() })
          .where(eq(schema.experiences.id, experienceId1))
          .returning(),
        tx
          .update(schema.experiences)
          .set({ order: exp1[0].order, updatedAt: new Date() })
          .where(eq(schema.experiences.id, experienceId2))
          .returning(),
      ]);

      return { experience1: updated1[0], experience2: updated2[0] };
    });

    return NextResponse.json({
      message: "Experiences swapped successfully",
      experience1: result.experience1,
      experience2: result.experience2,
    });
  } catch (error) {
    console.error("Error swapping experience orders:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND_1") {
        return NextResponse.json({ error: "First experience not found" }, { status: 404 });
      }
      if (error.message === "NOT_FOUND_2") {
        return NextResponse.json({ error: "Second experience not found" }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to swap experience orders" },
      { status: 500 }
    );
  }
}
