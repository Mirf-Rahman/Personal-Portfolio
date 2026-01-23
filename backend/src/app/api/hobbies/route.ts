import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/hobbies - List all hobbies (public)
export async function GET() {
  try {
    const hobbies = await db
      .select()
      .from(schema.hobbies)
      .orderBy(schema.hobbies.order);

    const res = NextResponse.json(hobbies);
    res.headers.set("Cache-Control", "no-store");
    return res;
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

    let orderValue = typeof order === "number" && order > 0 ? order : 0;
    if (orderValue === 0) {
      const rows = await db.select({ order: schema.hobbies.order }).from(schema.hobbies);
      const maxOrder = rows.length ? Math.max(...rows.map((r) => r.order)) : 0;
      orderValue = maxOrder + 1;
    }

    const [newHobby] = await db
      .insert(schema.hobbies)
      .values({
        name,
        nameFr: nameFr || null,
        description: description || null,
        descriptionFr: descriptionFr || null,
        iconUrl: iconUrl || null,
        order: orderValue,
      })
      .returning();

    return NextResponse.json(newHobby, { status: 201 });
  } catch (error) {
    console.error("Error creating hobby:", error);
    return NextResponse.json({ error: "Failed to create hobby" }, { status: 500 });
  }
}
