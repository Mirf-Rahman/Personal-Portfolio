/**
 * Input sanitization utilities for contact form
 */

/**
 * Remove HTML tags and escape special characters to prevent XSS
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return sanitized;
}

/**
 * Sanitize and trim a string field
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input.trim();
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

/**
 * Validate email format more strictly
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  // RFC 5322 compliant regex (simplified)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email);
}

/**
 * Sanitize contact form data
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function sanitizeContactForm(data: {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}): ContactFormData {
  return {
    name: sanitizeString(String(data.name || "")),
    email: normalizeEmail(String(data.email || "")),
    subject: sanitizeString(String(data.subject || "")),
    message: sanitizeText(String(data.message || "")),
  };
}

/**
 * Check for common spam patterns
 */
export function containsSpamPatterns(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  const lowerText = text.toLowerCase();

  // Check for excessive links (handled separately from pattern matching)
  const urlCount = (lowerText.match(/(http|https|www\.)/gi) || []).length;
  if (urlCount > 3) {
    return true;
  }

  // Common spam patterns
  const spamPatterns = [
    /\b(viagra|cialis|casino|poker|lottery|winner|prize|free money)\b/i,
    /\b(click here|buy now|limited time|act now|urgent)\b/i,
    /\b\d{10,}\b/, // Long number sequences (phone numbers)
  ];

  // Check for spam keywords
  for (const pattern of spamPatterns) {
    if (pattern.test(lowerText)) {
      return true;
    }
  }

  return false;
}
