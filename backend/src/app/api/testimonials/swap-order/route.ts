import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// POST /api/testimonials/swap-order - Atomically swap order of two approved testimonials (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { testimonialId1, testimonialId2 } = body;

    if (!testimonialId1 || !testimonialId2) {
      return NextResponse.json(
        { error: "Both testimonialId1 and testimonialId2 are required" },
        { status: 400 }
      );
    }

    if (testimonialId1 === testimonialId2) {
      return NextResponse.json(
        { error: "Cannot swap a testimonial with itself" },
        { status: 400 }
      );
    }

    // Perform atomic swap in a transaction
    const result = await db.transaction(async (tx) => {
      // Get both testimonials (must be approved)
      const [testimonial1, testimonial2] = await Promise.all([
        tx
          .select()
          .from(schema.testimonials)
          .where(and(
            eq(schema.testimonials.id, testimonialId1),
            eq(schema.testimonials.approved, true)
          )),
        tx
          .select()
          .from(schema.testimonials)
          .where(and(
            eq(schema.testimonials.id, testimonialId2),
            eq(schema.testimonials.approved, true)
          )),
      ]);

      if (!testimonial1[0]) {
        throw new Error("NOT_FOUND_1");
      }

      if (!testimonial2[0]) {
        throw new Error("NOT_FOUND_2");
      }

      // Swap orders atomically: both updates in same transaction
      const [updatedTestimonial1, updatedTestimonial2] = await Promise.all([
        tx
          .update(schema.testimonials)
          .set({
            order: testimonial2[0].order,
            updatedAt: new Date(),
          })
          .where(eq(schema.testimonials.id, testimonialId1))
          .returning(),
        tx
          .update(schema.testimonials)
          .set({
            order: testimonial1[0].order,
            updatedAt: new Date(),
          })
          .where(eq(schema.testimonials.id, testimonialId2))
          .returning(),
      ]);

      return {
        testimonial1: updatedTestimonial1[0],
        testimonial2: updatedTestimonial2[0],
      };
    });

    return NextResponse.json({
      message: "Testimonials swapped successfully",
      testimonial1: result.testimonial1,
      testimonial2: result.testimonial2,
    });
  } catch (error) {
    console.error("Error swapping testimonial orders:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND_1") {
        return NextResponse.json(
          { error: "First testimonial not found or not approved" },
          { status: 404 }
        );
      }
      if (error.message === "NOT_FOUND_2") {
        return NextResponse.json(
          { error: "Second testimonial not found or not approved" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to swap testimonial orders" },
      { status: 500 }
    );
  }
}
