import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.BETTER_AUTH_JWT_SECRET;
const JWT_ISSUER = process.env.AUTH_JWT_ISS || "portfolio-auth";
const JWT_AUDIENCE = process.env.AUTH_JWT_AUD || "portfolio-api";

export interface JwtPayload {
  sub: string;  // User ID
  email: string;
  name?: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export function validateJwt(token: string): JwtPayload | null {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("JWT validation error:", error);
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export function getAuthenticatedUser(request: NextRequest): JwtPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return validateJwt(token);
}

export function requireAdmin(request: NextRequest): JwtPayload | null {
  const user = getAuthenticatedUser(request);
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}
