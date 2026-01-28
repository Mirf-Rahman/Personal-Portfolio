"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
      const skill = skills.find(s => s.id === skillId);
      if (!skill) return;

      const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
      const currentIndex = sortedSkills.findIndex(s => s.id === skillId);
      
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

  if (isPending || !session) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("skills.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("skills.description")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
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
            }}
            disabled={submitting}
            className="px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title={t("skills.addIcons")}
          >
            🎨 {t("skills.addIcons")}
          </button>
          <button
            onClick={() => {
              const maxOrder = skills.length > 0 ? Math.max(...skills.map(s => s.order), 0) : 0;
              setIsEditing(true);
              setEditingSkill(null);
              setFormData({ name: "", category: "", iconUrl: "", order: maxOrder + 1 });
              setError("");
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
          >
            + {t("skills.addNew")}
          </button>
        </div>
      </div>

      {(isEditing || editingSkill) && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">{editingSkill ? t("skills.editSkill") : t("skills.addNewSkill")}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("skills.name")} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="React"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("skills.category")} *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="Frontend"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div>
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
                <label className="text-sm font-medium mb-2 block">{t("skills.position")}</label>
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
                  className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50"
                >
                  {(() => {
                    const uniqueOrders = [...new Set(skills.map(s => s.order))].sort((a, b) => a - b);
                    
                    return uniqueOrders.map((position) => {
                      const skillAtPosition = skills.find(s => s.order === position);
                      const isCurrentSkill = skillAtPosition?.id === editingSkill.id;
                      return (
                        <option key={position} value={position}>
                          {t("skills.positionLabel")} {position}{skillAtPosition && !isCurrentSkill ? ` - ${skillAtPosition.name}` : isCurrentSkill ? ` (${t("skills.current")})` : ` (${t("skills.empty")})`}
                        </option>
                      );
                    });
                  })()}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("skills.positionHint")}
                </p>
              </div>
            )}
            {!editingSkill && (
              <div className="p-3 rounded-md bg-muted/50 border border-muted">
                <p className="text-sm text-muted-foreground">
                  {t("skills.autoOrderHint")} {formData.order}
                </p>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
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
                  <span>{editingSkill ? t("skills.update") : t("skills.create")}</span>
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
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t("skills.order")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t("skills.name")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t("skills.category")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {skills.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      {t("skills.empty")}
                    </td>
                  </tr>
                ) : (
                  [...skills].sort((a, b) => a.order - b.order).map((skill, index) => {
                    const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
                    const canMoveUp = index > 0;
                    const canMoveDown = index < sortedSkills.length - 1;
                    
                    return (
                      <tr key={skill.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-8">{skill.order}</span>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleReorder(skill.id, "up")}
                                disabled={!canMoveUp || reordering === skill.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("skills.moveUp")}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReorder(skill.id, "down")}
                                disabled={!canMoveDown || reordering === skill.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("skills.moveDown")}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            {skill.iconUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={skill.iconUrl}
                                alt={skill.name}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span>{skill.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{skill.category}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(skill)}
                            className="text-sm text-primary hover:underline"
                          >
                            {t("skills.edit")}
                          </button>
                          <button
                            onClick={() => handleDelete(skill.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            {t("skills.delete")}
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
