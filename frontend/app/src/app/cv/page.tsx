"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchApi } from "@/lib/api";
import { FileText, Download, Loader2, Calendar, HardDrive, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";

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
  const locale = useLocale();
  const [activeResumes, setActiveResumes] = useState<ActiveResumes>({
    en: null,
    fr: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchActiveResumes();
  }, []);

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

  const handleDownload = async (resume: Resume) => {
    try {
      console.log("Starting download for resume:", resume.id);
      
      const cleanName = locale === "fr" ? "CV_FR.pdf" : "Resume_EN.pdf";
      
      // Use backend proxy - no CORS issues!
      const downloadUrl = `/api/resumes/download/${resume.id}?filename=${encodeURIComponent(cleanName)}`;
      console.log("Download URL:", downloadUrl);
      
      const response = await fetch(downloadUrl);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      console.log("Blob received, size:", blob.size);
      
      // Create a download link with clean filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = cleanName;
      link.style.display = "none";
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log("Download initiated successfully with filename:", cleanName);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      console.log("Falling back to opening in new tab");
      window.open(resume.fileUrl, "_blank");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentResume = activeResumes[locale === "fr" ? "fr" : "en"];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Background Layers */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <StarsBackground className="absolute inset-0 opacity-50" />
          <ShootingStars
            className="absolute inset-0"
            minDelay={2000}
            maxDelay={5000}
            starColor="#22d3ee"
            trailColor="#0f172a"
          />
          <BackgroundPaths />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 z-10"
        >
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400">
            {locale === "fr" ? "Chargement du CV..." : "Loading resume..."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Background Layers */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <StarsBackground className="absolute inset-0 opacity-50" />
          <ShootingStars
            className="absolute inset-0"
            minDelay={2000}
            maxDelay={5000}
            starColor="#22d3ee"
            trailColor="#0f172a"
          />
          <BackgroundPaths />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto z-10 px-4"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <FileText className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {locale === "fr" ? "Erreur de chargement" : "Error Loading Resume"}
            </h2>
            <p className="text-slate-400">{error}</p>
          </div>
          <button
            onClick={fetchActiveResumes}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/25 font-medium"
          >
            {locale === "fr" ? "Réessayer" : "Try Again"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Global Background Layers - NO FloatingParticles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <StarsBackground className="absolute inset-0 opacity-50" />
        <ShootingStars
          className="absolute inset-0"
          minDelay={2000}
          maxDelay={5000}
          starColor="#22d3ee"
          trailColor="#0f172a"
        />
        <BackgroundPaths />
      </div>

      {/* Hero Section - Redesigned with icon on LEFT */}
      <section className="relative h-[40vh] min-h-[350px] w-full flex flex-col items-center justify-center overflow-hidden py-8">
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center gap-4 md:gap-6 max-w-4xl w-full"
          >
            {/* Icon on the LEFT */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/30 flex items-center justify-center shadow-2xl shadow-cyan-500/20"
            >
              <FileText className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
            </motion.div>
            
            {/* Title and subtitle */}
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                {locale === "fr" ? "Mon CV" : "My Resume"}
              </h1>
              <p className="text-slate-400 text-sm md:text-base lg:text-lg mt-2">
                {locale === "fr"
                  ? "Téléchargez mon curriculum vitae au format PDF"
                  : "Download my curriculum vitae in PDF format"}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative w-full py-12 px-4 z-10">
        <div className="container mx-auto max-w-4xl">
          {currentResume ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Resume Info Card */}
              <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                {/* Glossy gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex-shrink-0 flex items-center justify-center">
                        <FileText className="w-6 h-6 md:w-7 md:h-7 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white">
                          {locale === "fr" ? "CV en Français" : "English Resume"}
                        </h2>
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
                          {locale === "fr" ? "Mis à jour le" : "Updated on"}{" "}
                          {formatDate(currentResume.uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 rounded-xl font-medium transition-all"
                    >
                      <Eye className="w-5 h-5" />
                      {showPreview 
                        ? (locale === "fr" ? "Masquer" : "Hide")
                        : (locale === "fr" ? "Aperçu" : "Preview")}
                    </button>
                    <button
                      onClick={() => handleDownload(currentResume)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      {locale === "fr" ? "Télécharger" : "Download"}
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF Preview - Cleaner with iframe instead of embed */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-cyan-400" />
                        {locale === "fr" ? "Aperçu du PDF" : "PDF Preview"}
                      </h3>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Cleaner PDF viewer without Adobe controls */}
                    <div className="w-full" style={{ height: "80vh" }}>
                      <iframe
                        src={`${currentResume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full"
                        title={locale === "fr" ? "Aperçu du CV" : "Resume Preview"}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Fallback Message */}
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="md:hidden p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
                >
                  <p className="text-sm text-yellow-200/90 flex items-start gap-2">
                    <span className="text-lg">📱</span>
                    <span>
                      {locale === "fr"
                        ? "Pour une meilleure expérience sur mobile, téléchargez le PDF."
                        : "For the best mobile experience, please download the PDF."}
                    </span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 space-y-6"
            >
              <div className="w-24 h-24 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-12 h-12 text-slate-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {locale === "fr" ? "CV Non Disponible" : "No Resume Available"}
                </h2>
                <p className="text-slate-400">
                  {locale === "fr"
                    ? "Le CV en français n'est pas actuellement disponible."
                    : "The English resume is not currently available."}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
