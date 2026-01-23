import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// POST /api/hobbies/swap-order - Atomically swap order of two hobbies (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hobbyId1, hobbyId2 } = body;

    if (!hobbyId1 || !hobbyId2) {
      return NextResponse.json(
        { error: "Both hobbyId1 and hobbyId2 are required" },
        { status: 400 }
      );
    }

    if (hobbyId1 === hobbyId2) {
      return NextResponse.json(
        { error: "Cannot swap a hobby with itself" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [h1, h2] = await Promise.all([
        tx.select().from(schema.hobbies).where(eq(schema.hobbies.id, hobbyId1)),
        tx.select().from(schema.hobbies).where(eq(schema.hobbies.id, hobbyId2)),
      ]);

      if (!h1[0]) throw new Error("NOT_FOUND_1");
      if (!h2[0]) throw new Error("NOT_FOUND_2");

      const [updated1, updated2] = await Promise.all([
        tx
          .update(schema.hobbies)
          .set({ order: h2[0].order, updatedAt: new Date() })
          .where(eq(schema.hobbies.id, hobbyId1))
          .returning(),
        tx
          .update(schema.hobbies)
          .set({ order: h1[0].order, updatedAt: new Date() })
          .where(eq(schema.hobbies.id, hobbyId2))
          .returning(),
      ]);

      return { hobby1: updated1[0], hobby2: updated2[0] };
    });

    return NextResponse.json({
      message: "Hobbies swapped successfully",
      hobby1: result.hobby1,
      hobby2: result.hobby2,
    });
  } catch (error) {
    console.error("Error swapping hobby orders:", error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND_1") {
        return NextResponse.json({ error: "First hobby not found" }, { status: 404 });
      }
      if (error.message === "NOT_FOUND_2") {
        return NextResponse.json({ error: "Second hobby not found" }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to swap hobby orders" },
      { status: 500 }
    );
  }
}
