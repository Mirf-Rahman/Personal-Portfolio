"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Check, X, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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

  const fetchTestimonials = useCallback(async () => {
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
  }, [session, t]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
        description={loading
            ? t("common.loading")
            : pending.length > 0
              ? `${pending.length} ${t("testimonials.pendingApproval")}`
              : t("testimonials.description")}
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between">
           <span>{error}</span>
            <button
              onClick={fetchTestimonials}
              className="text-red-400 hover:text-red-300 underline font-medium"
            >
              {t("testimonials.retry")}
            </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between">
           <span>{actionError}</span>
            <button
               onClick={() => setActionError("")}
              className="text-red-400 hover:text-red-300 underline font-medium"
            >
              {t("testimonials.dismiss")}
            </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
           <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-white/5 rounded-xl w-full"></div>
            </div>
           </div>
        </div>
      ) : (
        <>
          {/* Pending Testimonials */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                {t("testimonials.pendingApproval")} 
                <span className="text-sm font-normal text-slate-400 ml-2 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.05]">
                    {pending.length}
                </span>
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((testimonial) => (
                  <ShineBorder 
                    key={testimonial.id}
                    className="relative rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-sm"
                    shineColor={["#facc15", "#fbbf24", "#f59e0b"]}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg text-white">
                          {testimonial.name}
                        </p>
                        {(testimonial.position || testimonial.company) && (
                          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                            {testimonial.position}
                            {testimonial.position && testimonial.company
                              ? " at "
                              : ""}
                            <span className="text-slate-300">{testimonial.company}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] bg-white/[0.05] px-2 py-1 rounded-full text-slate-400 whitespace-nowrap border border-white/[0.05]">
                        {formatRelativeTime(testimonial.createdAt)}
                      </span>
                    </div>
                    
                    <div className="relative mb-6">
                        <span className="absolute -left-2 -top-2 text-4xl text-white/[0.05] font-serif leading-none">“</span>
                        <p className="text-slate-300 italic relative z-10 pl-2">
                           {testimonial.content}
                        </p>
                        <span className="absolute -right-2 -bottom-4 text-4xl text-white/[0.05] font-serif leading-none">”</span>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                      <button
                        onClick={() => handleApprove(testimonial.id, true)}
                        disabled={actionLoading === testimonial.id}
                        className="flex-1 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-all disabled:opacity-50 text-sm font-medium flex justify-center items-center gap-2"
                      >
                         {actionLoading === testimonial.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400" />
                         ) : (
                            <>
                                <Check className="w-4 h-4" /> {t("testimonials.approve")}
                            </>
                         )}
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={actionLoading === testimonial.id}
                        className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all disabled:opacity-50 text-sm font-medium flex justify-center items-center gap-2"
                      >
                         <p className="sr-only">{t("testimonials.reject")}</p>
                         <X className="w-4 h-4" /> {t("testimonials.reject")}
                      </button>
                    </div>
                  </ShineBorder>
                ))}
              </div>
            </div>
          )}

          {/* Approved Testimonials */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {t("testimonials.approvedTestimonials")} 
                </h2>
                <span className="text-sm text-slate-400">{approved.length} total</span>
             </div>

            {approved.length === 0 ? (
               <div className="text-center py-16 border border-white/[0.05] rounded-2xl bg-white/[0.01]">
                <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <Check className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium text-slate-300 mb-1">
                  {t("testimonials.noApprovedYet")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("testimonials.approvedWillAppear")}
                </p>
              </div>
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableHead>{t("testimonials.order")}</AdminTableHead>
                  <AdminTableHead>{t("testimonials.name")}</AdminTableHead>
                  <AdminTableHead className="w-1/2">{t("testimonials.content")}</AdminTableHead>
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
                                onClick={() =>
                                  handleReorder(testimonial.id, "up")
                                }
                                disabled={
                                  !canMoveUp ||
                                  reordering === testimonial.id
                                }
                                className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                                title={t("testimonials.moveUp")}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleReorder(testimonial.id, "down")
                                }
                                disabled={
                                  !canMoveDown ||
                                  reordering === testimonial.id
                                }
                                className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                                title={t("testimonials.moveDown")}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>
                          <div>
                            <p className="font-medium text-white">
                              {testimonial.name}
                            </p>
                            {(testimonial.position ||
                              testimonial.company) && (
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                                {testimonial.position}
                                {testimonial.position && testimonial.company
                                  ? " @ "
                                  : ""}
                                {testimonial.company}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 mt-1">
                              {formatRelativeTime(testimonial.createdAt)}
                            </p>
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>
                          <p className="text-sm text-slate-300 italic line-clamp-2">
                            &quot;{testimonial.content}&quot;
                          </p>
                        </AdminTableCell>
                        <AdminTableCell>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() =>
                                handleApprove(testimonial.id, false)
                              }
                              disabled={
                                actionLoading === testimonial.id ||
                                reordering === testimonial.id
                              }
                              className="p-2 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 rounded-lg transition-colors border border-transparent hover:border-yellow-500/20"
                              title={t("testimonials.unapprove")}
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(testimonial.id)}
                              disabled={
                                actionLoading === testimonial.id ||
                                reordering === testimonial.id
                              }
                              className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                              title={t("testimonials.delete")}
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
