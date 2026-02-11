"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { SectionHeading } from "@/components/ui/section-heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Quote,
  Send,
  User,
  Briefcase,
  Building2,
  ArrowLeft,
} from "lucide-react";

interface FieldErrors {
  name?: string;
  position?: string;
  company?: string;
  content?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = RAW_API_URL.replace(/\/api\/?$/, "") || RAW_API_URL;

export default function TestimonialsClient() {
  const t = useTranslations("testimonials");
  const router = useRouter();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field length limits
  const LIMITS = {
    name: { min: 2, max: 100 },
    position: { min: 0, max: 100 },
    company: { min: 0, max: 100 },
    content: { min: 10, max: 500 },
  };

  // Validate individual field (uses t from closure for locale-aware messages)
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return t("validation.nameRequired");
        const trimmedName = value.trim();
        if (trimmedName.length < LIMITS.name.min)
          return t("validation.nameMin", { min: LIMITS.name.min });
        if (trimmedName.length > LIMITS.name.max)
          return t("validation.nameMax", { max: LIMITS.name.max });
        if (!/^[\p{L}\p{M}\s\-'\.]+$/u.test(trimmedName))
          return t("validation.nameInvalid");
        return undefined;

      case "position":
        if (value.trim() && value.trim().length > LIMITS.position.max)
          return t("validation.positionMax", { max: LIMITS.position.max });
        return undefined;

      case "company":
        if (value.trim() && value.trim().length > LIMITS.company.max)
          return t("validation.companyMax", { max: LIMITS.company.max });
        return undefined;

      case "content":
        if (!value.trim()) return t("validation.contentRequired");
        const trimmedContent = value.trim();
        if (trimmedContent.length < LIMITS.content.min)
          return t("validation.contentMin", { min: LIMITS.content.min });
        if (trimmedContent.length > LIMITS.content.max)
          return t("validation.contentMax", { max: LIMITS.content.max });
        return undefined;

      default:
        return undefined;
    }
  };

  // Real-time validation effects
  useEffect(() => {
    if (touched.name) {
      const error = validateField("name", name);
      setFieldErrors((prev) =>
        error ? { ...prev, name: error } : { ...prev, name: undefined },
      );
    }
  }, [name, touched.name]);

  useEffect(() => {
    if (touched.position) {
      const error = validateField("position", position);
      setFieldErrors((prev) =>
        error ? { ...prev, position: error } : { ...prev, position: undefined },
      );
    }
  }, [position, touched.position]);

  useEffect(() => {
    if (touched.company) {
      const error = validateField("company", company);
      setFieldErrors((prev) =>
        error ? { ...prev, company: error } : { ...prev, company: undefined },
      );
    }
  }, [company, touched.company]);

  useEffect(() => {
    if (touched.content) {
      const error = validateField("content", content);
      setFieldErrors((prev) =>
        error ? { ...prev, content: error } : { ...prev, content: undefined },
      );
    }
  }, [content, touched.content]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value =
      field === "name"
        ? name
        : field === "position"
          ? position
          : field === "company"
            ? company
            : content;
    const error = validateField(field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (error) updated[field as keyof FieldErrors] = error;
      else delete updated[field as keyof FieldErrors];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    setTouched({ name: true, position: true, company: true, content: true });

    const errors: FieldErrors = {};
    const nameError = validateField("name", name);
    const positionError = validateField("position", position);
    const companyError = validateField("company", company);
    const contentError = validateField("content", content);

    if (nameError) errors.name = nameError;
    if (positionError) errors.position = positionError;
    if (companyError) errors.company = companyError;
    if (contentError) errors.content = contentError;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          position: position.trim() || null,
          company: company.trim() || null,
          content: content.trim(),
        }),
      });

      const contentType = res.headers.get("content-type");
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Server error (${res.status}): ${text || "Unexpected response format"}`,
        );
      }

      if (!res.ok) {
        if (data.code === "VALIDATION_ERROR" && data.details) {
          const serverErrors: FieldErrors = {};
          (data.details as ValidationError[]).forEach((err) => {
            serverErrors[err.field as keyof FieldErrors] = err.message;
          });
          setFieldErrors(serverErrors);
          setError(t("validation.fixErrors"));
        } else if (data.code === "RATE_LIMIT_EXCEEDED") {
          setError(t("validation.rateLimit"));
        } else {
          setError(data.error || t("validation.submitFailed"));
        }
        return;
      }

      setSuccess(true);
      setName("");
      setPosition("");
      setCompany("");
      setContent("");
      setFieldErrors({});
      setTouched({});
    } catch (err) {
      setError(err instanceof Error ? err.message : t("validation.generic"));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim() && content.trim() && Object.keys(fieldErrors).length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Global Background Layers */}
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

      {/* Hero Section */}
      <section className="relative h-[35vh] min-h-[300px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <SectionHeading
            title={t("title")}
            description={t("subtitle")}
            icon={Quote}
            gradient="from-cyan-400 via-blue-500 to-purple-500"
          />
        </div>
      </section>

      {/* Back Button */}
      <div className="relative z-10 container mx-auto max-w-3xl px-4 -mt-8 mb-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => router.push("/#testimonials")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("backToTestimonials")}</span>
        </motion.button>
      </div>

      {/* Form Section */}
      <section className="relative w-full pb-24 px-4 overflow-hidden z-10">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group"
          >
            {/* Decorative Backgrounds */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

            {success ? (
              <div className="text-center py-16 relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mx-auto mb-8 flex items-center justify-center shadow-lg shadow-green-500/10"
                >
                  <Send className="w-10 h-10 text-green-400" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {t("success.title")}
                </h3>
                <p className="text-slate-300 text-lg mb-10 max-w-md mx-auto">
                  {t("success.message")}
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  {t("success.another")}
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-8 relative z-10"
                noValidate
              >
                {/* Personal Info Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="name"
                      className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1 flex items-center gap-2"
                    >
                      <User className="w-3 h-3" /> {t("form.name")}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur("name")}
                      required
                      placeholder={t("form.namePlaceholder")}
                      maxLength={LIMITS.name.max}
                      className={`h-12 bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all rounded-xl ${
                        fieldErrors.name
                          ? "border-red-500/50 focus:border-red-500/50"
                          : ""
                      }`}
                    />
                    <div className="flex justify-between items-center">
                      {fieldErrors.name ? (
                        <p className="text-xs text-red-400 pl-1">
                          {fieldErrors.name}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-[10px] text-slate-600 font-mono">
                        {name.length}/{LIMITS.name.max}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="company"
                      className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1 flex items-center gap-2"
                    >
                      <Building2 className="w-3 h-3" /> {t("form.company")}
                    </Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      onBlur={() => handleBlur("company")}
                      placeholder={t("form.companyPlaceholder")}
                      maxLength={LIMITS.company.max}
                      className="h-12 bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all rounded-xl"
                    />
                    <div className="flex justify-between items-center">
                      {fieldErrors.company ? (
                        <p className="text-xs text-red-400 pl-1">
                          {fieldErrors.company}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-[10px] text-slate-600 font-mono">
                        {company.length}/{LIMITS.company.max}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="position"
                    className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1 flex items-center gap-2"
                  >
                    <Briefcase className="w-3 h-3" /> {t("form.position")}
                  </Label>
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    onBlur={() => handleBlur("position")}
                    placeholder={t("form.positionPlaceholder")}
                    maxLength={LIMITS.position.max}
                    className="h-12 bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all rounded-xl"
                  />
                  <div className="flex justify-between items-center">
                    {fieldErrors.position ? (
                      <p className="text-xs text-red-400 pl-1">
                        {fieldErrors.position}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[10px] text-slate-600 font-mono">
                      {position.length}/{LIMITS.position.max}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="content"
                    className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1 flex items-center gap-2"
                  >
                    <Quote className="w-3 h-3" /> {t("form.content")}
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => handleBlur("content")}
                    required
                    placeholder={t("form.contentPlaceholder")}
                    maxLength={LIMITS.content.max}
                    className={`min-h-[180px] bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all resize-y rounded-xl p-4 leading-relaxed ${
                      fieldErrors.content
                        ? "border-red-500/50 focus:border-red-500/50"
                        : ""
                    }`}
                  />
                  <div className="flex justify-between px-1">
                    {fieldErrors.content ? (
                      <p className="text-xs text-red-400">
                        {fieldErrors.content}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[10px] text-slate-600 font-mono">
                      {content.length}/{LIMITS.content.max}
                    </span>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-2"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg font-medium rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("form.submitting")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("form.submit")}
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
