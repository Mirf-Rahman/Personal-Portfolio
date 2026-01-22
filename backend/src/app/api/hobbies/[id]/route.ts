import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [hobby] = await db.select().from(schema.hobbies).where(eq(schema.hobbies.id, id));
    if (!hobby) return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    return NextResponse.json(hobby);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hobby" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(schema.hobbies).set({ ...body, updatedAt: new Date() }).where(eq(schema.hobbies.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update hobby" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.hobbies).where(eq(schema.hobbies.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    return NextResponse.json({ message: "Hobby deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete hobby" }, { status: 500 });
  }
}
