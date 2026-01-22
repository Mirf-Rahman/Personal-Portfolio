"use client";

import { useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  content: string;
  imageUrl: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function TestimonialsClient({ testimonials }: { testimonials: Testimonial[] }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, position, company, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit testimonial");
      }

      setSuccess(true);
      setName("");
      setPosition("");
      setCompany("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Testimonials Display Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              What People Say
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Kind words from colleagues, clients, and friends I&apos;ve had the pleasure of working with.
            </p>
          </div>
          
          {testimonials.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm">
                  <div className="mb-4">
                    <svg
                      className="h-8 w-8 text-primary/20 mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.059 14.929 15.489C15.536 14.919 16.486 14.489 17.779 14.199L18.429 14.029L18.429 8.939L17.779 9.179C12.879 10.979 11.279 15.339 10.979 21L14.017 21ZM5.00003 21L8.03803 21C7.73803 15.339 6.13803 10.979 1.23803 9.179L0.588028 8.939L0.588028 14.029L1.23803 14.199C2.53103 14.489 3.48103 14.919 4.08803 15.489C4.69503 16.059 5.00003 16.896 5.00003 18L5.00003 21Z" />
                    </svg>
                    <p className="text-muted-foreground italic">&quot;{t.content}&quot;</p>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                      {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      {(t.position || t.company) && (
                        <p className="text-xs text-muted-foreground">
                          {t.position}{t.position && t.company ? " at " : ""}{t.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No testimonials yet. Be the first to leave one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Submission Form Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-4">
              Leave a Testimonial
            </h2>
            <p className="text-muted-foreground">
              Worked with me? I&apos;d love to hear your feedback!
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground">Your testimonial has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="t-name" className="text-sm font-medium">Your Name *</label>
                  <input
                    id="t-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Alex Smith"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="t-position" className="text-sm font-medium">Position</label>
                    <input
                      id="t-position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Product Manager"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="t-company" className="text-sm font-medium">Company</label>
                    <input
                      id="t-company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Tech Corp"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="t-message" className="text-sm font-medium">Testimonial *</label>
                  <textarea
                    id="t-message"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="Share your experience working with me..."
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Testimonial"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
