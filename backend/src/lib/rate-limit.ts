import { NextRequest } from "next/server";

// Simple in-memory rate limiting store
// In production, use Redis or a proper rate limiting service
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Get rate limit identifier from request (IP-based)
 */
function getRateLimitIdentifier(request: NextRequest): string {
  // Use IP address for rate limiting
  // Try to get IP from various headers (for proxies/load balancers)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") || // Cloudflare
    request.headers.get("x-client-ip") ||
    "unknown";
  return `rate-limit:${ip}`;
}

/**
 * Check rate limit for contact form submissions
 * Limits: 5 per 15 minutes, 20 per hour
 */
export function checkContactFormRateLimit(
  request: NextRequest
): RateLimitResult {
  const identifier = getRateLimitIdentifier(request);

  // Check short window (15 minutes)
  const shortWindow = checkRateLimit(
    `${identifier}:short`,
    5,
    15 * 60 * 1000
  );

  if (!shortWindow.allowed) {
    return shortWindow;
  }

  // Check long window (1 hour)
  const longWindow = checkRateLimit(`${identifier}:long`, 20, 60 * 60 * 1000);

  if (!longWindow.allowed) {
    return longWindow;
  }

  // Return the more restrictive limit
  return shortWindow.remaining < longWindow.remaining
    ? shortWindow
    : longWindow;
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
  maxRequests: number
): void {
  response.headers.set("X-RateLimit-Limit", String(maxRequests));
  response.headers.set(
    "X-RateLimit-Remaining",
    String(Math.max(0, result.remaining))
  );
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(result.resetTime / 1000))
  );

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    response.headers.set("Retry-After", String(retryAfter));
  }
}
