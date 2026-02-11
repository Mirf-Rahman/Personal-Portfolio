"use client";

import { useEffect, useState } from "react";
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
  AdminTableCell 
} from "@/components/ui/admin-table";
import { ShineBorder } from "@/components/ui/shine-border";
import { Pencil, Trash2, ArrowUp, ArrowDown, X, Save, Palette, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = RAW_API_URL.replace(/\/api\/?$/, "") || RAW_API_URL;

interface Skill {
  id: string;
  name: string;
  category: string;
  iconUrl: string | null;
  order: number;
}

export default function SkillsManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "", iconUrl: "", order: 0 });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate next order number when adding a new skill
  useEffect(() => {
    if (isEditing && !editingSkill && skills.length > 0) {
      const maxOrder = Math.max(...skills.map(s => s.order), 0);
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [isEditing, editingSkill, skills]);

  const fetchSkills = async () => {
    try {
      const data = await fetchApi<Skill[]>("/api/skills");
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
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
      const payload = editingSkill 
        ? { name: formData.name, category: formData.category, iconUrl: formData.iconUrl }
        : { name: formData.name, category: formData.category, iconUrl: formData.iconUrl };

      if (editingSkill) {
        await authenticatedFetch<Skill>(`/api/skills/${editingSkill.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await authenticatedFetch<Skill>("/api/skills", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormData({ name: "", category: "", iconUrl: "", order: 0 });
      setIsEditing(false);
      setEditingSkill(null);
      await fetchSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      iconUrl: skill.iconUrl || "",
      order: skill.order,
    });
    setIsEditing(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("skills.confirmDelete"))) return;

    try {
      await authenticatedFetch(`/api/skills/${id}`, {
        method: "DELETE",
      });
      await fetchSkills();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingSkill(null);
    setFormData({ name: "", category: "", iconUrl: "", order: 0 });
    setError("");
  };

  const handleReorder = async (skillId: string, direction: "up" | "down") => {
    if (reordering) return;
    
    setReordering(skillId);
    try {
      const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
      const currentIndex = sortedSkills.findIndex(s => s.id === skillId);
      if (currentIndex === -1) return;
      
      let otherSkillId: string | null = null;
      
      if (direction === "up" && currentIndex > 0) {
        const prevSkill = sortedSkills[currentIndex - 1];
        otherSkillId = prevSkill.id;
      } else if (direction === "down" && currentIndex < sortedSkills.length - 1) {
        const nextSkill = sortedSkills[currentIndex + 1];
        otherSkillId = nextSkill.id;
      }

      if (otherSkillId) {
        await authenticatedFetch("/api/skills/swap-order", {
          method: "POST",
          body: JSON.stringify({
            skillId1: skillId,
            skillId2: otherSkillId,
          }),
        });
      }
      
      await fetchSkills();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setReordering(null);
    }
  };

  const handleAddIcons = async () => {
    try {
      setSubmitting(true);
      const response = await authenticatedFetch<{ message: string; updated: number }>("/api/skills/add-icons", {
        method: "POST",
      });
      alert(`✅ ${response.message}`);
      await fetchSkills();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = () => {
    const maxOrder = skills.length > 0 ? Math.max(...skills.map(s => s.order), 0) : 0;
    setIsEditing(true);
    setEditingSkill(null);
    setFormData({ name: "", category: "", iconUrl: "", order: maxOrder + 1 });
    setError("");
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  // Common input styles
  const inputClass = "w-full pl-4 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass = "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title={t("skills.title")} 
        description={t("skills.description")}
        customAction={
          <div className="flex gap-3">
             <button
              onClick={handleAddIcons}
              disabled={submitting}
              className="px-4 py-2 border border-white/[0.1] bg-white/[0.05] text-slate-300 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              title={t("skills.addIcons")}
            >
              <Palette className="w-4 h-4" /> {t("skills.addIcons")}
            </button>
            <button
              onClick={handleAddSkill}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/20 transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> {t("skills.addNew")}
            </button>
          </div>
        }
      />

      {(isEditing || editingSkill) && (
        <ShineBorder 
          className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
          shineColor={["#f472b6", "#e879f9", "#c084fc"]}
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-display font-bold text-xl text-white">
              {editingSkill ? t("skills.editSkill") : t("skills.addNewSkill")}
            </h3>
            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("skills.name")} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="React"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("skills.category")} *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="Frontend"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("skills.iconUrl")}</label>
              <ImageUpload
                value={formData.iconUrl}
                onChange={(url) => setFormData({ ...formData, iconUrl: url })}
                label={t("skills.iconUrl")}
                accept="image/*"
                maxSize={10}
              />
            </div>

            {editingSkill && (
              <div>
                <label className={labelClass}>{t("skills.position")}</label>
                <select
                  value={formData.order}
                  onChange={async (e) => {
                    const newOrder = parseInt(e.target.value);
                    if (newOrder !== formData.order) {
                      try {
                        setSubmitting(true);
                        await authenticatedFetch(`/api/skills/${editingSkill.id}`, {
                          method: "PUT",
                          body: JSON.stringify({
                            order: newOrder,
                            shouldSwap: true,
                          }),
                        });
                        await fetchSkills();
                        setFormData({ ...formData, order: newOrder });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : t("common.error"));
                        e.target.value = formData.order.toString();
                      } finally {
                        setSubmitting(false);
                      }
                    }
                  }}
                  disabled={submitting}
                  className={cn(inputClass, "disabled:opacity-50")}
                >
                  {(() => {
                    const uniqueOrders = [...new Set(skills.map(s => s.order))].sort((a, b) => a - b);
                    
                    return uniqueOrders.map((position) => {
                      const skillAtPosition = skills.find(s => s.order === position);
                      const isCurrentSkill = skillAtPosition?.id === editingSkill.id;
                      return (
                        <option key={position} value={position} className="bg-slate-900 text-slate-200">
                          {t("skills.positionLabel")} {position}{skillAtPosition && !isCurrentSkill ? ` - ${skillAtPosition.name}` : isCurrentSkill ? ` (${t("skills.current")})` : ` (${t("skills.empty")})`}
                        </option>
                      );
                    });
                  })()}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                  {t("skills.positionHint")}
                </p>
              </div>
            )}

            {!editingSkill && (
               <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-mono">
                    {t("skills.autoOrderHint")} {formData.order}
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
                    <span>{editingSkill ? t("skills.update") : t("skills.create")}</span>
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
            <AdminTableHead>{t("skills.order")}</AdminTableHead>
            <AdminTableHead>{t("skills.name")}</AdminTableHead>
            <AdminTableHead>{t("skills.category")}</AdminTableHead>
            <AdminTableHead className="text-right">{t("common.actions")}</AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
             {skills.length === 0 ? (
               <AdminTableRow>
                <AdminTableCell colSpan={4} className="text-center py-12 text-slate-500">
                  {t("skills.empty")}
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              [...skills].sort((a, b) => a.order - b.order).map((skill, index) => {
                const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
                const canMoveUp = index > 0;
                const canMoveDown = index < sortedSkills.length - 1;
                
                return (
                  <AdminTableRow key={skill.id}>
                    <AdminTableCell>
                       <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs font-mono w-6 text-center bg-white/[0.05] rounded py-1">
                            {skill.order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleReorder(skill.id, "up")}
                            disabled={!canMoveUp || reordering === skill.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("skills.moveUp")}
                          >
                           <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReorder(skill.id, "down")}
                            disabled={!canMoveDown || reordering === skill.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                            title={t("skills.moveDown")}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {skill.iconUrl && (
                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] p-1.5 flex items-center justify-center border border-white/[0.05]">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={skill.iconUrl}
                              alt={skill.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <span className="font-medium text-white">{skill.name}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {skill.category}
                        </span>
                    </AdminTableCell>
                    <AdminTableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(skill)}
                            className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                            title={t("skills.edit")}
                          >
                             <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(skill.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title={t("skills.delete")}
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
