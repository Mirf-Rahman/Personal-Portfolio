import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [edu] = await db.select().from(schema.education).where(eq(schema.education.id, id));
    if (!edu) return NextResponse.json({ error: "Education not found" }, { status: 404 });
    return NextResponse.json(edu);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);
    const [updated] = await db.update(schema.education).set({ ...body, updatedAt: new Date() }).where(eq(schema.education.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Education not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update education" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.education).where(eq(schema.education.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Education not found" }, { status: 404 });
    return NextResponse.json({ message: "Education deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete education" }, { status: 500 });
  }
}
