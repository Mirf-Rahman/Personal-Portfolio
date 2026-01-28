"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";

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
  const [editingEducation, setEditingEducation] = useState<Education | null>(
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
    fetchEducation();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const sortedEducation = [...education].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("education.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("education.description")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddEducation}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          + {t("education.addNew")}
        </button>
      </div>

      {(isEditing || editingEducation) && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">
            {editingEducation
              ? t("education.editEducation")
              : t("education.addNewEducation")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("education.institution")} *
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) =>
                  setFormData({ ...formData, institution: e.target.value })
                }
                required
                placeholder="University Name"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.degree")} *
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, degree: e.target.value })
                  }
                  required
                  placeholder="Bachelor of Science"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.field")} *
                </label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) =>
                    setFormData({ ...formData, field: e.target.value })
                  }
                  required
                  placeholder="Computer Science"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("education.educationDescription")}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("education.descriptionPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.degreeFr")}
                </label>
                <input
                  type="text"
                  value={formData.degreeFr}
                  onChange={(e) =>
                    setFormData({ ...formData, degreeFr: e.target.value })
                  }
                  placeholder={t("education.degreeFr")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.fieldFr")}
                </label>
                <input
                  type="text"
                  value={formData.fieldFr}
                  onChange={(e) =>
                    setFormData({ ...formData, fieldFr: e.target.value })
                  }
                  placeholder={t("education.fieldFr")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  {t("education.descriptionFr")}
                </label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionFr: e.target.value })
                  }
                  placeholder={t("education.descriptionFr")}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.startDate")} *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.endDate")}
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  disabled={formData.current}
                  className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
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
                  className="w-4 h-4"
                />
                <label htmlFor="current" className="text-sm font-medium">
                  {t("education.currentlyStudying")}
                </label>
              </div>
              {!editingEducation && (
                <div className="p-3 rounded-md bg-muted/50 border border-muted">
                  <p className="text-sm text-muted-foreground">
                    {t("education.autoOrderHint")} {formData.order})
                  </p>
                </div>
              )}
            </div>
            {editingEducation && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("education.orderPosition")}
                </label>
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
                      setError(
                        err instanceof Error ? err.message : t("common.error"),
                      );
                      e.target.value = String(formData.order);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50"
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
                        <option key={position} value={position}>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {t("education.positionHint")}
                </p>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    <span>{t("common.saving")}</span>
                  </>
                ) : (
                  <span>
                    {editingEducation
                      ? t("education.update")
                      : t("education.create")}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("education.order")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("education.degreeField")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("education.institution")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("education.dates")}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedEducation.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("education.empty")}
                    </td>
                  </tr>
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
                      <tr key={edu.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-8">
                              {edu.order}
                            </span>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleReorder(edu.id, "up")}
                                disabled={!canMoveUp || reordering === edu.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("education.moveUp")}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReorder(edu.id, "down")}
                                disabled={!canMoveDown || reordering === edu.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("education.moveDown")}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {edu.degree} in {edu.field}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {edu.institution}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {start} – {end}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(edu)}
                            className="text-sm text-primary hover:underline"
                          >
                            {t("education.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(edu.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            {t("education.delete")}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
