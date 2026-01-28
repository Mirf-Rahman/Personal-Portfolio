"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/api";
import { AdminPageHeader } from "@/components/ui/admin-page-header";
import { 
  AdminTable, 
  AdminTableHeader, 
  AdminTableHead, 
  AdminTableBody, 
  AdminTableRow, 
  AdminTableCell 
} from "@/components/ui/admin-table";
import { Check, X, Trash2, ArrowUp, ArrowDown, Clock, User, Quote, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShineBorder } from "@/components/ui/shine-border";

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
  const t = useTranslations("admin");
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
      const data = await authenticatedFetch<Testimonial[]>(
        "/api/testimonials/all",
      );
      setTestimonials(data);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError(err instanceof Error ? err.message : t("common.error"));
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
      setActionError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("testimonials.confirmDelete"))) return;
    setActionLoading(id);
    setActionError("");
    try {
      await authenticatedFetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      await fetchTestimonials();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("common.error"));
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

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
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
      setActionError(err instanceof Error ? err.message : t("common.error"));
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
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const pending = testimonials.filter((t) => !t.approved);
  const approved = testimonials
    .filter((t) => t.approved)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title={t("testimonials.title")} 
        description={t("testimonials.description")}
        // No default "Add New" for testimonials as they come from users
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchTestimonials} className="text-red-400 hover:text-red-300 hover:underline">
            {t("testimonials.retry")}
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-red-400 hover:text-red-300 hover:underline">
            {t("testimonials.dismiss")}
          </button>
        </div>
      )}

      {loading ? (
         <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                <div className="h-40 bg-white/5 rounded-xl w-full mb-4"></div>
                <div className="h-64 bg-white/5 rounded-xl w-full"></div>
            </div>
        </div>
      ) : (
        <>
          {/* Pending Testimonials */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                {t("testimonials.pendingApproval")} <span className="text-slate-500 text-sm font-mono">({pending.length})</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((testimonial) => (
                  <ShineBorder
                    key={testimonial.id}
                    className="relative w-full rounded-xl bg-amber-500/[0.05] border border-amber-500/20 p-6 backdrop-blur-sm"
                    shineColor={["#fbbf24", "#d97706", "#f59e0b"]}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <User className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-semibold text-amber-100">{testimonial.name}</p>
                            {(testimonial.position || testimonial.company) && (
                              <p className="text-xs text-amber-200/60">
                                {testimonial.position}
                                {testimonial.position && testimonial.company ? " at " : ""}
                                {testimonial.company}
                              </p>
                            )}
                         </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-200/40 bg-amber-500/10 px-2 py-1 rounded-full">
                         <Clock className="w-3 h-3" />
                         {formatRelativeTime(testimonial.createdAt)}
                      </div>
                    </div>
                    
                    <div className="relative pl-4 border-l-2 border-amber-500/30 my-4">
                       <Quote className="absolute -left-2.5 -top-2 w-4 h-4 text-amber-500/50 bg-black fill-amber-500/20" />
                       <p className="text-sm text-slate-300 italic leading-relaxed">
                         "{testimonial.content}"
                       </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleApprove(testimonial.id, true)}
                        disabled={actionLoading === testimonial.id}
                        className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg border border-green-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
                      >
                        {actionLoading === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                           <Check className="w-4 h-4" /> {t("testimonials.approve")}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={actionLoading === testimonial.id}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/5 transition-all text-sm font-medium"
                      >
                         {t("testimonials.reject")}
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={actionLoading === testimonial.id}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </ShineBorder>
                ))}
              </div>
            </div>
          )}

          {/* Approved Testimonials */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-medium text-white">
              {t("testimonials.approvedTestimonials")} <span className="text-slate-500 text-sm font-mono">({approved.length})</span>
            </h2>
            
            {approved.length === 0 ? (
               <AdminTableRow>
                <AdminTableCell colSpan={4} className="text-center py-12 text-slate-500 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Quote className="w-6 h-6 text-slate-600" />
                     </div>
                     <p>{t("testimonials.noApprovedYet")}</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableHead>{t("testimonials.order")}</AdminTableHead>
                  <AdminTableHead>{t("testimonials.name")}</AdminTableHead>
                  <AdminTableHead>{t("testimonials.content")}</AdminTableHead>
                  <AdminTableHead className="text-right">{t("common.actions")}</AdminTableHead>
                </AdminTableHeader>
                <AdminTableBody>
                    {approved.map((testimonial, index) => {
                      const canMoveUp = index > 0;
                      const canMoveDown = index < approved.length - 1;

                      return (
                        <AdminTableRow key={testimonial.id}>
                          <AdminTableCell>
                             <div className="flex items-center gap-3">
                              <span className="text-slate-500 text-xs font-mono w-6 text-center bg-white/[0.05] rounded py-1">
                                  {testimonial.order}
                              </span>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleReorder(testimonial.id, "up")}
                                  disabled={!canMoveUp || reordering === testimonial.id}
                                  className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleReorder(testimonial.id, "down")}
                                  disabled={!canMoveDown || reordering === testimonial.id}
                                  className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                             <div>
                                <p className="font-medium text-white">{testimonial.name}</p>
                                {(testimonial.position || testimonial.company) && (
                                  <div className="text-xs text-slate-500">
                                    {testimonial.position}
                                    {testimonial.position && testimonial.company ? " • " : ""}
                                    {testimonial.company}
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-600 mt-1">
                                  {formatRelativeTime(testimonial.createdAt)}
                                </div>
                             </div>
                          </AdminTableCell>
                          <AdminTableCell>
                             <p className="text-sm text-slate-400 italic line-clamp-2 max-w-md">
                               "{testimonial.content}"
                             </p>
                          </AdminTableCell>
                          <AdminTableCell>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(testimonial.id, false)}
                                  disabled={actionLoading === testimonial.id}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-white/5 transition-all"
                                >
                                  {t("testimonials.unapprove")}
                                </button>
                                <button
                                  onClick={() => handleDelete(testimonial.id)}
                                  disabled={actionLoading === testimonial.id}
                                  className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                </AdminTableBody>
              </AdminTable>
            )}
          </div>
        </>
      )}
    </div>
  );
}
