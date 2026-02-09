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
    name: sanitizeText(String(data.name || "")).trim(),
    email: normalizeEmail(String(data.email || "")),
    subject: sanitizeText(String(data.subject || "")).trim(),
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

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize testimonial form data
 */
export interface TestimonialFormData {
  name: string;
  position: string;
  company: string;
  content: string;
  contentFr: string;
}

export function sanitizeTestimonialForm(data: {
  name?: unknown;
  position?: unknown;
  company?: unknown;
  content?: unknown;
  contentFr?: unknown;
}): TestimonialFormData {
  return {
    name: sanitizeText(String(data.name || "")).trim(),
    position: sanitizeText(String(data.position || "")).trim(),
    company: sanitizeText(String(data.company || "")).trim(),
    content: sanitizeText(String(data.content || "")),
    contentFr: sanitizeText(String(data.contentFr || "")),
  };
}
