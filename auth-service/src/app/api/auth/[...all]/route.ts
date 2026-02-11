import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { checkAccountLockout, recordLoginAttempt } from "@/lib/security/account-lockout";
import { logAuthEvent } from "@/lib/security/audit-log";
import { isNewIP, recordLoginIP, checkSuspiciousActivity } from "@/lib/security/ip-security";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

// Validate environment when this route is actually called (runtime)
// This ensures validation happens when the app runs, not during build
if (typeof window === "undefined" && process.env.DATABASE_URL) {
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_JWT_SECRET;
  const jwtSecret = process.env.BETTER_AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET || process.env.BETTER_AUTH_SECRET;
  
  if (betterAuthSecret && betterAuthSecret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET or AUTH_JWT_SECRET must be at least 32 characters long.");
  }
  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error("BETTER_AUTH_JWT_SECRET or AUTH_JWT_SECRET must be at least 32 characters long.");
  }
}

function getClientInfo(request: NextRequest): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               request.headers.get("cf-connecting-ip") ||
               request.headers.get("x-client-ip") ||
               undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

/**
 * Extract session cookie from Set-Cookie headers
 * Better Auth sets the session cookie in the response, not the request
 * Note: Set-Cookie headers are separate headers, not comma-separated
 */
function extractSessionCookie(setCookieHeaders: string[]): string {
  if (!setCookieHeaders || setCookieHeaders.length === 0) return "";
  
  // Each Set-Cookie header is a separate header, not comma-separated
  for (const cookieHeader of setCookieHeaders) {
    // Find the session token cookie
    if (cookieHeader.includes("better-auth.session_token=")) {
      // Extract just the name=value part (before the first semicolon)
      const cookieValue = cookieHeader.split(";")[0].trim();
      return cookieValue;
    }
  }
  
  return "";
}

/**
 * Get all Set-Cookie headers from a response
 * In Next.js, Set-Cookie headers are stored in response.headers as separate entries
 * We need to iterate through all headers to find all Set-Cookie values
 */
function getAllSetCookieHeaders(response: Response | NextResponse): string[] {
  const cookies: string[] = [];
  
  // Next.js/Web API Headers doesn't have getAll(), so we need to iterate
  // Check if it's a NextResponse (has cookies property) or regular Response
  if (response instanceof NextResponse && response.cookies) {
    // NextResponse has a cookies property that's easier to work with
    response.cookies.getAll().forEach(cookie => {
      // Reconstruct the Set-Cookie header format
      let cookieString = `${cookie.name}=${cookie.value}`;
      if (cookie.path) cookieString += `; Path=${cookie.path}`;
      if (cookie.domain) cookieString += `; Domain=${cookie.domain}`;
      if (cookie.expires) {
        const expiresDate = cookie.expires instanceof Date 
          ? cookie.expires 
          : new Date(cookie.expires);
        cookieString += `; Expires=${expiresDate.toUTCString()}`;
      }
      if (cookie.maxAge) cookieString += `; Max-Age=${cookie.maxAge}`;
      if (cookie.httpOnly) cookieString += `; HttpOnly`;
      if (cookie.secure) cookieString += `; Secure`;
      if (cookie.sameSite) cookieString += `; SameSite=${cookie.sameSite}`;
      cookies.push(cookieString);
    });
  } else {
    // For regular Response, use getSetCookie() which properly handles
    // multiple Set-Cookie headers without the comma-splitting issues
    // that affect Headers.get("set-cookie") (dates contain commas)
    if (typeof response.headers.getSetCookie === 'function') {
      const setCookies = response.headers.getSetCookie();
      cookies.push(...setCookies.filter(c => c.length > 0));
    } else {
      // Fallback for older environments
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        cookies.push(setCookieHeader);
      }
    }
  }
  
  return cookies;
}

// Custom handler to support rememberMe functionality
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const isOAuthCallback = url.pathname.includes("/callback/");
  
  try {
    const response = await auth.handler(request);
    
    // After OAuth callback, handle redirect and check if account is locked
    if (isOAuthCallback && (response.status === 200 || response.status === 201 || response.status === 302 || response.status === 307)) {
      try {
        // Extract session from response to get user info
        const setCookieHeaders = getAllSetCookieHeaders(response);
        const sessionCookie = extractSessionCookie(setCookieHeaders);
        
        if (sessionCookie) {
          const cookieHeader = `${sessionCookie}${request.headers.get("cookie") ? `; ${request.headers.get("cookie")}` : ""}`;
          
          const sessionResult = await auth.api.getSession({
            headers: { cookie: cookieHeader },
          });
          
          if (sessionResult?.user?.email) {
            const email = sessionResult.user.email;
            const lockoutStatus = await checkAccountLockout(email);
            
            if (lockoutStatus.isLocked) {
              // Account is locked, revoke the session and redirect to login with error
              const clientInfo = getClientInfo(request);
              await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
              
              // Log the lockout attempt
              await logAuthEvent(
                "login",
                sessionResult.user.id,
                false,
                request,
                {
                  email,
                  reason: lockoutStatus.isAdminLocked ? "admin_locked" : "account_locked",
                  method: "oauth",
                  lockoutExpiresAt: lockoutStatus.lockoutExpiresAt?.toISOString(),
                }
              );
              
              // Revoke the session
              try {
                await auth.api.signOut({
                  headers: { cookie: cookieHeader },
                });
              } catch {
                // Ignore errors during logout
              }
              
              // Redirect to login page with error message
              let lockoutMessage: string;
              if (lockoutStatus.isAdminLocked) {
                lockoutMessage = "Your account has been locked by an administrator. Please contact support for assistance.";
              } else {
                lockoutMessage = "Your account has been temporarily locked due to too many failed login attempts. Please try again later.";
              }
              
              // Determine the redirect URL from the referer or default to store app
              const referer = request.headers.get("referer") || "";
              const isAdminApp = referer.includes(":3002") || referer.includes("admin");
              
              // Use environment variables with fallback to localhost for local development
              const adminAppUrl = process.env.ADMIN_APP_URL || "http://localhost:3002";
              const storeAppUrl = process.env.STORE_APP_URL || "http://localhost:3000";
              
              // Validate environment variables in non-dev environments
              if (process.env.NODE_ENV !== "development") {
                if (!process.env.ADMIN_APP_URL || !process.env.STORE_APP_URL) {
                  console.error("ADMIN_APP_URL and STORE_APP_URL must be set in non-development environments");
                  // Fall back to defaults but log the error
                }
              }
              
              const baseUrl = isAdminApp ? adminAppUrl : storeAppUrl;
              const redirectUrl = new URL("/login", baseUrl);
              redirectUrl.searchParams.set("error", lockoutMessage);
              
              // Clear the session cookie and redirect
              const redirectResponse = NextResponse.redirect(redirectUrl);
              redirectResponse.cookies.set("better-auth.session_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
              });
              
              return redirectResponse;
            }
            
            // Account is not locked - handle successful OAuth redirect
            // Better Auth should redirect to callbackURL, but if it doesn't, we'll handle it
            // Check if response is already a redirect (status 302 or 307)
            const isRedirect = response.status === 302 || response.status === 307;
            if (isRedirect) {
              const location = response.headers.get("location");
              // If Better Auth already redirected, use that redirect but ensure cookies are preserved
              if (location) {
                // Check if the redirect URL is valid (not a 404 path)
                // If it's a relative path or looks invalid, redirect to appropriate dashboard
                const referer = request.headers.get("referer") || "";
                const isAdminApp = referer.includes(":3002") || referer.includes("admin") || location.includes("/admin");
                
                const adminAppUrl = process.env.ADMIN_APP_URL || "http://localhost:3002";
                const storeAppUrl = process.env.STORE_APP_URL || "http://localhost:3000";
                
                // If location is a relative path or doesn't look like a full URL, construct proper redirect
                let redirectUrl: string;
                if (location.startsWith("http://") || location.startsWith("https://")) {
                  // Full URL, use as-is
                  redirectUrl = location;
                } else {
                  // Relative path - determine which app to redirect to
                  const baseUrl = isAdminApp ? adminAppUrl : storeAppUrl;
                  redirectUrl = new URL(location, baseUrl).toString();
                }
                
                // Create redirect response with cookies from original response
                const redirectResponse = NextResponse.redirect(redirectUrl);
                // Copy all cookies from original response
                if (response instanceof NextResponse && response.cookies) {
                  response.cookies.getAll().forEach(cookie => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, {
                      path: cookie.path || "/",
                      domain: cookie.domain,
                      expires: cookie.expires,
                      maxAge: cookie.maxAge,
                      httpOnly: cookie.httpOnly,
                      secure: cookie.secure,
                      sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined,
                    });
                  });
                }
                return redirectResponse;
              }
            }
            
            // If no redirect from Better Auth, redirect to appropriate dashboard
            const referer = request.headers.get("referer") || "";
            const isAdminApp = referer.includes(":3002") || referer.includes("admin");
            
            const adminAppUrl = process.env.ADMIN_APP_URL || "http://localhost:3002";
            const storeAppUrl = process.env.STORE_APP_URL || "http://localhost:3000";
            
            const baseUrl = isAdminApp ? adminAppUrl : storeAppUrl;
            const defaultRedirect = isAdminApp ? "/dashboard" : "/profile";
            const redirectUrl = new URL(defaultRedirect, baseUrl);
            
            // Create redirect response with cookies from original response
            const redirectResponse = NextResponse.redirect(redirectUrl);
            // Copy all cookies from original response
            if (response instanceof NextResponse && response.cookies) {
              response.cookies.getAll().forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, {
                  path: cookie.path || "/",
                  domain: cookie.domain,
                  expires: cookie.expires,
                  maxAge: cookie.maxAge,
                  httpOnly: cookie.httpOnly,
                  secure: cookie.secure,
                  sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined,
                });
              });
            }
            return redirectResponse;
          }
        }
      } catch (checkError) {
        // If we can't check lockout status, log but don't block the request
        if (process.env.NODE_ENV === "development") {
          console.error("Error checking account lockout after OAuth callback:", checkError);
        }
      }
    }
    
    return response;
  } catch (error) {
    // Log error only in development mode
    // In production, use structured logging service
    if (process.env.NODE_ENV === "development") {
      console.error("Better Auth GET error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    } else {
      // In production, log minimal information to prevent information leakage
      // TODO: Integrate with proper logging service (Winston, Pino, etc.)
      console.error("Better Auth GET error occurred");
    }
    // Re-throw to let Better Auth handle it
    throw error;
  }
}

interface SignInBody {
  email?: string;
  rememberMe?: boolean;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const isSignIn = url.pathname.includes("/sign-in/email");
  
  if (isSignIn) {
    let body: SignInBody | null = null;
    let bodyString: string | null = null;
    
    try {
      // Read the body once and store it as a string for potential reconstruction
      body = await request.json();
      bodyString = JSON.stringify(body);
      const rememberMe = body?.rememberMe ?? true;
      const email = body?.email;
      
      if (email && typeof email === "string") {
        const lockoutStatus = await checkAccountLockout(email);
        if (lockoutStatus.isLocked) {
          const clientInfo = getClientInfo(request);
          await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
          
          // Log account lockout event (only if not already logged as admin lock)
          if (!lockoutStatus.isAdminLocked) {
            await logAuthEvent(
              "account_locked",
              null, // userId not available yet
              false,
              request,
              {
                email,
                lockoutExpiresAt: lockoutStatus.lockoutExpiresAt?.toISOString(),
              }
            );
          }
          
          let lockoutMessage: string;
          if (lockoutStatus.isAdminLocked) {
            lockoutMessage = "Your account has been locked by an administrator. Please contact support for assistance.";
          } else {
            const expiryDate = lockoutStatus.lockoutExpiresAt 
              ? new Date(lockoutStatus.lockoutExpiresAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              : null;
            
            lockoutMessage = expiryDate
              ? `Your account has been temporarily locked due to too many failed login attempts. Please try again after ${expiryDate}.`
              : "Your account has been temporarily locked due to too many failed login attempts. Please try again later.";
          }
          
          return NextResponse.json(
            { error: { message: lockoutMessage } },
            { status: 423 } // 423 Locked
          );
        }

        const users = await db.select().from(schema.user).where(eq(schema.user.email, email)).limit(1);
        const user = users[0];

        if (user && user.deletedAt) {
          const clientInfo = getClientInfo(request);
          await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
          
          await logAuthEvent(
            "login",
            user.id,
            false,
            request,
            {
              email,
              reason: "account_deleted",
              deletedAt: user.deletedAt.toISOString(),
            }
          );
          
          return NextResponse.json(
            { error: { message: "This account has been deleted and is no longer accessible." } },
            { status: 403 }
          );
        }

        if (user && !user.emailVerified) {
          const clientInfo = getClientInfo(request);
          await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
          
          await logAuthEvent(
            "login",
            user.id,
            false,
            request,
            {
              email,
              reason: "email_not_verified",
            }
          );
          
          return NextResponse.json(
            { error: { message: "Please verify your email address before logging in. Check your inbox for the verification link." } },
            { status: 403 } // 403 Forbidden
          );
        }
      }
      
      const newRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: bodyString,
      });
      
      const response = await auth.handler(newRequest);
      
      if (email && typeof email === "string" && (response.status !== 200 && response.status !== 201)) {
        try {
          const users = await db.select().from(schema.user).where(eq(schema.user.email, email)).limit(1);
          const user = users[0];
          
          if (user && user.deletedAt) {
            const clientInfo = getClientInfo(request);
            await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
            
            await logAuthEvent(
              "login",
              user.id,
              false,
              request,
              {
                email,
                reason: "account_deleted",
                deletedAt: user.deletedAt.toISOString(),
              }
            );
            
            return NextResponse.json(
              { 
                error: { 
                  message: "This account has been deleted and is no longer accessible.",
                  code: "ACCOUNT_DELETED"
                } 
              },
              { status: 403 }
            );
          }
          
          if (user && !user.emailVerified) {
            const clientInfo = getClientInfo(request);
            await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
            
            await logAuthEvent(
              "login",
              user.id,
              false,
              request,
              {
                email,
                reason: "email_not_verified",
              }
            );
            
            // Return friendly error message instead of generic Better Auth error
            // Use the exact format Better Auth expects: { error: { message: string } }
            return NextResponse.json(
              { 
                error: { 
                  message: "Please verify your email address before logging in. Check your inbox for the verification link.",
                  code: "EMAIL_NOT_VERIFIED"
                } 
              },
              { status: 403 }
            );
          }
        } catch (checkError) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error checking email verification status:", checkError);
          }
        }
      }
      
      // Record login attempt and audit log based on response status
      if (email && typeof email === "string") {
        const clientInfo = getClientInfo(request);
        const success = response.status === 200 || response.status === 201;
        await recordLoginAttempt(email, success, clientInfo.ipAddress, clientInfo.userAgent);
        
        let userId: string | null = null;
        if (success) {
          try {
            const setCookieHeaders = getAllSetCookieHeaders(response);
            const sessionCookie = extractSessionCookie(setCookieHeaders);
            
            const cookieHeader = sessionCookie 
              ? `${sessionCookie}${request.headers.get("cookie") ? `; ${request.headers.get("cookie")}` : ""}`
              : (request.headers.get("cookie") || "");
            
            const sessionResult = await auth.api.getSession({
              headers: { cookie: cookieHeader },
            });
            userId = sessionResult?.user?.id || null;
            
            if (userId && clientInfo.ipAddress) {
              const isNew = await isNewIP(userId, clientInfo.ipAddress);
              await recordLoginIP(userId, clientInfo.ipAddress, clientInfo.userAgent);
              
              const suspiciousCheck = await checkSuspiciousActivity(userId, clientInfo.ipAddress);
              
              if (isNew) {
                await logAuthEvent(
                  "new_ip_detected",
                  userId,
                  true,
                  request,
                  {
                    email,
                    ipAddress: clientInfo.ipAddress,
                  }
                );
              }
              
              if (suspiciousCheck.isSuspicious) {
                await logAuthEvent(
                  "suspicious_activity",
                  userId,
                  false,
                  request,
                  {
                    email,
                    ipAddress: clientInfo.ipAddress,
                    reasons: suspiciousCheck.reasons,
                  }
                );
              }
            }
          } catch {
            // Continue
          }
        }
        
        await logAuthEvent(
          "login",
          userId,
          success,
          request,
          {
            email,
          }
        );
      }
      
      // Check if this is a signup request
      const isSignUp = url.pathname.includes("/sign-up/email");
      if (isSignUp && (response.status === 200 || response.status === 201)) {
        try {
          const setCookieHeaders = getAllSetCookieHeaders(response);
          const sessionCookie = extractSessionCookie(setCookieHeaders);
          
          const cookieHeader = sessionCookie 
            ? `${sessionCookie}${request.headers.get("cookie") ? `; ${request.headers.get("cookie")}` : ""}`
            : (request.headers.get("cookie") || "");
          
          const sessionResult = await auth.api.getSession({
            headers: { cookie: cookieHeader },
          });
          const userId = sessionResult?.user?.id || null;
          
          if (userId) {
            await logAuthEvent(
              "signup",
              userId,
              true,
              request,
              {
                email: body?.email,
              }
            );
          }
        } catch {
          // Session might not be available yet
        }
      }
      
      // Modify the session cookie expiration based on rememberMe
      const setCookieHeaders = getAllSetCookieHeaders(response);
      if (setCookieHeaders.length > 0) {
        const modifiedCookies = setCookieHeaders.map(cookie => {
          // Only modify the session token cookie
          if (cookie.includes("better-auth.session_token")) {
            const parts = cookie.split("; ");
            const nameValue = parts[0];
            const otherParts = parts.slice(1).filter(p => 
              !p.trim().startsWith("Max-Age") && 
              !p.trim().startsWith("Expires")
            );
            
            if (rememberMe) {
              // Persistent cookie: 7 days
              const expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              return [
                nameValue,
                ...otherParts,
                `Max-Age=604800`,
                `Expires=${expiresDate.toUTCString()}`
              ].join("; ");
            } else {
              // Session cookie: no Max-Age or Expires (expires when browser closes)
              return [nameValue, ...otherParts].join("; ");
            }
          }
          // Return other cookies unchanged
          return cookie;
        }      );
      
      const responseBody = await response.text();
        
        // Create new NextResponse with the body and status
        const newResponse = new NextResponse(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(),
        });
        
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() !== "set-cookie") {
            newResponse.headers.set(key, value);
          }
        });
        
        modifiedCookies.forEach(cookie => {
          newResponse.headers.append("set-cookie", cookie);
        });
        
        return newResponse;
      }
      
      return response;
    } catch (error) {
      // If an error occurred after reading the body, reconstruct the request with the stored body
      // If body parsing failed, we can't reconstruct it, so let the error propagate
      if (bodyString) {
        try {
          const reconstructedRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: bodyString,
          });
          return auth.handler(reconstructedRequest);
        } catch {
          // If reconstruction also fails, log and re-throw the original error
          console.error("Failed to reconstruct request after error:", error);
          throw error;
        }
      }
      // If body parsing failed, we can't reconstruct the request
      // Re-throw the error to let Better Auth handle it
      throw error;
    }
  }
  
  // Check for OAuth callback requests
  const isOAuthCallback = url.pathname.includes("/callback/");
  
  // For non-sign-in requests, use the original handler
  try {
    const response = await auth.handler(request);
    
    // After OAuth callback, check if account is locked
    if (isOAuthCallback && (response.status === 200 || response.status === 201)) {
      try {
        // Extract session from response to get user info
        const setCookieHeaders = getAllSetCookieHeaders(response);
        const sessionCookie = extractSessionCookie(setCookieHeaders);
        
        if (sessionCookie) {
          const cookieHeader = `${sessionCookie}${request.headers.get("cookie") ? `; ${request.headers.get("cookie")}` : ""}`;
          
          const sessionResult = await auth.api.getSession({
            headers: { cookie: cookieHeader },
          });
          
          if (sessionResult?.user?.email) {
            const email = sessionResult.user.email;
            const lockoutStatus = await checkAccountLockout(email);
            
            if (lockoutStatus.isLocked) {
              // Account is locked, revoke the session and return error
              const clientInfo = getClientInfo(request);
              await recordLoginAttempt(email, false, clientInfo.ipAddress, clientInfo.userAgent);
              
              // Log the lockout attempt
              await logAuthEvent(
                "login",
                sessionResult.user.id,
                false,
                request,
                {
                  email,
                  reason: lockoutStatus.isAdminLocked ? "admin_locked" : "account_locked",
                  lockoutExpiresAt: lockoutStatus.lockoutExpiresAt?.toISOString(),
                }
              );
              
              // Revoke the session by calling logout
              try {
                await auth.api.signOut({
                  headers: { cookie: cookieHeader },
                });
              } catch {
                // Ignore errors during logout
              }
              
              let lockoutMessage: string;
              if (lockoutStatus.isAdminLocked) {
                lockoutMessage = "Your account has been locked by an administrator. Please contact support for assistance.";
              } else {
                const expiryDate = lockoutStatus.lockoutExpiresAt 
                  ? new Date(lockoutStatus.lockoutExpiresAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  : null;
                
                lockoutMessage = expiryDate
                  ? `Your account has been temporarily locked due to too many failed login attempts. Please try again after ${expiryDate}.`
                  : "Your account has been temporarily locked due to too many failed login attempts. Please try again later.";
              }
              
              return NextResponse.json(
                { error: { message: lockoutMessage } },
                { status: 423 } // 423 Locked
              );
            }
          }
        }
      } catch (checkError) {
        // If we can't check lockout status, log but don't block the request
        // This ensures OAuth flow doesn't break if there's an error
        if (process.env.NODE_ENV === "development") {
          console.error("Error checking account lockout after OAuth callback:", checkError);
        }
      }
    }
    
    return response;
  } catch (error) {
    // Log error only in development mode
    // In production, use structured logging service
    if (process.env.NODE_ENV === "development") {
      console.error("Better Auth POST error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      // Check if this is a callback request
      const url = new URL(request.url);
      if (url.pathname.includes("/callback/")) {
        console.error("OAuth callback error - URL:", url.toString());
        console.error("OAuth callback error - Query params:", Object.fromEntries(url.searchParams));
      }
    } else {
      // In production, log minimal information to prevent information leakage
      // TODO: Integrate with proper logging service (Winston, Pino, etc.)
      const url = new URL(request.url);
      if (url.pathname.includes("/callback/")) {
        console.error("OAuth callback error occurred");
      } else {
        console.error("Better Auth POST error occurred");
      }
    }
    // Re-throw to let Better Auth handle it
    throw error;
  }
}

