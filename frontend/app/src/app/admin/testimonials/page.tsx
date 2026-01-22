"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Testimonial {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  content: string;
  approved: boolean;
  createdAt: string;
}

export default function TestimonialsManagementPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchTestimonials();
  }, [session]);

  const fetchTestimonials = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}/api/testimonials/all`, {
        headers: { Authorization: `Bearer ${session?.session.token || ""}` },
      });
      if (res.ok) setTestimonials(await res.json());
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session.token || ""}`,
        },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error("Failed to update testimonial");
      fetchTestimonials();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`${API_URL}/api/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.session.token || ""}` },
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");
      fetchTestimonials();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (isPending || !session) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const pending = testimonials.filter((t) => !t.approved);
  const approved = testimonials.filter((t) => t.approved);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Testimonials Management</h1>
        <p className="text-muted-foreground mt-1">Review and approve testimonials from clients and colleagues</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
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
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 italic">&quot;{testimonial.content}&quot;</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(testimonial.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10"
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
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                No approved testimonials yet
              </div>
            ) : (
              <div className="rounded-lg border bg-card">
                <div className="divide-y">
                  {approved.map((testimonial) => (
                    <div key={testimonial.id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{testimonial.name}</p>
                          {(testimonial.position || testimonial.company) && (
                            <p className="text-sm text-muted-foreground">
                              {testimonial.position}{testimonial.position && testimonial.company ? " at " : ""}{testimonial.company}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2 italic line-clamp-2">&quot;{testimonial.content}&quot;</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(testimonial.id, false)}
                            className="text-sm text-muted-foreground hover:underline"
                          >
                            Unapprove
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
