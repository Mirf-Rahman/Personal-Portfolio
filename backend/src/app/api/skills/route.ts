import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/skills - List all skills (public)
export async function GET() {
  try {
    const skills = await db
      .select()
      .from(schema.skills)
      .orderBy(schema.skills.order);
    
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a new skill (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category, iconUrl, order } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // Auto-assign order: if not provided, use max order + 1
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const [maxOrderResult] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${schema.skills.order}), 0)` })
        .from(schema.skills);
      
      finalOrder = (maxOrderResult?.maxOrder ?? 0) + 1;
    }

    const [newSkill] = await db
      .insert(schema.skills)
      .values({
        name,
        category,
        iconUrl: iconUrl || null,
        order: finalOrder,
      })
      .returning();

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
