import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import {
  checkContactFormRateLimit,
  addRateLimitHeaders,
} from "@/lib/rate-limit";
import {
  sanitizeContactForm,
  isValidEmail,
  containsSpamPatterns,
} from "@/lib/sanitize";
import type { ValidationError } from "@/types";

// GET /api/messages - List all messages (admin only)
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await db
      .select()
      .from(schema.contactMessages)
      .orderBy(desc(schema.contactMessages.createdAt));

    const response = NextResponse.json(messages);
    // Prevent caching of admin data
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Submit contact message (public)
export async function POST(request: NextRequest) {
  // Check rate limiting first
  const rateLimitResult = checkContactFormRateLimit(request);
  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
    addRateLimitHeaders(response, rateLimitResult, 5);
    return response;
  }

  try {
    // Check request body size (limit to 10KB)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    const body = await request.json();
    const validationErrors: ValidationError[] = [];

    // Sanitize all inputs
    const sanitized = sanitizeContactForm(body);

    // Validate name
    if (!sanitized.name) {
      validationErrors.push({
        field: "name",
        message: "Name is required",
      });
    } else if (sanitized.name.length < 2) {
      validationErrors.push({
        field: "name",
        message: "Name must be at least 2 characters",
      });
    } else if (sanitized.name.length > 100) {
      validationErrors.push({
        field: "name",
        message: "Name must be no more than 100 characters",
      });
    } else if (!/^[\p{L}\p{M}\s\-'\.]+$/u.test(sanitized.name)) {
      validationErrors.push({
        field: "name",
        message: "Name contains invalid characters",
      });
    }

    // Validate email
    if (!sanitized.email) {
      validationErrors.push({
        field: "email",
        message: "Email is required",
      });
    } else if (sanitized.email.length > 100) {
      validationErrors.push({
        field: "email",
        message: "Email must be no more than 100 characters",
      });
    } else if (!isValidEmail(sanitized.email)) {
      validationErrors.push({
        field: "email",
        message: "Invalid email format",
      });
    }

    // Validate subject
    if (!sanitized.subject) {
      validationErrors.push({
        field: "subject",
        message: "Subject is required",
      });
    } else if (sanitized.subject.length < 3) {
      validationErrors.push({
        field: "subject",
        message: "Subject must be at least 3 characters",
      });
    } else if (sanitized.subject.length > 150) {
      validationErrors.push({
        field: "subject",
        message: "Subject must be no more than 150 characters",
      });
    }

    // Validate message
    if (!sanitized.message) {
      validationErrors.push({
        field: "message",
        message: "Message is required",
      });
    } else if (sanitized.message.length < 10) {
      validationErrors.push({
        field: "message",
        message: "Message must be at least 10 characters",
      });
    } else if (sanitized.message.length > 1200) {
      validationErrors.push({
        field: "message",
        message: "Message must be no more than 1200 characters",
      });
    }

    // Check for spam patterns
    const spamCheck =
      containsSpamPatterns(sanitized.subject) ||
      containsSpamPatterns(sanitized.message);
    if (spamCheck) {
      validationErrors.push({
        field: "message",
        message: "Message contains suspicious content",
      });
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      const response = NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: validationErrors,
        },
        { status: 400 }
      );
      addRateLimitHeaders(response, rateLimitResult, 5);
      return response;
    }

    // Insert message into database
    const [newMessage] = await db
      .insert(schema.contactMessages)
      .values({
        name: sanitized.name,
        email: sanitized.email,
        subject: sanitized.subject,
        message: sanitized.message,
        read: false,
      })
      .returning();

    const response = NextResponse.json(
      { message: "Message sent successfully", id: newMessage.id },
      { status: 201 }
    );
    addRateLimitHeaders(response, rateLimitResult, 5);
    return response;
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.error("Error submitting message:", error);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
