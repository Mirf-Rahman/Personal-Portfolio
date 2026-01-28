"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";

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
  }, []);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const sortedExperiences = [...experiences].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("experience.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("experience.description")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddExperience}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          + {t("experience.addNew")}
        </button>
      </div>

      {(isEditing || editingExperience) && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">
            {editingExperience
              ? t("experience.editExperience")
              : t("experience.addNewExperience")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("experience.company")} *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                  placeholder="Acme Inc."
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("experience.position")} *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                  placeholder="Software Developer"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("experience.experienceDescription")} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                placeholder={t("experience.descriptionPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("experience.positionFr")}
                </label>
                <input
                  type="text"
                  value={formData.positionFr}
                  onChange={(e) =>
                    setFormData({ ...formData, positionFr: e.target.value })
                  }
                  placeholder={t("experience.positionFr")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("experience.descriptionFr")}
                </label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionFr: e.target.value })
                  }
                  placeholder={t("experience.descriptionFr")}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("experience.location")} *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
                placeholder="Montreal, QC"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("experience.startDate")} *
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
                  {t("experience.endDate")}
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
                  {t("experience.currentRole")}
                </label>
              </div>
              {!editingExperience && (
                <div className="p-3 rounded-md bg-muted/50 border border-muted">
                  <p className="text-sm text-muted-foreground">
                    {t("experience.autoOrderHint")} {formData.order})
                  </p>
                </div>
              )}
            </div>
            {editingExperience && (
              <div>
                <label className="text-sm font-medium mb-2 block">
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
                  className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50"
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
                        <option key={position} value={position}>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {t("experience.positionHint")}
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
                    {editingExperience
                      ? t("experience.update")
                      : t("experience.create")}
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
                    {t("experience.order")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("experience.position")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("experience.company")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("experience.location")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("experience.dates")}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedExperiences.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("experience.empty")}
                    </td>
                  </tr>
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
                      <tr key={exp.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-8">
                              {exp.order}
                            </span>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleReorder(exp.id, "up")}
                                disabled={!canMoveUp || reordering === exp.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("experience.moveUp")}
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
                                onClick={() => handleReorder(exp.id, "down")}
                                disabled={!canMoveDown || reordering === exp.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("experience.moveDown")}
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
                          {exp.position}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {exp.company}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {exp.location}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {start} – {end}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(exp)}
                            className="text-sm text-primary hover:underline"
                          >
                            {t("experience.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            {t("experience.delete")}
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
