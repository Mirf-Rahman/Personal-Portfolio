"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import PDFUpload from "@/components/PDFUpload";
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
  FileText,
  Trash2,
  Download,
  CheckCircle,
  Circle,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resume {
  id: string;
  fileUrl: string;
  fileName: string;
  language: string;
  isActive: boolean;
  version: number;
  fileSize: number;
  uploadedAt: string;
  updatedAt: string;
}

export default function ResumesManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLanguage, setUploadLanguage] = useState<"en" | "fr">("en");
  const [uploadFileUrl, setUploadFileUrl] = useState("");
  const [setAsActive, setSetAsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await fetchApi<Resume[]>("/api/resumes");
      setResumes(data);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("language", uploadLanguage);
      formData.append("setAsActive", String(setAsActive));

      const response = await authenticatedFetch<Resume>("/api/resumes", {
        method: "POST",
        body: formData,
        isFormData: true,
      });

      // Reset form
      setSelectedFile(null);
      setUploadFileUrl("");
      setSetAsActive(true);
      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetActive = async (id: string) => {
    setActionLoading(id);
    try {
      await authenticatedFetch<Resume>(`/api/resumes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: true }),
      });
      await fetchResumes();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setActionLoading(id);
    try {
      await authenticatedFetch(`/api/resumes/${id}`, { method: "DELETE" });
      await fetchResumes();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const activeResumes = {
    en: resumes.find((r) => r.language === "en" && r.isActive) || null,
    fr: resumes.find((r) => r.language === "fr" && r.isActive) || null,
  };

  const sortedResumes = [...resumes].sort((a, b) => {
    if (a.language !== b.language) {
      return a.language.localeCompare(b.language);
    }
    return b.version - a.version;
  });

  // Common input styles
  const inputClass =
    "w-full pl-4 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass =
    "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Resume Management"
        description="Upload and manage your English and French resume/CV files"
      />

      {/* Upload New Resume */}
      <ShineBorder
        className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
        shineColor={["#06b6d4", "#3b82f6", "#8b5cf6"]}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Upload New Resume
          </h3>
        </div>

        <div className="space-y-6">
          {/* Language Selector */}
          <div>
            <label className={labelClass}>Language *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUploadLanguage("en")}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border transition-all font-medium",
                  uploadLanguage === "en"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                )}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setUploadLanguage("fr")}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border transition-all font-medium",
                  uploadLanguage === "fr"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                )}
              >
                French
              </button>
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <label className={labelClass}>PDF File *</label>
            <div className="p-4 rounded-xl border border-white/[0.08] bg-slate-900/20">
              <PDFUpload
                value={uploadFileUrl}
                onChange={setUploadFileUrl}
                onFileSelect={setSelectedFile}
                label=""
                maxSize={5}
              />
            </div>
          </div>

          {/* Set as Active */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <input
              type="checkbox"
              id="setAsActive"
              checked={setAsActive}
              onChange={(e) => setSetAsActive(e.target.checked)}
              className="w-4 h-4 rounded border-purple-500/50 bg-purple-500/10 checked:bg-purple-500"
            />
            <label
              htmlFor="setAsActive"
              className="text-sm text-purple-300 cursor-pointer flex-1"
            >
              Set as active resume (deactivates previous version for this
              language)
            </label>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </ShineBorder>

      {/* Current Active Resumes */}
      <div>
        <h3 className="font-display font-bold text-lg text-white mb-4">
          Current Active Resumes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Resume */}
          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">EN</span>
              <h4 className="font-semibold text-white">English Resume</h4>
            </div>
            {activeResumes.en ? (
              <div className="space-y-3">
                <div className="aspect-[8.5/11] border border-white/10 rounded-lg overflow-hidden bg-white/5">
                  <embed
                    src={activeResumes.en.fileUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Version {activeResumes.en.version}</div>
                  <div>{formatFileSize(activeResumes.en.fileSize)}</div>
                  <div>{formatDate(activeResumes.en.uploadedAt)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleDownload(
                        activeResumes.en!.fileUrl,
                        activeResumes.en!.fileName
                      )
                    }
                    className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(activeResumes.en!.id)}
                    disabled={actionLoading === activeResumes.en!.id}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active English resume</p>
              </div>
            )}
          </div>

          {/* French Resume */}
          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">FR</span>
              <h4 className="font-semibold text-white">French Resume</h4>
            </div>
            {activeResumes.fr ? (
              <div className="space-y-3">
                <div className="aspect-[8.5/11] border border-white/10 rounded-lg overflow-hidden bg-white/5">
                  <embed
                    src={activeResumes.fr.fileUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Version {activeResumes.fr.version}</div>
                  <div>{formatFileSize(activeResumes.fr.fileSize)}</div>
                  <div>{formatDate(activeResumes.fr.uploadedAt)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleDownload(
                        activeResumes.fr!.fileUrl,
                        activeResumes.fr!.fileName
                      )
                    }
                    className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(activeResumes.fr!.id)}
                    disabled={actionLoading === activeResumes.fr!.id}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active French resume</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume History */}
      <div>
        <h3 className="font-display font-bold text-lg text-white mb-4">
          Resume History
        </h3>
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
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead>Version</AdminTableHead>
              <AdminTableHead>Language</AdminTableHead>
              <AdminTableHead>File Size</AdminTableHead>
              <AdminTableHead>Uploaded</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableHeader>
            <AdminTableBody>
              {sortedResumes.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell
                    colSpan={6}
                    className="text-center py-12 text-slate-500"
                  >
                    No resumes uploaded yet
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                sortedResumes.map((resume) => (
                  <AdminTableRow key={resume.id}>
                    <AdminTableCell>
                      {resume.isActive ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Circle className="w-4 h-4" />
                          <span className="text-xs">Inactive</span>
                        </div>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-slate-300 font-mono text-sm">
                        v{resume.version}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-slate-300">
                        {resume.language === "en" ? "English" : "French"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-slate-400 text-sm">
                        {formatFileSize(resume.fileSize)}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-slate-400 text-sm">
                        {formatDate(resume.uploadedAt)}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex justify-end gap-2">
                        {!resume.isActive && (
                          <button
                            type="button"
                            onClick={() => handleSetActive(resume.id)}
                            disabled={actionLoading === resume.id}
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1"
                            title="Set as Active"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Activate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(resume.fileUrl, resume.fileName)
                          }
                          className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(resume.id)}
                          disabled={actionLoading === resume.id}
                          className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        )}
      </div>
    </div>
  );
}
