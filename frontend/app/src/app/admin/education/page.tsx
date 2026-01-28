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
  AdminTableCell 
} from "@/components/ui/admin-table";
import { ShineBorder } from "@/components/ui/shine-border";
import { Pencil, Trash2, ArrowUp, ArrowDown, X, Save, GraduationCap, School, Calendar, BookOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Education {
  id: string;
  institution: string;
  degree: string;
  degreeFr?: string | null;
  field: string;
  fieldFr?: string | null;
  description: string | null;
  descriptionFr?: string | null;
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
  institution: "",
  degree: "",
  degreeFr: "",
  field: "",
  fieldFr: "",
  description: "",
  descriptionFr: "",
  startDate: "",
  endDate: "",
  current: false,
  order: 0,
};

export default function EducationManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchEducation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEducation = async () => {
    try {
      const data = await fetchApi<Education[]>("/api/education");
      setEducation(data);
    } catch (err) {
      console.error("Error fetching education:", err);
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
        institution: formData.institution,
        degree: formData.degree,
        degreeFr: formData.degreeFr || null,
        field: formData.field,
        fieldFr: formData.fieldFr || null,
        description: formData.description || null,
        descriptionFr: formData.descriptionFr || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        current: formData.current,
      };

      if (editingEducation) {
        await authenticatedFetch<Education>(
          `/api/education/${editingEducation.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
      } else {
        await authenticatedFetch<Education>("/api/education", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormData(emptyForm);
      setIsEditing(false);
      setEditingEducation(null);
      await fetchEducation();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      degreeFr: edu.degreeFr ?? "",
      field: edu.field,
      fieldFr: edu.fieldFr ?? "",
      description: edu.description || "",
      descriptionFr: edu.descriptionFr ?? "",
      startDate: toInputDate(edu.startDate),
      endDate: toInputDate(edu.endDate),
      current: edu.current,
      order: edu.order,
    });
    setIsEditing(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("education.confirmDelete"))) return;
    try {
      await authenticatedFetch(`/api/education/${id}`, { method: "DELETE" });
      await fetchEducation();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingEducation(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleAddEducation = () => {
    setEditingEducation(null);
    const maxOrder =
      education.length > 0 ? Math.max(...education.map((e) => e.order), 0) : 0;
    setFormData({ ...emptyForm, order: maxOrder + 1 });
    setIsEditing(true);
    setError("");
  };

  const handleReorder = async (
    educationId: string,
    direction: "up" | "down",
  ) => {
    if (reordering) return;
    setReordering(educationId);
    try {
      const sorted = [...education].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((e) => e.id === educationId);
      if (idx < 0) return;
      const other = direction === "up" ? sorted[idx - 1] : sorted[idx + 1];
      if (!other) return;
      await authenticatedFetch("/api/education/swap-order", {
        method: "POST",
        body: JSON.stringify({
          educationId1: educationId,
          educationId2: other.id,
        }),
      });
      await fetchEducation();
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

  const sortedEducation = [...education].sort((a, b) => a.order - b.order);

  // Common input styles
  const inputClass = "w-full pl-4 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass = "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title={t("education.title")} 
        description={t("education.description")}
        customAction={
          <button
            onClick={handleAddEducation}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/20 transition-all text-sm font-semibold"
          >
           <Plus className="w-4 h-4" /> {t("education.addNew")}
          </button>
        }
      />

      {(isEditing || editingEducation) && (
        <ShineBorder 
          className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
          shineColor={["#f472b6", "#e879f9", "#c084fc"]}
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-display font-bold text-xl text-white">
              {editingEducation ? t("education.editEducation") : t("education.addNewEducation")}
            </h3>
            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>{t("education.institution")} *</label>
              <div className="relative">
                 <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  required
                  placeholder="University Name"
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("education.degree")} *</label>
                <div className="relative">
                   <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    required
                    placeholder="Bachelor of Science"
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("education.field")} *</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    required
                    placeholder="Computer Science"
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("education.educationDescription")}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("education.descriptionPlaceholder")}
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("education.degreeFr")}</label>
                <input
                  type="text"
                  value={formData.degreeFr}
                  onChange={(e) => setFormData({ ...formData, degreeFr: e.target.value })}
                  placeholder={t("education.degreeFr")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("education.fieldFr")}</label>
                <input
                  type="text"
                  value={formData.fieldFr}
                  onChange={(e) => setFormData({ ...formData, fieldFr: e.target.value })}
                  placeholder={t("education.fieldFr")}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{t("education.descriptionFr")}</label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                  placeholder={t("education.descriptionFr")}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("education.startDate")} *</label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("education.endDate")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                  id="current"
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
                <span className="text-sm font-medium text-slate-300">{t("education.currentlyStudying")}</span>
              </label>

              {!editingEducation && (
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-mono">
                    {t("education.autoOrderHint")} {formData.order})
                  </p>
                </div>
              )}
            </div>

            {editingEducation && (
              <div>
                <label className={labelClass}>{t("education.orderPosition")}</label>
                <select
                  value={formData.order}
                  onChange={async (e) => {
                    const newOrder = parseInt(e.target.value, 10);
                    if (newOrder === formData.order) return;
                    try {
                      setSubmitting(true);
                      setError("");
                      await authenticatedFetch<Education>(
                        `/api/education/${editingEducation.id}`,
                        {
                          method: "PUT",
                          body: JSON.stringify({
                            order: newOrder,
                            shouldSwap: true,
                          }),
                        },
                      );
                      await fetchEducation();
                      setFormData((prev) => ({ ...prev, order: newOrder }));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t("common.error"));
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
                      ...new Set(education.map((e) => e.order)),
                    ].sort((a, b) => a - b);
                    return uniqueOrders.map((position) => {
                      const eduAtPosition = education.find(
                        (e) => e.order === position,
                      );
                      const isCurrent =
                        eduAtPosition?.id === editingEducation.id;
                      return (
                        <option key={position} value={position} className="bg-slate-900 text-slate-200">
                          {t("education.positionLabel")} {position}
                          {eduAtPosition && !isCurrent
                            ? ` – ${eduAtPosition.degree} at ${eduAtPosition.institution}`
                            : isCurrent
                              ? ` (${t("education.currentPosition")})`
                              : ` (${t("education.emptyPosition")})`}
                        </option>
                      );
                    });
                  })()}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                   {t("education.positionHint")}
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
                    <span>{editingEducation ? t("education.update") : t("education.create")}</span>
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
            <AdminTableHead>{t("education.order")}</AdminTableHead>
            <AdminTableHead>{t("education.degreeField")}</AdminTableHead>
            <AdminTableHead>{t("education.institution")}</AdminTableHead>
            <AdminTableHead>{t("education.dates")}</AdminTableHead>
            <AdminTableHead className="text-right">{t("common.actions")}</AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
             {sortedEducation.length === 0 ? (
                <AdminTableRow>
                <AdminTableCell colSpan={5} className="text-center py-12 text-slate-500">
                  {t("education.empty")}
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              sortedEducation.map((edu, index) => {
                const canMoveUp = index > 0;
                const canMoveDown = index < sortedEducation.length - 1;
                const start = edu.startDate
                  ? new Date(edu.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })
                  : "";
                const end = edu.current
                  ? t("common.present")
                  : edu.endDate
                    ? new Date(edu.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })
                    : "";
                return (
                  <AdminTableRow key={edu.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs font-mono w-6 text-center bg-white/[0.05] rounded py-1">
                            {edu.order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleReorder(edu.id, "up")}
                            disabled={!canMoveUp || reordering === edu.id}
                             className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("education.moveUp")}
                          >
                           <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReorder(edu.id, "down")}
                            disabled={!canMoveDown || reordering === edu.id}
                             className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("education.moveDown")}
                          >
                           <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                       <div>
                           <div className="font-medium text-white flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-cyan-400" />
                              {edu.degree}
                           </div>
                           <div className="text-sm text-slate-400 pl-6">{edu.field}</div>
                           {edu.degreeFr && <div className="text-xs text-slate-600 pl-6 mt-0.5">{edu.degreeFr} - {edu.fieldFr}</div>}
                       </div>
                    </AdminTableCell>
                    <AdminTableCell>
                       <div className="flex items-center gap-2 text-slate-300">
                         <School className="w-4 h-4 text-slate-500" />
                          {edu.institution}
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
                            type="button"
                            onClick={() => handleEdit(edu)}
                            className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                            title={t("education.edit")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(edu.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title={t("education.delete")}
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
