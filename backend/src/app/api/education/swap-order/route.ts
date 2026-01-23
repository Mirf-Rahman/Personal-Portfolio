import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// POST /api/education/swap-order - Atomically swap order of two education entries (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { educationId1, educationId2 } = body;

    if (!educationId1 || !educationId2) {
      return NextResponse.json(
        { error: "Both educationId1 and educationId2 are required" },
        { status: 400 }
      );
    }

    if (educationId1 === educationId2) {
      return NextResponse.json(
        { error: "Cannot swap an education entry with itself" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [edu1, edu2] = await Promise.all([
        tx.select().from(schema.education).where(eq(schema.education.id, educationId1)),
        tx.select().from(schema.education).where(eq(schema.education.id, educationId2)),
      ]);

      if (!edu1[0]) throw new Error("NOT_FOUND_1");
      if (!edu2[0]) throw new Error("NOT_FOUND_2");

      const [updated1, updated2] = await Promise.all([
        tx
          .update(schema.education)
          .set({ order: edu2[0].order, updatedAt: new Date() })
          .where(eq(schema.education.id, educationId1))
          .returning(),
        tx
          .update(schema.education)
          .set({ order: edu1[0].order, updatedAt: new Date() })
          .where(eq(schema.education.id, educationId2))
          .returning(),
      ]);

      return { education1: updated1[0], education2: updated2[0] };
    });

    return NextResponse.json({
      message: "Education entries swapped successfully",
      education1: result.education1,
      education2: result.education2,
    });
  } catch (error) {
    console.error("Error swapping education orders:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND_1") {
        return NextResponse.json({ error: "First education entry not found" }, { status: 404 });
      }
      if (error.message === "NOT_FOUND_2") {
        return NextResponse.json({ error: "Second education entry not found" }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to swap education orders" },
      { status: 500 }
    );
  }
}
