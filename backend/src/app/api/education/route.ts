import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/education - List all education (public)
export async function GET() {
  try {
    const education = await db.select().from(schema.education).orderBy(schema.education.order);
    return NextResponse.json(education);
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 });
  }
}

// POST /api/education - Create education (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { institution, degree, degreeFr, field, fieldFr, startDate, endDate, current, description, descriptionFr, order } = body;

    if (!institution || !degree || !field) {
      return NextResponse.json({ error: "Institution, degree, and field are required" }, { status: 400 });
    }

    const [newEdu] = await db.insert(schema.education).values({
      institution,
      degree,
      degreeFr: degreeFr || null,
      field,
      fieldFr: fieldFr || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      current: current || false,
      description: description || null,
      descriptionFr: descriptionFr || null,
      order: order || 0,
    }).returning();

    return NextResponse.json(newEdu, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json({ error: "Failed to create education" }, { status: 500 });
  }
}
