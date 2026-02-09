"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch, fetchApi } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import { AdminPageHeader } from "@/components/ui/admin-page-header";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  Mail,
  Linkedin,
  Github,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactInfo {
  id: string;
  email: string;
  linkedIn: string;
  github: string;
  photoUrl: string | null;
  updatedAt: string;
}

const defaultContact: ContactInfo = {
  id: "",
  email: "",
  linkedIn: "",
  github: "",
  photoUrl: null,
  updatedAt: "",
};

export default function ContactInfoManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [data, setData] = useState<ContactInfo | null>(null);
  const [form, setForm] = useState<ContactInfo>(defaultContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    loadContactInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadContactInfo = async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi<ContactInfo | null>("/api/contact-info");
      const info = res ?? defaultContact;
      setData(res ?? null);
      setForm({
        id: info.id ?? "",
        email: info.email ?? "",
        linkedIn: info.linkedIn ?? "",
        github: info.github ?? "",
        photoUrl: info.photoUrl ?? null,
        updatedAt: info.updatedAt ?? "",
      });
    } catch (err) {
      console.error("Error loading contact info:", err);
      setError(t("contactInfo.loadError"));
      setForm(defaultContact);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.email.trim()) {
      setError(t("contactInfo.emailRequired"));
      return;
    }
    setSaving(true);
    try {
      await authenticatedFetch("/api/contact-info", {
        method: "PATCH",
        body: JSON.stringify({
          email: form.email.trim(),
          linkedIn: form.linkedIn.trim() || null,
          github: form.github.trim() || null,
          photoUrl: form.photoUrl?.trim() || null,
        }),
      });
      setSuccess(true);
      await loadContactInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  // Common input styles
  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner hover:border-white/[0.12] hover:bg-slate-900/60";
  const labelClass =
    "block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono mb-2";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <AdminPageHeader
        title={t("contactInfo.title")}
        description={t("contactInfo.description")}
        // No create action needed
      />

      {loading ? (
        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-8 animate-pulse space-y-8">
          <div className="space-y-4">
            <div className="h-4 bg-white/5 rounded w-1/4"></div>
            <div className="h-10 bg-white/5 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-10 bg-white/5 rounded"></div>
            <div className="h-10 bg-white/5 rounded"></div>
          </div>
          <div className="h-10 bg-white/5 rounded w-1/3"></div>
        </div>
      ) : (
        <ShineBorder
          className="relative w-full rounded-2xl bg-black/20 border border-white/[0.08] backdrop-blur-xl p-8"
          shineColor={["#22d3ee", "#38bdf8", "#818cf8"]}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                {t("contactInfo.success")}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-medium text-white mb-4 border-b border-white/[0.08] pb-2">
                  {t("contactInfo.contactPhoto")}
                </h3>
                <ImageUpload
                  value={form.photoUrl ?? ""}
                  onChange={(url) =>
                    setForm((p) => ({ ...p, photoUrl: url || null }))
                  }
                  label={t("contactInfo.contactPhotoLabel")}
                />
              </div>
              <div>
                <h3 className="text-lg font-display font-medium text-white mb-4 border-b border-white/[0.08] pb-2 pt-2">
                  {t("contactInfo.sectionTitle")}
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      {t("contactInfo.email")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder={t("contactInfo.emailPlaceholder")}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-display font-medium text-white mb-4 border-b border-white/[0.08] pb-2 pt-2">
                  {t("contactInfo.socialProfiles")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="linkedIn" className={labelClass}>
                      {t("contactInfo.linkedIn")}
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="linkedIn"
                        type="url"
                        value={form.linkedIn}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, linkedIn: e.target.value }))
                        }
                        placeholder={t("contactInfo.linkedInPlaceholder")}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="github" className={labelClass}>
                      {t("contactInfo.github")}
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="github"
                        type="url"
                        value={form.github}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, github: e.target.value }))
                        }
                        placeholder={t("contactInfo.githubPlaceholder")}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("contactInfo.saving")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t("contactInfo.save")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </ShineBorder>
      )}
    </div>
  );
}
