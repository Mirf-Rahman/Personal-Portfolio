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
import { Pencil, Trash2, ArrowUp, ArrowDown, X, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  titleFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  technologies: string[];
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  order: number;
}

const emptyForm = {
  title: "",
  titleFr: "",
  description: "",
  descriptionFr: "",
  technologies: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  order: 0,
};

export default function ProjectsManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const fetchProjects = async () => {
    try {
      const data = await fetchApi<Project[]>("/api/projects");
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const technologies = formData.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean);
      const payload = {
        title: formData.title,
        titleFr: formData.titleFr || null,
        description: formData.description,
        descriptionFr: formData.descriptionFr || null,
        technologies,
        imageUrl: formData.imageUrl || null,
        liveUrl: formData.liveUrl || null,
        githubUrl: formData.githubUrl || null,
        featured: formData.featured,
      };

      if (editingProject) {
        await authenticatedFetch<Project>(
          `/api/projects/${editingProject.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
      } else {
        await authenticatedFetch<Project>("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormData(emptyForm);
      setIsEditing(false);
      setEditingProject(null);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      titleFr: project.titleFr ?? "",
      description: project.description,
      descriptionFr: project.descriptionFr ?? "",
      technologies: project.technologies.join(", "),
      imageUrl: project.imageUrl || "",
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      featured: project.featured,
      order: project.order,
    });
    setIsEditing(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("projects.confirmDelete"))) return;
    try {
      await authenticatedFetch(`/api/projects/${id}`, { method: "DELETE" });
      await fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingProject(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleAddProject = () => {
    setEditingProject(null);
    const maxOrder =
      projects.length > 0 ? Math.max(...projects.map((p) => p.order), 0) : 0;
    setFormData({ ...emptyForm, order: maxOrder + 1 });
    setIsEditing(true);
    setError("");
  };

  const handleReorder = async (projectId: string, direction: "up" | "down") => {
    if (reordering) return;
    setReordering(projectId);
    try {
      const sorted = [...projects].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((p) => p.id === projectId);
      if (idx < 0) return;
      const other = direction === "up" ? sorted[idx - 1] : sorted[idx + 1];
      if (!other) return;
      await authenticatedFetch("/api/projects/swap-order", {
        method: "POST",
        body: JSON.stringify({ projectId1: projectId, projectId2: other.id }),
      });
      await fetchProjects();
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

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  // Common input styles
  const inputClass = "w-full pl-4 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass = "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title={t("projects.title")} 
        description={t("projects.description")}
        customAction={
          <button
            onClick={handleAddProject}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/20 transition-all text-sm font-semibold"
          >
            <span className="text-lg leading-none">+</span> {t("projects.addNew")}
          </button>
        }
      />

      {(isEditing || editingProject) && (
        <ShineBorder 
          className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
          shineColor={["#f472b6", "#e879f9", "#c084fc"]}
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-display font-bold text-xl text-white">
              {editingProject ? t("projects.editProject") : t("projects.addNewProject")}
            </h3>
            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("projects.titleLabel")} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={t("projects.titlePlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("projects.technologies")} *</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  required
                  placeholder="React, TypeScript, TailwindCSS"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("projects.projectDescription")} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder={t("projects.descriptionPlaceholder")}
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("projects.titleFrLabel")}</label>
                <input
                  type="text"
                  value={formData.titleFr}
                  onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                  placeholder={t("projects.titleFrPlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("projects.descriptionFrLabel")}</label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                  placeholder={t("projects.descriptionFrPlaceholder")}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>{t("projects.imageUrl")}</label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  label={t("projects.imageUrl")}
                  accept="image/*"
                  maxSize={10}
                />
              </div>
              <div>
                <label className={labelClass}>{t("projects.liveUrl")}</label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("projects.githubUrl")}</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-6 items-center pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-sm font-medium text-slate-300">{t("projects.featured")}</span>
              </label>

               {!editingProject && (
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-mono">
                    {t("projects.autoOrderHint")} {formData.order})
                  </p>
                </div>
              )}
            </div>

             {editingProject && (
              <div>
                <label className={labelClass}>{t("projects.position")}</label>
                <select
                  value={formData.order}
                  onChange={async (e) => {
                    const newOrder = parseInt(e.target.value, 10);
                    if (newOrder === formData.order) return;
                    try {
                      setSubmitting(true);
                      setError("");
                      await authenticatedFetch<Project>(
                        `/api/projects/${editingProject.id}`,
                        {
                          method: "PUT",
                          body: JSON.stringify({
                            order: newOrder,
                            shouldSwap: true,
                          }),
                        },
                      );
                      await fetchProjects();
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
                    const uniqueOrders = [...new Set(projects.map((p) => p.order))].sort((a, b) => a - b);
                    return uniqueOrders.map((position) => {
                      const projectAtPosition = projects.find((p) => p.order === position);
                      const isCurrent = projectAtPosition?.id === editingProject.id;
                      return (
                        <option key={position} value={position} className="bg-slate-900 text-slate-200">
                          {t("projects.positionLabel")} {position}
                          {projectAtPosition && !isCurrent
                            ? ` – ${projectAtPosition.title}`
                            : isCurrent
                              ? ` (${t("projects.current")})`
                              : ` (${t("projects.emptyPosition")})`}
                        </option>
                      );
                    });
                  })()}
                </select>
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
                    <span>{editingProject ? t("projects.update") : t("projects.create")}</span>
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
            <AdminTableHead>{t("projects.order")}</AdminTableHead>
            <AdminTableHead>{t("projects.titleLabel")}</AdminTableHead>
            <AdminTableHead>{t("projects.technologies")}</AdminTableHead>
            <AdminTableHead className="text-center">{t("projects.featured")}</AdminTableHead>
            <AdminTableHead className="text-right">{t("common.actions")}</AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
            {sortedProjects.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell className="text-center py-12 text-slate-500" colSpan={5}>
                   {t("projects.empty")}
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              sortedProjects.map((project, index) => {
                const canMoveUp = index > 0;
                const canMoveDown = index < sortedProjects.length - 1;
                return (
                  <AdminTableRow key={project.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs font-mono w-6 text-center bg-white/[0.05] rounded py-1">
                          {project.order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleReorder(project.id, "up")}
                            disabled={!canMoveUp || reordering === project.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(project.id, "down")}
                            disabled={!canMoveDown || reordering === project.id}
                            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-400 rounded transition-colors disabled:opacity-20"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                        <div className="font-medium text-white">{project.title}</div>
                        {project.titleFr && <div className="text-xs text-slate-500 mt-0.5">{project.titleFr}</div>}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-1">
                         {project.technologies.slice(0, 3).map(tech => (
                             <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.05] text-slate-400">
                                 {tech}
                             </span>
                         ))}
                         {project.technologies.length > 3 && (
                             <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-500">+{project.technologies.length - 3}</span>
                         )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      {project.featured && (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400">
                              <Check className="w-3.5 h-3.5" />
                          </div>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                            title={t("projects.edit")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title={t("projects.delete")}
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
