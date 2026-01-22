import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/experiences/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [exp] = await db.select().from(schema.experiences).where(eq(schema.experiences.id, id));
    if (!exp) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    return NextResponse.json(exp);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}

// PUT /api/experiences/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);
    const [updated] = await db.update(schema.experiences).set({ ...body, updatedAt: new Date() }).where(eq(schema.experiences.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

// DELETE /api/experiences/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.experiences).where(eq(schema.experiences.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
