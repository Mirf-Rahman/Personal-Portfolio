import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/testimonials/all - List ALL testimonials (admin only)
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const testimonials = await db
      .select()
      .from(schema.testimonials)
      .orderBy(asc(schema.testimonials.approved), asc(schema.testimonials.order), asc(schema.testimonials.createdAt));
    const response = NextResponse.json(testimonials);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
