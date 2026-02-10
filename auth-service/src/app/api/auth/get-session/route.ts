import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/get-session - Return current session for authenticated user
 * 
 * This is a specific route handler that bypasses the catch-all route's
 * Better Auth handler.GET() which has issues in standalone mode.
 * Uses auth.api.getSession() directly (same pattern as /token and /sessions routes).
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie: cookieHeader,
      },
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(sessionResult, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("get-session error:", error);
    }
    return NextResponse.json(null, { status: 200 });
  }
}

/**
 * POST /api/auth/get-session - Also support POST for get-session
 * Some Better Auth clients may use POST for session retrieval
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
