"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";

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

  useEffect(() => {
    fetchProjects();
  }, []);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("projects.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("projects.description")}
          </p>
        </div>
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          + {t("projects.addNew")}
        </button>
      </div>

      {(isEditing || editingProject) && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">
            {editingProject
              ? t("projects.editProject")
              : t("projects.addNewProject")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.titleLabel")} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder={t("projects.titlePlaceholder")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.technologies")} *
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) =>
                    setFormData({ ...formData, technologies: e.target.value })
                  }
                  required
                  placeholder="React, TypeScript, TailwindCSS"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("projects.projectDescription")} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                placeholder={t("projects.descriptionPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.titleFr")}
                </label>
                <input
                  type="text"
                  value={formData.titleFr}
                  onChange={(e) =>
                    setFormData({ ...formData, titleFr: e.target.value })
                  }
                  placeholder={t("projects.titleFr")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.descriptionFr")}
                </label>
                <textarea
                  value={formData.descriptionFr}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionFr: e.target.value })
                  }
                  placeholder={t("projects.descriptionFr")}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) =>
                    setFormData({ ...formData, imageUrl: url })
                  }
                  label={t("projects.imageUrl")}
                  accept="image/*"
                  maxSize={10}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.liveUrl")}
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.githubUrl")}
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  {t("projects.featured")}
                </label>
              </div>
              {!editingProject && (
                <div className="p-3 rounded-md bg-muted/50 border border-muted">
                  <p className="text-sm text-muted-foreground">
                    {t("projects.autoOrderHint")} {formData.order})
                  </p>
                </div>
              )}
            </div>
            {editingProject && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("projects.position")}
                </label>
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
                      ...new Set(projects.map((p) => p.order)),
                    ].sort((a, b) => a - b);
                    return uniqueOrders.map((position) => {
                      const projectAtPosition = projects.find(
                        (p) => p.order === position,
                      );
                      const isCurrent =
                        projectAtPosition?.id === editingProject.id;
                      return (
                        <option key={position} value={position}>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {t("projects.positionHint")}
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
                  <span>
                    {editingProject
                      ? t("projects.update")
                      : t("projects.create")}
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
                    {t("projects.order")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("projects.titleLabel")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t("projects.technologies")}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    {t("projects.featured")}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedProjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("projects.empty")}
                    </td>
                  </tr>
                ) : (
                  sortedProjects.map((project, index) => {
                    const canMoveUp = index > 0;
                    const canMoveDown = index < sortedProjects.length - 1;
                    return (
                      <tr key={project.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-8">
                              {project.order}
                            </span>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleReorder(project.id, "up")}
                                disabled={
                                  !canMoveUp || reordering === project.id
                                }
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("projects.moveUp")}
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
                                onClick={() =>
                                  handleReorder(project.id, "down")
                                }
                                disabled={
                                  !canMoveDown || reordering === project.id
                                }
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("projects.moveDown")}
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
                          {project.title}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {project.technologies.slice(0, 3).join(", ")}
                          {project.technologies.length > 3 ? "..." : ""}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {project.featured ? "✓" : ""}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(project)}
                            className="text-sm text-primary hover:underline"
                          >
                            {t("projects.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            {t("projects.delete")}
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
