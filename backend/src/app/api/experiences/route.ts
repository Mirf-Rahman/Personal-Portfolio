import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/experiences - List all experiences (public)
export async function GET() {
  try {
    const experiences = await db
      .select()
      .from(schema.experiences)
      .orderBy(schema.experiences.order);

    const res = NextResponse.json(experiences);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

// POST /api/experiences - Create experience (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { company, position, positionFr, description, descriptionFr, startDate, endDate, current, location, order } = body;

    if (!company || !position || !description || !location) {
      return NextResponse.json({ error: "Company, position, description, and location are required" }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }

    let orderValue = typeof order === "number" && order > 0 ? order : 0;
    if (orderValue === 0) {
      const rows = await db.select({ order: schema.experiences.order }).from(schema.experiences);
      const maxOrder = rows.length ? Math.max(...rows.map((r) => r.order)) : 0;
      orderValue = maxOrder + 1;
    }

    const [newExp] = await db
      .insert(schema.experiences)
      .values({
        company,
        position,
        positionFr: positionFr || null,
        description,
        descriptionFr: descriptionFr || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        location,
        order: orderValue,
      })
      .returning();

    return NextResponse.json(newExp, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
