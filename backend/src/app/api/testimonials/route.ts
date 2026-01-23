import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import {
  checkContactFormRateLimit,
  addRateLimitHeaders,
} from "@/lib/rate-limit";
import {
  sanitizeTestimonialForm,
  containsSpamPatterns,
} from "@/lib/sanitize";
import type { ValidationError } from "@/types";

// GET /api/testimonials - List approved testimonials (public)
export async function GET() {
  try {
    const testimonials = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.approved, true))
      .orderBy(asc(schema.testimonials.order), asc(schema.testimonials.createdAt));
    
    const response = NextResponse.json(testimonials);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST /api/testimonials - Submit testimonial (public)
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
    const sanitized = sanitizeTestimonialForm(body);

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

    // Validate position (optional)
    if (sanitized.position && sanitized.position.length > 100) {
      validationErrors.push({
        field: "position",
        message: "Position must be no more than 100 characters",
      });
    }

    // Validate company (optional)
    if (sanitized.company && sanitized.company.length > 100) {
      validationErrors.push({
        field: "company",
        message: "Company must be no more than 100 characters",
      });
    }

    // Validate content
    if (!sanitized.content) {
      validationErrors.push({
        field: "content",
        message: "Testimonial content is required",
      });
    } else if (sanitized.content.length < 10) {
      validationErrors.push({
        field: "content",
        message: "Testimonial content must be at least 10 characters",
      });
    } else if (sanitized.content.length > 2000) {
      validationErrors.push({
        field: "content",
        message: "Testimonial content must be no more than 2000 characters",
      });
    }

    // Check for spam patterns in content
    if (sanitized.content && containsSpamPatterns(sanitized.content)) {
      validationErrors.push({
        field: "content",
        message: "Testimonial content contains spam patterns",
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

    // Insert testimonial (order will be 0 since not approved yet)
    const [newTestimonial] = await db.insert(schema.testimonials).values({
      name: sanitized.name,
      position: sanitized.position || null,
      company: sanitized.company || null,
      content: sanitized.content,
      contentFr: sanitized.contentFr || null,
      approved: false, // Testimonials require admin approval
      order: 0, // Will be assigned when approved
    }).returning();

    const response = NextResponse.json(
      { message: "Testimonial submitted for review", id: newTestimonial.id },
      { status: 201 }
    );
    addRateLimitHeaders(response, rateLimitResult, 5);
    return response;
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError || (error as any).type === "entity.parse.failed") {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error submitting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
