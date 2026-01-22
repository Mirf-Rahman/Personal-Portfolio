import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/messages - List all messages (admin only)
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const messages = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages - Submit contact message (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const [newMessage] = await db.insert(schema.contactMessages).values({
      name,
      email,
      subject,
      message,
      read: false,
    }).returning();

    return NextResponse.json({ message: "Message sent successfully", id: newMessage.id }, { status: 201 });
  } catch (error) {
    console.error("Error submitting message:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
