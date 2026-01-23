"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/api";

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  content: string;
  approved: boolean;
  order: number;
  createdAt: string;
}

export default function TestimonialsManagementPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchTestimonials = async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const data = await authenticatedFetch<Testimonial[]>("/api/testimonials/all");
      setTestimonials(data);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load testimonials. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    setActionLoading(id);
    setActionError("");
    try {
      await authenticatedFetch(`/api/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify({ approved }),
      });
      await fetchTestimonials();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update testimonial"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    setActionLoading(id);
    setActionError("");
    try {
      await authenticatedFetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      await fetchTestimonials();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete testimonial"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const approvedTestimonials = testimonials
      .filter((t) => t.approved)
      .sort((a, b) => a.order - b.order);
    
    const currentIndex = approvedTestimonials.findIndex((t) => t.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= approvedTestimonials.length) return;

    const targetTestimonial = approvedTestimonials[targetIndex];
    setReordering(id);
    setActionError("");

    try {
      await authenticatedFetch("/api/testimonials/swap-order", {
        method: "POST",
        body: JSON.stringify({
          testimonialId1: id,
          testimonialId2: targetTestimonial.id,
        }),
      });
      await fetchTestimonials();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to reorder testimonials"
      );
    } finally {
      setReordering(null);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const pending = testimonials.filter((t) => !t.approved);
  const approved = testimonials
    .filter((t) => t.approved)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testimonials Management</h1>
        <p className="text-muted-foreground mt-1">
          {loading
            ? "Loading testimonials..."
            : pending.length > 0
              ? `${pending.length} pending approval${pending.length > 1 ? "s" : ""}`
              : "Review and approve testimonials from clients and colleagues"}
        </p>
      </div>

      {error && (
        <div
          className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchTestimonials}
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div
          className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3 mb-4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Pending Testimonials */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pending Approval ({pending.length})</h2>
              <div className="grid gap-4">
                {pending.map((testimonial) => (
                  <div key={testimonial.id} className="rounded-lg border bg-yellow-50 dark:bg-yellow-900/10 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        {(testimonial.position || testimonial.company) && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.position}{testimonial.position && testimonial.company ? " at " : ""}{testimonial.company}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(testimonial.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 italic">&quot;{testimonial.content}&quot;</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(testimonial.id, true)}
                        disabled={actionLoading === testimonial.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {actionLoading === testimonial.id ? (
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
                            Processing...
                          </>
                        ) : (
                          "Approve"
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={actionLoading === testimonial.id}
                        className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Testimonials */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Approved Testimonials ({approved.length})</h2>
            {approved.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">No approved testimonials yet</p>
                <p className="text-sm">Approved testimonials will appear here</p>
              </div>
            ) : (
              <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Content</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {approved.map((testimonial, index) => {
                        const canMoveUp = index > 0;
                        const canMoveDown = index < approved.length - 1;
                        
                        return (
                          <tr key={testimonial.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm w-8">{testimonial.order}</span>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleReorder(testimonial.id, "up")}
                                    disabled={!canMoveUp || reordering === testimonial.id}
                                    className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleReorder(testimonial.id, "down")}
                                    disabled={!canMoveDown || reordering === testimonial.id}
                                    className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-semibold">{testimonial.name}</p>
                                {(testimonial.position || testimonial.company) && (
                                  <p className="text-xs text-muted-foreground">
                                    {testimonial.position}{testimonial.position && testimonial.company ? " at " : ""}{testimonial.company}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatRelativeTime(testimonial.createdAt)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-muted-foreground italic line-clamp-2">&quot;{testimonial.content}&quot;</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleApprove(testimonial.id, false)}
                                  disabled={actionLoading === testimonial.id || reordering === testimonial.id}
                                  className="text-sm text-muted-foreground hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === testimonial.id ? "Processing..." : "Unapprove"}
                                </button>
                                <button
                                  onClick={() => handleDelete(testimonial.id)}
                                  disabled={actionLoading === testimonial.id || reordering === testimonial.id}
                                  className="text-sm text-destructive hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
