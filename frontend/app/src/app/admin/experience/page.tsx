"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/ui/admin-page-header";
import {
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
} from "@/components/ui/admin-table";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Experience {
  id: string;
  company: string;
  position: string;
  positionFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  order: number;
}

function toInputDate(str: string | null): string {
  if (!str) return "";
  const d = new Date(str);
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  company: "",
  position: "",
  positionFr: "",
  description: "",
  descriptionFr: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  order: 0,
};

export default function ExperienceManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null,
  );
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchExperiences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to edit form when editing starts or when switching between items
  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isEditing, editingExperience]);

  const fetchExperiences = async () => {
    try {
      const data = await fetchApi<Experience[]>("/api/experiences");
      setExperiences(data);
    } catch (err) {
      console.error("Error fetching experiences:", err);
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        company: formData.company,
        position: formData.position,
        positionFr: formData.positionFr || null,
        description: formData.description,
        descriptionFr: formData.descriptionFr || null,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        current: formData.current,
      };

      if (editingExperience) {
        await authenticatedFetch<Experience>(
          `/api/experiences/${editingExperience.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
      } else {
        await authenticatedFetch<Experience>("/api/experiences", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormData(emptyForm);
      setIsEditing(false);
      setEditingExperience(null);
      await fetchExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setFormData({
      company: exp.company,
      position: exp.position,
      positionFr: exp.positionFr ?? "",
      description: exp.description,
      descriptionFr: exp.descriptionFr ?? "",
      location: exp.location,
      startDate: toInputDate(exp.startDate),
      endDate: toInputDate(exp.endDate),
      current: exp.current,
      order: exp.order,
    });
    setIsEditing(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("experience.confirmDelete"))) return;
    try {
      await authenticatedFetch(`/api/experiences/${id}`, { method: "DELETE" });
      await fetchExperiences();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingExperience(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    const maxOrder =
      experiences.length > 0
        ? Math.max(...experiences.map((e) => e.order), 0)
        : 0;
    setFormData({ ...emptyForm, order: maxOrder + 1 });
    setIsEditing(true);
    setError("");
  };

  const handleReorder = async (
    experienceId: string,
    direction: "up" | "down",
  ) => {
    if (reordering) return;
    setReordering(experienceId);
    try {
      const sorted = [...experiences].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((e) => e.id === experienceId);
      if (idx < 0) return;
      const other = direction === "up" ? sorted[idx - 1] : sorted[idx + 1];
      if (!other) return;
      await authenticatedFetch("/api/experiences/swap-order", {
        method: "POST",
        body: JSON.stringify({
          experienceId1: experienceId,
          experienceId2: other.id,
        }),
      });
      await fetchExperiences();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setReordering(null);
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const sortedExperiences = [...experiences].sort((a, b) => a.order - b.order);

  // Common input styles
  const inputClass =
    "w-full pl-4 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass =
    "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("experience.title")}
        description={t("experience.description")}
        customAction={
          <button
            onClick={handleAddExperience}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/20 transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> {t("experience.addNew")}
          </button>
        }
      />

      {(isEditing || editingExperience) && (
        <ShineBorder
          className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
          shineColor={["#f472b6", "#e879f9", "#c084fc"]}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl text-white">
              {editingExperience
                ? t("experience.editExperience")
                : t("experience.addNewExperience")}
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  {t("experience.companyLabel")} *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    required
                    placeholder="Acme Inc."
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {t("experience.positionLabel")} *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                    placeholder={t("experience.positionPlaceholder")}
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {t("experience.descriptionLabel")} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                placeholder={t("experience.descriptionPlaceholder")}
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  {t("experience.positionFrLabel")}
                </label>
                <input
                  type="text"
                  value={formData.positionFr}
                  onChange={(e) =>
                    setFormData({ ...formData, positionFr: e.target.value })
                  }
                  placeholder={t("experience.positionFrPlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t("experience.descriptionFrLabel")}
                </label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionFr: e.target.value })
                  }
                  placeholder={t("experience.descriptionFrPlaceholder")}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {t("experience.locationLabel")} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  placeholder={t("experience.locationPlaceholder")}
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  {t("experience.startDateLabel")} *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {t("experience.endDateLabel")}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    disabled={formData.current}
                    className={cn(inputClass, "pl-10 disabled:opacity-50")}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-6 items-center pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      current: e.target.checked,
                      ...(e.target.checked ? { endDate: "" } : {}),
                    });
                  }}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-sm font-medium text-slate-300">
                  {t("experience.currentLabel")}
                </span>
              </label>

              {!editingExperience && (
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-mono">
                    {t("experience.autoOrderHint")} {formData.order}
                  </p>
                </div>
              )}
            </div>

            {editingExperience && (
              <div>
                <label className={labelClass}>
                  {t("experience.orderPosition")}
                </label>
                <select
                  value={formData.order}
                  onChange={async (e) => {
                    const newOrder = parseInt(e.target.value, 10);
                    if (newOrder === formData.order) return;
                    try {
                      setSubmitting(true);
                      setError("");
                      await authenticatedFetch<Experience>(
                        `/api/experiences/${editingExperience.id}`,
                        {
                          method: "PUT",
                          body: JSON.stringify({
                            order: newOrder,
                            shouldSwap: true,
                          }),
                        },
                      );
                      await fetchExperiences();
                      setFormData((prev) => ({ ...prev, order: newOrder }));
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : t("common.error"),
                      );
                      e.target.value = String(formData.order);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className={cn(inputClass, "disabled:opacity-50")}
                >
                  {(() => {
                    const uniqueOrders = [
                      ...new Set(experiences.map((e) => e.order)),
                    ].sort((a, b) => a - b);
                    return uniqueOrders.map((position) => {
                      const expAtPosition = experiences.find(
                        (e) => e.order === position,
                      );
                      const isCurrent =
                        expAtPosition?.id === editingExperience.id;
                      return (
                        <option
                          key={position}
                          value={position}
                          className="bg-slate-900 text-slate-200"
                        >
                          {t("experience.positionLabel")} {position}
                          {expAtPosition && !isCurrent
                            ? ` – ${expAtPosition.position} at ${expAtPosition.company}`
                            : isCurrent
                              ? ` (${t("experience.currentPosition")})`
                              : ` (${t("experience.emptyPosition")})`}
                        </option>
                      );
                    });
                  })()}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                  {t("experience.positionHint")}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>{t("common.saving")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {editingExperience
                        ? t("experience.update")
                        : t("experience.create")}
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-2.5 border border-white/[0.1] bg-white/[0.05] text-slate-300 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </ShineBorder>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-white/5 rounded-xl w-full"></div>
          </div>
        </div>
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <AdminTableHead>{t("experience.order")}</AdminTableHead>
            <AdminTableHead>{t("experience.position")}</AdminTableHead>
            <AdminTableHead>{t("experience.company")}</AdminTableHead>
            <AdminTableHead>{t("experience.location")}</AdminTableHead>
            <AdminTableHead>{t("experience.dates")}</AdminTableHead>
            <AdminTableHead className="text-right">
              {t("common.actions")}
            </AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
            {sortedExperiences.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell
                  colSpan={6}
                  className="text-center py-12 text-slate-500"
                >
                  {t("experience.empty")}
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              sortedExperiences.map((exp, index) => {
                const canMoveUp = index > 0;
                const canMoveDown = index < sortedExperiences.length - 1;
                const start = exp.startDate
                  ? new Date(exp.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })
                  : "";
                const end = exp.current
                  ? t("common.present")
                  : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })
                    : "";

                return (
                  <AdminTableRow key={exp.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs font-mono w-6 text-center bg-white/[0.05] rounded py-1">
                          {exp.order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleReorder(exp.id, "up")}
                            disabled={!canMoveUp || reordering === exp.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("experience.moveUp")}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReorder(exp.id, "down")}
                            disabled={!canMoveDown || reordering === exp.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("experience.moveDown")}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-medium text-white">
                        {exp.position}
                      </div>
                      {exp.positionFr && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {exp.positionFr}
                        </div>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {exp.company}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        {exp.location}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/[0.03] px-2 py-1 rounded w-fit">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {start} – {end}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                          title={t("experience.edit")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title={t("experience.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
