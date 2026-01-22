import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/hobbies - List all hobbies (public)
export async function GET() {
  try {
    const hobbies = await db.select().from(schema.hobbies).orderBy(schema.hobbies.order);
    return NextResponse.json(hobbies);
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json({ error: "Failed to fetch hobbies" }, { status: 500 });
  }
}

// POST /api/hobbies - Create hobby (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, nameFr, description, descriptionFr, iconUrl, order } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newHobby] = await db.insert(schema.hobbies).values({
      name,
      nameFr: nameFr || null,
      description: description || null,
      descriptionFr: descriptionFr || null,
      iconUrl: iconUrl || null,
      order: order || 0,
    }).returning();

    return NextResponse.json(newHobby, { status: 201 });
  } catch (error) {
    console.error("Error creating hobby:", error);
    return NextResponse.json({ error: "Failed to create hobby" }, { status: 500 });
  }
}
