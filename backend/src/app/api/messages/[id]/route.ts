import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [message] = await db.select().from(schema.contactMessages).where(eq(schema.contactMessages.id, id));
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 });
  }
}

// PUT /api/messages/[id] - Mark as read (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(schema.contactMessages).set({ read: body.read ?? true }).where(eq(schema.contactMessages.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [deleted] = await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
