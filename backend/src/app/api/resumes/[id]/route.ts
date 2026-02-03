import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { deleteFile } from "@/lib/storage/spaces-client";

// GET /api/resumes/:id - Get single resume (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    const [resume] = await db
      .select()
      .from(schema.resumes)
      .where(eq(schema.resumes.id, id))
      .limit(1);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const res = NextResponse.json(resume);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/:id - Update resume (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    const body = await request.json();

    // Allowlist: only isActive can be updated
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Get the resume to update
    const [existingResume] = await db
      .select()
      .from(schema.resumes)
      .where(eq(schema.resumes.id, id))
      .limit(1);

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // If setting this resume as active, deactivate all others for this language
    if (isActive) {
      await db
        .update(schema.resumes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(schema.resumes.language, existingResume.language));
    }

    // Update the resume
    const [updatedResume] = await db
      .update(schema.resumes)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(schema.resumes.id, id))
      .returning();

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/:id - Delete resume (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    // Get the resume to delete
    const [resume] = await db
      .select()
      .from(schema.resumes)
      .where(eq(schema.resumes.id, id))
      .limit(1);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check if this is the only active resume for this language
    if (resume.isActive) {
      const activeResumes = await db
        .select()
        .from(schema.resumes)
        .where(
          and(
            eq(schema.resumes.language, resume.language),
            eq(schema.resumes.isActive, true)
          )
        );

      if (activeResumes.length === 1) {
        return NextResponse.json(
          {
            error:
              "Cannot delete the only active resume for this language. Upload a new one first or activate another version.",
          },
          { status: 400 }
        );
      }
    }

    // Delete file from Spaces
    try {
      await deleteFile(resume.fileName);
    } catch (error) {
      console.error("Error deleting file from Spaces:", error);
      // Continue with database deletion even if Spaces deletion fails
    }

    // Delete from database
    await db.delete(schema.resumes).where(eq(schema.resumes.id, id));

    return NextResponse.json({ success: true, message: "Resume deleted" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
