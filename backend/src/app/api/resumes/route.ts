import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { uploadFile } from "@/lib/storage/spaces-client";
import { randomUUID } from "crypto";

// GET /api/resumes - List all resumes or get active resumes (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const language = searchParams.get("language");

    // If active=true, return only active resumes grouped by language
    if (active === "true") {
      const allResumes = await db
        .select()
        .from(schema.resumes)
        .where(eq(schema.resumes.isActive, true))
        .orderBy(desc(schema.resumes.uploadedAt));

      const activeResumes = {
        en: allResumes.find((r) => r.language === "en") || null,
        fr: allResumes.find((r) => r.language === "fr") || null,
      };

      const res = NextResponse.json(activeResumes);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    // Otherwise, return all resumes (optionally filtered by language)
    let query = db.select().from(schema.resumes);

    if (language) {
      const resumes = await query
        .where(eq(schema.resumes.language, language))
        .orderBy(desc(schema.resumes.version));

      const res = NextResponse.json(resumes);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    const resumes = await query.orderBy(
      schema.resumes.language,
      desc(schema.resumes.version),
    );

    const res = NextResponse.json(resumes);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}

// POST /api/resumes - Upload new resume (admin only)
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const language = formData.get("language") as string;
    const setAsActive = formData.get("setAsActive") !== "false"; // default true

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!language || !["en", "fr"].includes(language)) {
      return NextResponse.json(
        { error: 'Language must be "en" or "fr"' },
        { status: 400 },
      );
    }

    // Validate file type - PDF only
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size - 5MB max
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Get next version number for this language
    const existingResumes = await db
      .select({ version: schema.resumes.version })
      .from(schema.resumes)
      .where(eq(schema.resumes.language, language));

    const maxVersion =
      existingResumes.length > 0
        ? Math.max(...existingResumes.map((r) => r.version))
        : 0;
    const nextVersion = maxVersion + 1;

    // Generate clean filename
    const uniqueFilename = `resume-${language}.pdf`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to DigitalOcean Spaces in files/ subfolder
    const fileUrl = await uploadFile(
      buffer,
      uniqueFilename,
      file.type,
      "files",
    );

    // If setAsActive, deactivate all other resumes for this language
    if (setAsActive) {
      await db
        .update(schema.resumes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(schema.resumes.language, language));
    }

    // Insert new resume (store full storage key for delete)
    const storageKey = `files/${uniqueFilename}`;

    const [newResume] = await db
      .insert(schema.resumes)
      .values({
        fileUrl,
        fileName: storageKey,
        language,
        isActive: setAsActive,
        version: nextVersion,
        fileSize: file.size,
      })
      .returning();

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 },
    );
  }
}
