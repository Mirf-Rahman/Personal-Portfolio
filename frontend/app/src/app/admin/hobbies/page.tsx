"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";

interface Hobby {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  order: number;
}

const emptyForm = {
  name: "",
  description: "",
  iconUrl: "",
  order: 0,
};

export default function HobbiesManagementPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    try {
      const data = await fetchApi<Hobby[]>("/api/hobbies");
      setHobbies(data);
    } catch (err) {
      console.error("Error fetching hobbies:", err);
      setError("Failed to load hobbies. Please refresh the page.");
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
        name: formData.name,
        description: formData.description || null,
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
      setError(err instanceof Error ? err.message : "Failed to save hobby. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hobby: Hobby) => {
    setEditingHobby(hobby);
    setFormData({
      name: hobby.name,
      description: hobby.description || "",
      iconUrl: hobby.iconUrl || "",
      order: hobby.order,
    });
    setIsEditing(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hobby?")) return;
    try {
      await authenticatedFetch(`/api/hobbies/${id}`, { method: "DELETE" });
      await fetchHobbies();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete hobby");
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
    const maxOrder = hobbies.length > 0 ? Math.max(...hobbies.map((h) => h.order), 0) : 0;
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
      alert(err instanceof Error ? err.message : "Failed to reorder hobby");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hobbies Management</h1>
          <p className="text-muted-foreground mt-1">Manage your hobbies and interests</p>
        </div>
        <button
          type="button"
          onClick={handleAddHobby}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          + Add Hobby
        </button>
      </div>

      {(isEditing || editingHobby) && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">
            {editingHobby ? "Edit Hobby" : "Add New Hobby"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Photography"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional short description..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <ImageUpload
                value={formData.iconUrl}
                onChange={(url) => setFormData({ ...formData, iconUrl: url })}
                label="Icon URL"
                accept="image/*"
                maxSize={10}
              />
            </div>
            <div className="flex gap-4 items-center">
              {!editingHobby && (
                <div className="p-3 rounded-md bg-muted/50 border border-muted">
                  <p className="text-sm text-muted-foreground">
                    This hobby will be added at the end (order: {formData.order})
                  </p>
                </div>
              )}
            </div>
            {editingHobby && (
              <div>
                <label className="text-sm font-medium mb-2 block">Position</label>
                <select
                  value={formData.order}
                  onChange={async (e) => {
                    const newOrder = parseInt(e.target.value, 10);
                    if (newOrder === formData.order) return;
                    try {
                      setSubmitting(true);
                      setError("");
                      await authenticatedFetch<Hobby>(`/api/hobbies/${editingHobby.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ order: newOrder, shouldSwap: true }),
                      });
                      await fetchHobbies();
                      setFormData((prev) => ({ ...prev, order: newOrder }));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to update order");
                      e.target.value = String(formData.order);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50"
                >
                  {(() => {
                    const uniqueOrders = [...new Set(hobbies.map((h) => h.order))].sort(
                      (a, b) => a - b
                    );
                    return uniqueOrders.map((position) => {
                      const hobbyAtPosition = hobbies.find((h) => h.order === position);
                      const isCurrent = hobbyAtPosition?.id === editingHobby.id;
                      return (
                        <option key={position} value={position}>
                          Position {position}
                          {hobbyAtPosition && !isCurrent
                            ? ` – ${hobbyAtPosition.name}`
                            : isCurrent
                              ? " (Current)"
                              : " (Empty)"}
                        </option>
                      );
                    });
                  })()}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a position to swap with the hobby currently at that position
                </p>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingHobby ? "Update" : "Create"}</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedHobbies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No hobbies yet. Add your first hobby!
                    </td>
                  </tr>
                ) : (
                  sortedHobbies.map((hobby, index) => {
                    const canMoveUp = index > 0;
                    const canMoveDown = index < sortedHobbies.length - 1;
                    return (
                      <tr key={hobby.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-8">{hobby.order}</span>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleReorder(hobby.id, "up")}
                                disabled={!canMoveUp || reordering === hobby.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
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
                                onClick={() => handleReorder(hobby.id, "down")}
                                disabled={!canMoveDown || reordering === hobby.id}
                                className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
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
                        <td className="px-4 py-3">
                          {hobby.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={hobby.iconUrl}
                              alt={hobby.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{hobby.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm max-w-[200px] truncate">
                          {hobby.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(hobby)}
                            className="text-sm text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(hobby.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            Delete
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
