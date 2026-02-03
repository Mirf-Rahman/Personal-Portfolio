"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { FileText, Download, Loader2, Calendar, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

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

interface ActiveResumes {
  en: Resume | null;
  fr: Resume | null;
}

export default function CVPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [activeResumes, setActiveResumes] = useState<ActiveResumes>({
    en: null,
    fr: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    fetchActiveResumes();
  }, []);

  // Watch for locale changes and trigger re-render
  useEffect(() => {
    if (locale !== currentLocale) {
      setCurrentLocale(locale);
    }
  }, [locale, currentLocale]);

  const fetchActiveResumes = async () => {
    try {
      const data = await fetchApi<ActiveResumes>("/api/resumes?active=true");
      setActiveResumes(data);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError("Failed to load resumes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (resume: Resume) => {
    const link = document.createElement("a");
    link.href = resume.fileUrl;
    link.download = `MirFaiyazurRahman_Resume_${resume.language.toUpperCase()}_v${resume.version}.pdf`;
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
    return new Date(dateString).toLocaleDateString(currentLocale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentResume = activeResumes[currentLocale === "fr" ? "fr" : "en"];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400">
            {currentLocale === "fr" ? "Chargement du CV..." : "Loading resume..."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <FileText className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentLocale === "fr" ? "Erreur de chargement" : "Error Loading Resume"}
            </h2>
            <p className="text-slate-400">{error}</p>
          </div>
          <button
            onClick={fetchActiveResumes}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/25 font-medium"
          >
            {currentLocale === "fr" ? "Réessayer" : "Try Again"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      {currentResume ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 mx-auto"
            >
              <FileText className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                {currentLocale === "fr" ? "Mon CV" : "My Resume"}
              </h1>
              <p className="text-slate-400 mt-2">
                {currentLocale === "fr"
                  ? "Téléchargez mon curriculum vitae au format PDF"
                  : "Download my curriculum vitae in PDF format"}
              </p>
            </div>
          </div>

          {/* Resume Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex-shrink-0 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {currentLocale === "fr" ? "CV en Français" : "English Resume"}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {currentLocale === "fr" ? "Version" : "Version"} {currentResume.version}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span>{formatFileSize(currentResume.fileSize)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>
                      {currentLocale === "fr" ? "Mis à jour le" : "Updated on"}{" "}
                      {formatDate(currentResume.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(currentResume)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5" />
                {currentLocale === "fr" ? "Télécharger le PDF" : "Download PDF"}
              </button>
            </div>
          </motion.div>

          {/* PDF Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden shadow-2xl"
          >
            <div className="aspect-[8.5/11] w-full bg-gradient-to-br from-slate-900/50 to-slate-800/50">
              <embed
                src={currentResume.fileUrl}
                type="application/pdf"
                className="w-full h-full"
                title={`Resume - ${currentLocale === "fr" ? "FR" : "EN"}`}
              />
            </div>
          </motion.div>

          {/* Mobile Fallback Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="md:hidden p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
          >
            <p className="text-sm text-yellow-200/90 flex items-start gap-2">
              <span className="text-lg">📱</span>
              <span>
                {currentLocale === "fr"
                  ? "Pour une meilleure expérience sur mobile, téléchargez le PDF."
                  : "For the best mobile experience, please download the PDF."}
              </span>
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 space-y-6 max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-12 h-12 text-slate-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentLocale === "fr" ? "CV Non Disponible" : "No Resume Available"}
            </h2>
            <p className="text-slate-400">
              {currentLocale === "fr"
                ? "Le CV en français n'est pas actuellement disponible."
                : "The English resume is not currently available."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
