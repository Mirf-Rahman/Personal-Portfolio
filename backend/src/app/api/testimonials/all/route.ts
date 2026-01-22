import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/testimonials/all - List ALL testimonials (admin only)
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const testimonials = await db.select().from(schema.testimonials);
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
