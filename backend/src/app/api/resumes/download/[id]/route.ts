import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/resumes/download/[id] - Download resume with clean filename (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || "resume.pdf";

    // Get resume from database
    const [resume] = await db
      .select()
      .from(schema.resumes)
      .where(eq(schema.resumes.id, id))
      .limit(1);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Fetch the file from DigitalOcean Spaces
    const fileResponse = await fetch(resume.fileUrl);

    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file from storage");
    }

    // Get the file as a blob
    const fileBlob = await fileResponse.blob();

    // Create response with proper headers for download
    const response = new NextResponse(fileBlob);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return response;
  } catch (error) {
    console.error("Error downloading resume:", error);
    return NextResponse.json(
      { error: "Failed to download resume" },
      { status: 500 }
    );
  }
}
