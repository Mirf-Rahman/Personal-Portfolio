import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/storage/spaces-client";
import { randomUUID } from "crypto";
import { extname } from "path";

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/files - Upload a file to DigitalOcean Spaces
 * Admin only
 */
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = ALLOWED_IMAGE_TYPES.includes(file.type)
      ? MAX_IMAGE_SIZE
      : MAX_DOCUMENT_SIZE;

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = extname(file.name);
    const uniqueFilename = `${randomUUID()}${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Spaces
    const url = await uploadFile(buffer, uniqueFilename, file.type);

    return NextResponse.json(
      {
        url,
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
