"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field length limits
  const LIMITS = {
    name: { min: 2, max: 100 },
    email: { min: 5, max: 255 },
    subject: { min: 3, max: 200 },
    message: { min: 10, max: 5000 },
  };

  // Validate individual field
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < LIMITS.name.min)
          return `Name must be at least ${LIMITS.name.min} characters`;
        if (value.length > LIMITS.name.max)
          return `Name must be no more than ${LIMITS.name.max} characters`;
        if (!/^[a-zA-Z\s\-'\.]+$/.test(value))
          return "Name contains invalid characters";
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (value.length > LIMITS.email.max)
          return `Email must be no more than ${LIMITS.email.max} characters`;
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value)) return "Invalid email format";
        return undefined;

      case "subject":
        if (!value.trim()) return "Subject is required";
        if (value.length < LIMITS.subject.min)
          return `Subject must be at least ${LIMITS.subject.min} characters`;
        if (value.length > LIMITS.subject.max)
          return `Subject must be no more than ${LIMITS.subject.max} characters`;
        return undefined;

      case "message":
        if (!value.trim()) return "Message is required";
        if (value.length < LIMITS.message.min)
          return `Message must be at least ${LIMITS.message.min} characters`;
        if (value.length > LIMITS.message.max)
          return `Message must be no more than ${LIMITS.message.max} characters`;
        return undefined;

      default:
        return undefined;
    }
  };

  // Real-time validation - remove error key when validation passes
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
    if (touched.email) {
      const error = validateField("email", email);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.email = error;
        } else {
          delete updated.email;
        }
        return updated;
      });
    }
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.subject) {
      const error = validateField("subject", subject);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.subject = error;
        } else {
          delete updated.subject;
        }
        return updated;
      });
    }
  }, [subject, touched.subject]);

  useEffect(() => {
    if (touched.message) {
      const error = validateField("message", message);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated.message = error;
        } else {
          delete updated.message;
        }
        return updated;
      });
    }
  }, [message, touched.message]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "name" ? name : field === "email" ? email : field === "subject" ? subject : message;
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
    setTouched({ name: true, email: true, subject: true, message: true });

    // Validate all fields
    const errors: FieldErrors = {};
    const nameError = validateField("name", name);
    const emailError = validateField("email", email);
    const subjectError = validateField("subject", subject);
    const messageError = validateField("message", message);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (subjectError) errors.subject = subjectError;
    if (messageError) errors.message = messageError;

    setFieldErrors(errors);

    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

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
          setError(data.error || "Failed to send message");
        }
        return;
      }

      // Success
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
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

  // Check if form is valid: all fields filled and no error messages
  const isFormValid =
    name.trim() &&
    email.trim() &&
    subject.trim() &&
    message.trim() &&
    Object.keys(fieldErrors).length === 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 py-12 md:py-24 lg:py-32 bg-muted/30 flex items-center justify-center">
        <div className="container px-4 md:px-6 mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Get In Touch
            </h1>
            <p className="text-muted-foreground text-lg">
              Have a project in mind or just want to say hi? Feel free to send me a
              message!
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
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out. I&apos;ll get back to you soon.
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
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name *
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur("name")}
                      required
                      placeholder="John Doe"
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
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      required
                      placeholder="john@example.com"
                      maxLength={LIMITS.email.max}
                      aria-invalid={fieldErrors.email ? "true" : "false"}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      className={`flex h-10 w-full rounded-md border ${
                        fieldErrors.email
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-input"
                      } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                    />
                    {fieldErrors.email && (
                      <p
                        id="email-error"
                        className="text-sm text-red-600 dark:text-red-400"
                        role="alert"
                      >
                        {fieldErrors.email}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {email.length}/{LIMITS.email.max} characters
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() => handleBlur("subject")}
                    required
                    placeholder="Project Inquiry"
                    maxLength={LIMITS.subject.max}
                    aria-invalid={fieldErrors.subject ? "true" : "false"}
                    aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
                    className={`flex h-10 w-full rounded-md border ${
                      fieldErrors.subject
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input"
                    } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  />
                  {fieldErrors.subject && (
                    <p
                      id="subject-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {fieldErrors.subject}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {subject.length}/{LIMITS.subject.max} characters
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => handleBlur("message")}
                    required
                    placeholder="Your message here..."
                    maxLength={LIMITS.message.max}
                    rows={8}
                    aria-invalid={fieldErrors.message ? "true" : "false"}
                    aria-describedby={fieldErrors.message ? "message-error" : undefined}
                    className={`flex min-h-[150px] w-full rounded-md border ${
                      fieldErrors.message
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input"
                    } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y`}
                  />
                  {fieldErrors.message && (
                    <p
                      id="message-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {fieldErrors.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {message.length}/{LIMITS.message.max} characters
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
                      Sending...
                    </>
                  ) : (
                    "Send Message"
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
