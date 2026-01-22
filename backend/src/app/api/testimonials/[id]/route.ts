import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [testimonial] = await db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id));
    if (!testimonial) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch testimonial" }, { status: 500 });
  }
}

// PUT /api/testimonials/[id] - Update/approve testimonial (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(schema.testimonials).set({ ...body, updatedAt: new Date() }).where(eq(schema.testimonials.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    return NextResponse.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
