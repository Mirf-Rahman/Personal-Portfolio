import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/testimonials - List approved testimonials (public)
export async function GET() {
  try {
    const testimonials = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.approved, true));
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST /api/testimonials - Submit testimonial (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position, company, content, contentFr, imageUrl } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    const [newTestimonial] = await db.insert(schema.testimonials).values({
      name,
      position: position || null,
      company: company || null,
      content,
      contentFr: contentFr || null,
      imageUrl: imageUrl || null,
      approved: false, // Testimonials require admin approval
    }).returning();

    return NextResponse.json({ message: "Testimonial submitted for review", id: newTestimonial.id }, { status: 201 });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return NextResponse.json({ error: "Failed to submit testimonial" }, { status: 500 });
  }
}
