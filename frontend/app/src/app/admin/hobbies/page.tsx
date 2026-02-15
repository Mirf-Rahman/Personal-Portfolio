"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
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
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Hobby {
  id: string;
  name: string;
  nameFr: string | null;
  description: string | null;
  descriptionFr: string | null;
  iconUrl: string | null;
  order: number;
}

const emptyForm = {
  name: "",
  nameFr: "",
  description: "",
  descriptionFr: "",
  iconUrl: "",
  order: 0,
};

export default function HobbiesManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  const fetchHobbies = useCallback(async () => {
    try {
      const data = await fetchApi<Hobby[]>("/api/hobbies");
      setHobbies(data);
    } catch (err) {
      console.error("Error fetching hobbies:", err);
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchHobbies();
  }, [fetchHobbies]);

  // Auto-scroll to edit form when editing starts
  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        nameFr: formData.nameFr || null,
        description: formData.description || null,
        descriptionFr: formData.descriptionFr || null,
        iconUrl: formData.iconUrl || null,
      };

      if (editingHobby) {
        await authenticatedFetch<Hobby>(`/api/hobbies/${editingHobby.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await authenticatedFetch<Hobby>("/api/hobbies", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormData(emptyForm);
      setIsEditing(false);
      setEditingHobby(null);
      await fetchHobbies();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hobby: Hobby) => {
    setEditingHobby(hobby);
    setFormData({
      name: hobby.name,
      nameFr: hobby.nameFr || "",
      description: hobby.description || "",
      descriptionFr: hobby.descriptionFr || "",
      iconUrl: hobby.iconUrl || "",
      order: hobby.order,
    });
    setIsEditing(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("hobbies.confirmDelete"))) return;
    try {
      await authenticatedFetch(`/api/hobbies/${id}`, { method: "DELETE" });
      await fetchHobbies();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingHobby(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleAddHobby = () => {
    setEditingHobby(null);
    const maxOrder =
      hobbies.length > 0 ? Math.max(...hobbies.map((h) => h.order), 0) : 0;
    setFormData({ ...emptyForm, order: maxOrder + 1 });
    setIsEditing(true);
    setError("");
  };

  const handleReorder = async (hobbyId: string, direction: "up" | "down") => {
    if (reordering) return;
    setReordering(hobbyId);
    try {
      const sorted = [...hobbies].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((h) => h.id === hobbyId);
      if (idx < 0) return;
      const other = direction === "up" ? sorted[idx - 1] : sorted[idx + 1];
      if (!other) return;
      await authenticatedFetch("/api/hobbies/swap-order", {
        method: "POST",
        body: JSON.stringify({ hobbyId1: hobbyId, hobbyId2: other.id }),
      });
      await fetchHobbies();
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

  const sortedHobbies = [...hobbies].sort((a, b) => a.order - b.order);

  // Common input styles
  const inputClass =
    "w-full pl-4 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass =
    "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("hobbies.title")}
        description={t("hobbies.description")}
        customAction={
          <button
            type="button"
            onClick={handleAddHobby}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/20 transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> {t("hobbies.addNew")}
          </button>
        }
      />

      {(isEditing || editingHobby) && (
        <ShineBorder
          className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
          shineColor={["#f472b6", "#e879f9", "#c084fc"]}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl text-white">
              {editingHobby ? t("hobbies.editHobby") : t("hobbies.addNewHobby")}
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>{t("hobbies.name")} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g. Photography"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("hobbies.nameFrLabel")}</label>
              <input
                type="text"
                value={formData.nameFr}
                onChange={(e) =>
                  setFormData({ ...formData, nameFr: e.target.value })
                }
                placeholder={t("hobbies.nameFrPlaceholder")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("hobbies.hobbyDescription")}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional short description..."
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("hobbies.descriptionFrLabel")}
              </label>
              <textarea
                value={formData.descriptionFr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionFr: e.target.value })
                }
                placeholder={t("hobbies.descriptionFrPlaceholder")}
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("hobbies.iconUrl")}</label>
              <ImageUpload
                value={formData.iconUrl}
                onChange={(url) => setFormData({ ...formData, iconUrl: url })}
                label={t("hobbies.iconUrl")}
                accept="image/*"
                maxSize={10}
              />
            </div>

            <div className="flex gap-4 items-center">
              {!editingHobby && (
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-mono">
                    {t("hobbies.autoOrderHint")} {formData.order}
                  </p>
                </div>
              )}
            </div>

            {editingHobby && (
              <div>
                <label className={labelClass}>{t("hobbies.position")}</label>
                <select
                  value={formData.order}
                  onChange={async (e) => {
                    const newOrder = parseInt(e.target.value, 10);
                    if (newOrder === formData.order) return;
                    try {
                      setSubmitting(true);
                      setError("");
                      await authenticatedFetch<Hobby>(
                        `/api/hobbies/${editingHobby.id}`,
                        {
                          method: "PUT",
                          body: JSON.stringify({
                            order: newOrder,
                            shouldSwap: true,
                          }),
                        },
                      );
                      await fetchHobbies();
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
                      ...new Set(hobbies.map((h) => h.order)),
                    ].sort((a, b) => a - b);
                    return uniqueOrders.map((position) => {
                      const hobbyAtPosition = hobbies.find(
                        (h) => h.order === position,
                      );
                      const isCurrent = hobbyAtPosition?.id === editingHobby.id;
                      return (
                        <option
                          key={position}
                          value={position}
                          className="bg-slate-900 text-slate-200"
                        >
                          {t("hobbies.positionLabel")} {position}
                          {hobbyAtPosition && !isCurrent
                            ? ` – ${hobbyAtPosition.name}`
                            : isCurrent
                              ? ` (${t("hobbies.current")})`
                              : ` (${t("hobbies.emptyPosition")})`}
                        </option>
                      );
                    });
                  })()}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                  {t("hobbies.positionHint")}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <p>{error}</p>
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
                      {editingHobby ? t("hobbies.update") : t("hobbies.create")}
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
            <AdminTableHead>{t("hobbies.order")}</AdminTableHead>
            <AdminTableHead>{t("hobbies.icon")}</AdminTableHead>
            <AdminTableHead>{t("hobbies.name")}</AdminTableHead>
            <AdminTableHead>{t("hobbies.hobbyDescription")}</AdminTableHead>
            <AdminTableHead className="text-right">
              {t("common.actions")}
            </AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
            {sortedHobbies.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {t("hobbies.empty")}
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              sortedHobbies.map((hobby, index) => {
                const canMoveUp = index > 0;
                const canMoveDown = index < sortedHobbies.length - 1;
                return (
                  <AdminTableRow key={hobby.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs font-mono w-6 text-center bg-white/[0.05] rounded py-1">
                          {hobby.order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleReorder(hobby.id, "up")}
                            disabled={!canMoveUp || reordering === hobby.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("hobbies.moveUp")}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(hobby.id, "down")}
                            disabled={!canMoveDown || reordering === hobby.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("hobbies.moveDown")}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      {hobby.iconUrl ? (
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] p-1.5 flex items-center justify-center border border-white/[0.05]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={hobby.iconUrl}
                            alt={hobby.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="font-medium text-white">
                        {hobby.name}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-slate-400 text-sm max-w-[200px] truncate block">
                        {hobby.description || "—"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(hobby)}
                          className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                          title={t("hobbies.edit")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(hobby.id)}
                          className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title={t("hobbies.delete")}
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
