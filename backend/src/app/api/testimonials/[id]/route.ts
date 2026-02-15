import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, sql, and, gt } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { sanitizeTestimonialForm } from "@/lib/sanitize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const [testimonial] = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.id, id));
    if (!testimonial)
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );

    const response = NextResponse.json(testimonial);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch testimonial" },
      { status: 500 },
    );
  }
}

// PUT /api/testimonials/[id] - Update/approve testimonial (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      position,
      company,
      content,
      contentFr,
      approved,
      order,
      shouldSwap,
    } = body;

    // Get existing testimonial
    const [existing] = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.id, id));
    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    }

    // If order is being changed and shouldSwap is true, swap the orders atomically (only for approved testimonials)
    if (order !== undefined && shouldSwap === true && existing.approved) {
      const result = await db.transaction(async (tx) => {
        // Find the approved testimonial with the target order
        const [targetTestimonial] = await tx
          .select()
          .from(schema.testimonials)
          .where(
            and(
              eq(schema.testimonials.order, order),
              eq(schema.testimonials.approved, true),
            ),
          );

        if (!targetTestimonial) {
          throw new Error("TARGET_NOT_FOUND");
        }

        // Skip swap if trying to swap with itself
        if (targetTestimonial.id === id) {
          const updateData: Partial<typeof schema.testimonials.$inferInsert> = {
            updatedAt: new Date(),
          };
          if (name !== undefined) updateData.name = name;
          if (position !== undefined) updateData.position = position || null;
          if (company !== undefined) updateData.company = company || null;
          if (content !== undefined) updateData.content = content;
          if (contentFr !== undefined) updateData.contentFr = contentFr || null;
          if (approved !== undefined) updateData.approved = approved;
          updateData.order = order;

          const [updatedTestimonial] = await tx
            .update(schema.testimonials)
            .set(updateData)
            .where(eq(schema.testimonials.id, id))
            .returning();
          return { updatedTestimonial, targetTestimonial: null };
        }

        // Swap orders atomically
        const updateData: Partial<typeof schema.testimonials.$inferInsert> = {
          updatedAt: new Date(),
        };
        if (name !== undefined) updateData.name = name;
        if (position !== undefined) updateData.position = position || null;
        if (company !== undefined) updateData.company = company || null;
        if (content !== undefined) updateData.content = content;
        if (contentFr !== undefined) updateData.contentFr = contentFr || null;
        if (approved !== undefined) updateData.approved = approved;
        updateData.order = order;

        const [updatedTestimonial, swappedTestimonial] = await Promise.all([
          tx
            .update(schema.testimonials)
            .set(updateData)
            .where(eq(schema.testimonials.id, id))
            .returning(),
          tx
            .update(schema.testimonials)
            .set({
              order: existing.order,
              updatedAt: new Date(),
            })
            .where(eq(schema.testimonials.id, targetTestimonial.id))
            .returning(),
        ]);

        return {
          updatedTestimonial: updatedTestimonial[0],
          targetTestimonial: swappedTestimonial[0],
        };
      });

      const response = NextResponse.json(result.updatedTestimonial);
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate",
      );
      return response;
    }

    // Regular update without swapping
    const updateData: Partial<typeof schema.testimonials.$inferInsert> = {
      updatedAt: new Date(),
    };

    // Validate and sanitize fields if provided
    if (name !== undefined) {
      const sanitized = sanitizeTestimonialForm({ name });
      if (
        !sanitized.name ||
        sanitized.name.length < 2 ||
        sanitized.name.length > 100
      ) {
        return NextResponse.json(
          { error: "Name must be between 2 and 100 characters" },
          { status: 400 },
        );
      }
      if (!/^[\p{L}\p{M}\s\-'\.]+$/u.test(sanitized.name)) {
        return NextResponse.json(
          { error: "Name contains invalid characters" },
          { status: 400 },
        );
      }
      updateData.name = sanitized.name;
    }

    if (position !== undefined) {
      const sanitized = sanitizeTestimonialForm({ position });
      if (sanitized.position && sanitized.position.length > 100) {
        return NextResponse.json(
          { error: "Position must be no more than 100 characters" },
          { status: 400 },
        );
      }
      updateData.position = sanitized.position || null;
    }

    if (company !== undefined) {
      const sanitized = sanitizeTestimonialForm({ company });
      if (sanitized.company && sanitized.company.length > 100) {
        return NextResponse.json(
          { error: "Company must be no more than 100 characters" },
          { status: 400 },
        );
      }
      updateData.company = sanitized.company || null;
    }

    if (content !== undefined) {
      const sanitized = sanitizeTestimonialForm({ content });
      if (
        !sanitized.content ||
        sanitized.content.length < 10 ||
        sanitized.content.length > 500
      ) {
        return NextResponse.json(
          { error: "Content must be between 10 and 500 characters" },
          { status: 400 },
        );
      }
      updateData.content = sanitized.content;
    }

    if (contentFr !== undefined) {
      const sanitized = sanitizeTestimonialForm({ contentFr });
      updateData.contentFr = sanitized.contentFr || null;
    }

    if (approved !== undefined) {
      if (typeof approved !== "boolean") {
        return NextResponse.json(
          { error: "Approved must be a boolean" },
          { status: 400 },
        );
      }
      updateData.approved = approved;

      // Auto-assign order when approving (if approved=true and order is 0)
      if (approved && existing.order === 0) {
        const maxOrderResult = await db
          .select({
            maxOrder: sql<number>`COALESCE(MAX(${schema.testimonials.order}), 0)`,
          })
          .from(schema.testimonials)
          .where(eq(schema.testimonials.approved, true));
        const maxOrder = maxOrderResult[0]?.maxOrder || 0;
        updateData.order = maxOrder + 1;
      } else if (approved === false) {
        // When unapproving, reset order to 0
        updateData.order = 0;
      }
    }

    if (order !== undefined) {
      if (typeof order !== "number" || order < 0) {
        return NextResponse.json(
          { error: "Order must be a non-negative number" },
          { status: 400 },
        );
      }
      // Only allow order changes for approved testimonials
      if (!existing.approved) {
        return NextResponse.json(
          { error: "Cannot set order for unapproved testimonials" },
          { status: 400 },
        );
      }
      updateData.order = order;
    }

    const [updated] = await db
      .update(schema.testimonials)
      .set(updateData)
      .where(eq(schema.testimonials.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json(updated);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    return response;
  } catch (error) {
    // Handle JSON parse errors
    if (
      error instanceof SyntaxError ||
      (error as any).type === "entity.parse.failed"
    ) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Handle transaction errors
    if (error instanceof Error) {
      if (error.message === "TARGET_NOT_FOUND") {
        return NextResponse.json(
          { error: "Target testimonial not found for order swap" },
          { status: 404 },
        );
      }
    }

    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    
    // First get the order and approved status of the testimonial being deleted
    const [testimonialToDelete] = await db
      .select({ order: schema.testimonials.order, approved: schema.testimonials.approved })
      .from(schema.testimonials)
      .where(eq(schema.testimonials.id, id));

    if (!testimonialToDelete)
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );

    const deletedOrder = testimonialToDelete.order;
    const wasApproved = testimonialToDelete.approved;

    // Delete the testimonial and reorder remaining items in a transaction
    await db.transaction(async (tx) => {
      // Delete the testimonial
      await tx
        .delete(schema.testimonials)
        .where(eq(schema.testimonials.id, id));

      // Only decrement order for approved testimonials (those with order > 0)
      if (wasApproved && deletedOrder > 0) {
        // Decrement order of all approved items with higher order using Drizzle sql
        await tx.execute(sql`UPDATE testimonials SET "order" = "order" - 1 WHERE "order" > ${deletedOrder} AND "approved" = true`);
      }
    });

    const response = NextResponse.json({
      message: "Testimonial deleted successfully",
    });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 },
    );
  }
}
