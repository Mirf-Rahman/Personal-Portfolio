import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/contact-info - Return the single contact info row (public)
export async function GET() {
  try {
    const [row] = await db.select().from(schema.contactInfo).limit(1);

    if (!row) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: row.id,
      email: row.email,
      phone: row.phone ?? "",
      location: row.location ?? "",
      linkedIn: row.linkedIn ?? "",
      github: row.github ?? "",
      twitter: row.twitter ?? "",
      updatedAt: row.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact info" },
      { status: 500 },
    );
  }
}

// PATCH /api/contact-info - Update contact info (admin only). Singleton: updates or creates.
export async function PATCH(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, phone, location, linkedIn, github, twitter } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const [existing] = await db.select().from(schema.contactInfo).limit(1);

    const payload = {
      email: String(email).trim(),
      phone: phone != null ? String(phone).trim() || null : null,
      location: location != null ? String(location).trim() || null : null,
      linkedIn: linkedIn != null ? String(linkedIn).trim() || null : null,
      github: github != null ? String(github).trim() || null : null,
      twitter: twitter != null ? String(twitter).trim() || null : null,
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(schema.contactInfo)
        .set(payload)
        .where(eq(schema.contactInfo.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(schema.contactInfo)
      .values(payload)
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json(
      { error: "Failed to update contact info" },
      { status: 500 },
    );
  }
}
