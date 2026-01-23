"use client";

import { useState, useEffect } from "react";

interface FieldErrors {
  name?: string;
  position?: string;
  company?: string;
  content?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function TestimonialsClient() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field length limits
  const LIMITS = {
    name: { min: 2, max: 100 },
    position: { min: 0, max: 100 },
    company: { min: 0, max: 100 },
    content: { min: 10, max: 2000 },
  };

  // Validate individual field
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        const trimmedName = value.trim();
        if (trimmedName.length < LIMITS.name.min)
          return `Name must be at least ${LIMITS.name.min} characters`;
        if (trimmedName.length > LIMITS.name.max)
          return `Name must be no more than ${LIMITS.name.max} characters`;
        if (!/^[\p{L}\p{M}\s\-'\.]+$/u.test(trimmedName))
          return "Name contains invalid characters";
        return undefined;

      case "position":
        if (value.trim() && value.trim().length > LIMITS.position.max)
          return `Position must be no more than ${LIMITS.position.max} characters`;
        return undefined;

      case "company":
        if (value.trim() && value.trim().length > LIMITS.company.max)
          return `Company must be no more than ${LIMITS.company.max} characters`;
        return undefined;

      case "content":
        if (!value.trim()) return "Testimonial content is required";
        const trimmedContent = value.trim();
        if (trimmedContent.length < LIMITS.content.min)
          return `Testimonial content must be at least ${LIMITS.content.min} characters`;
        if (trimmedContent.length > LIMITS.content.max)
          return `Testimonial content must be no more than ${LIMITS.content.max} characters`;
        return undefined;

      default:
        return undefined;
    }
  };

  // Real-time validation
  useEffect(() => {
    if (touched.name) {
      const error = validateField("name", name);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.name = error;
        } else {
          delete updated.name;
        }
        return updated;
      });
    }
  }, [name, touched.name]);

  useEffect(() => {
    if (touched.position) {
      const error = validateField("position", position);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.position = error;
        } else {
          delete updated.position;
        }
        return updated;
      });
    }
  }, [position, touched.position]);

  useEffect(() => {
    if (touched.company) {
      const error = validateField("company", company);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.company = error;
        } else {
          delete updated.company;
        }
        return updated;
      });
    }
  }, [company, touched.company]);

  useEffect(() => {
    if (touched.content) {
      const error = validateField("content", content);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.content = error;
        } else {
          delete updated.content;
        }
        return updated;
      });
    }
  }, [content, touched.content]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value =
      field === "name"
        ? name
        : field === "position"
        ? position
        : field === "company"
        ? company
        : content;
    const error = validateField(field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (error) {
        updated[field as keyof FieldErrors] = error;
      } else {
        delete updated[field as keyof FieldErrors];
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Mark all fields as touched
    setTouched({ name: true, position: true, company: true, content: true });

    // Validate all fields
    const errors: FieldErrors = {};
    const nameError = validateField("name", name);
    const positionError = validateField("position", position);
    const companyError = validateField("company", company);
    const contentError = validateField("content", content);

    if (nameError) errors.name = nameError;
    if (positionError) errors.position = positionError;
    if (companyError) errors.company = companyError;
    if (contentError) errors.content = contentError;

    setFieldErrors(errors);

    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          position: position.trim() || null,
          company: company.trim() || null,
          content: content.trim(),
        }),
      });

      // Check Content-Type before parsing response
      const contentType = res.headers.get("content-type");
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        setError(
          `Server error (${res.status}): ${text || "Unexpected response format"}`
        );
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Handle validation errors from server
        if (data.code === "VALIDATION_ERROR" && data.details) {
          const serverErrors: FieldErrors = {};
          (data.details as ValidationError[]).forEach((err) => {
            serverErrors[err.field as keyof FieldErrors] = err.message;
          });
          setFieldErrors(serverErrors);
          setError("Please fix the errors below");
        } else if (data.code === "RATE_LIMIT_EXCEEDED") {
          const retryAfter = data.retryAfter || 900;
          setError(
            `Too many requests. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
          );
        } else {
          setError(data.error || "Failed to submit testimonial");
        }
        return;
      }

      // Success
      setSuccess(true);
      setName("");
      setPosition("");
      setCompany("");
      setContent("");
      setFieldErrors({});
      setTouched({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid: required fields filled and no error messages
  const isFormValid =
    name.trim() &&
    content.trim() &&
    Object.keys(fieldErrors).length === 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Submission Form Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6 mx-auto max-w-xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Leave a Testimonial
            </h1>
            <p className="text-muted-foreground text-lg">
              Worked with me? I&apos;d love to hear your feedback!
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground">
                  Your testimonial has been submitted for review.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setError("");
                    setFieldErrors({});
                    setTouched({});
                  }}
                  className="mt-4 text-primary hover:underline"
                >
                  Submit another testimonial
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <label htmlFor="t-name" className="text-sm font-medium">
                    Your Name *
                  </label>
                  <input
                    id="t-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur("name")}
                    required
                    placeholder="Alex Smith"
                    maxLength={LIMITS.name.max}
                    aria-invalid={fieldErrors.name ? "true" : "false"}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    className={`flex h-10 w-full rounded-md border ${
                      fieldErrors.name
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input"
                    } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  />
                  {fieldErrors.name && (
                    <p
                      id="name-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {fieldErrors.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {name.length}/{LIMITS.name.max} characters
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="t-position" className="text-sm font-medium">
                      Position
                    </label>
                    <input
                      id="t-position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      onBlur={() => handleBlur("position")}
                      placeholder="Product Manager"
                      maxLength={LIMITS.position.max}
                      aria-invalid={fieldErrors.position ? "true" : "false"}
                      aria-describedby={fieldErrors.position ? "position-error" : undefined}
                      className={`flex h-10 w-full rounded-md border ${
                        fieldErrors.position
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-input"
                      } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                    />
                    {fieldErrors.position && (
                      <p
                        id="position-error"
                        className="text-sm text-red-600 dark:text-red-400"
                        role="alert"
                      >
                        {fieldErrors.position}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {position.length}/{LIMITS.position.max} characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="t-company" className="text-sm font-medium">
                      Company
                    </label>
                    <input
                      id="t-company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      onBlur={() => handleBlur("company")}
                      placeholder="Tech Corp"
                      maxLength={LIMITS.company.max}
                      aria-invalid={fieldErrors.company ? "true" : "false"}
                      aria-describedby={fieldErrors.company ? "company-error" : undefined}
                      className={`flex h-10 w-full rounded-md border ${
                        fieldErrors.company
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-input"
                      } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                    />
                    {fieldErrors.company && (
                      <p
                        id="company-error"
                        className="text-sm text-red-600 dark:text-red-400"
                        role="alert"
                      >
                        {fieldErrors.company}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {company.length}/{LIMITS.company.max} characters
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="t-message" className="text-sm font-medium">
                    Testimonial *
                  </label>
                  <textarea
                    id="t-message"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => handleBlur("content")}
                    required
                    placeholder="Share your experience working with me..."
                    maxLength={LIMITS.content.max}
                    rows={8}
                    aria-invalid={fieldErrors.content ? "true" : "false"}
                    aria-describedby={fieldErrors.content ? "content-error" : undefined}
                    className={`flex min-h-[150px] w-full rounded-md border ${
                      fieldErrors.content
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input"
                    } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y`}
                  />
                  {fieldErrors.content && (
                    <p
                      id="content-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {fieldErrors.content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {content.length}/{LIMITS.content.max} characters
                  </p>
                </div>
                {error && (
                  <div
                    className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Testimonial"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
