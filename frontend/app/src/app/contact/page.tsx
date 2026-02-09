"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { PinContainer } from "@/components/ui/3d-pin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { fetchApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ContactInfo {
  email: string;
  linkedIn: string;
  github: string;
  photoUrl?: string | null;
}

const LIMITS = { name: 100, email: 100, subject: 150, message: 1200 };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const DEFAULT_LINKEDIN =
  "https://www.linkedin.com/in/faiyazur-rahman-mir-828173309/";
const DEFAULT_GITHUB = "https://github.com/Mirf-Rahman";
const DEFAULT_EMAIL = "mirfaiyazrahman@gmail.com";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    fetchApi<ContactInfo | null>("/api/contact-info")
      .then((data) => setContactInfo(data ?? null))
      .catch(() => setContactInfo(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess(false);

    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = t("validation.nameRequired");
    else if (name.length > LIMITS.name)
      errors.name = t("validation.nameMax", { max: LIMITS.name });
    if (!email.trim()) errors.email = t("validation.emailRequired");
    else if (!EMAIL_REGEX.test(email.trim()))
      errors.email = t("validation.emailInvalid");
    else if (email.length > LIMITS.email)
      errors.email = t("validation.emailMax", { max: LIMITS.email });
    if (!subject.trim()) errors.subject = t("validation.subjectRequired");
    else if (subject.length > LIMITS.subject)
      errors.subject = t("validation.subjectMax", { max: LIMITS.subject });
    if (!message.trim()) errors.message = t("validation.messageRequired");
    else if (message.length > LIMITS.message)
      errors.message = t("validation.messageMax", { max: LIMITS.message });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setFieldErrors({});
    } catch (err) {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Global Background Layers - Continuous across all sections */}
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

      {/* Hero Section with Particles */}
      <section className="relative h-[35vh] min-h-[300px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 pointer-events-none z-10 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
            <FloatingParticles
              particleCount={800}
              particleColor1="#22d3ee" // Cyan-400
              particleColor2="#34d399" // Emerald-400
              cameraDistance={1000}
              rotationSpeed={0.02}
              particleSize={8}
              antigravityForce={10}
              activationRate={10}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Text and Photo */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 z-30 pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl md:text-7xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-500 drop-shadow-2xl text-center"
          >
            {t("title")}
          </motion.h1>
          {contactInfo?.photoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="shrink-0"
            >
              <img
                src={contactInfo.photoUrl}
                alt=""
                className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-white/10 shadow-xl"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative w-full py-12 px-4 overflow-hidden z-10 -mt-10">
        <div className="container mx-auto relative z-10 max-w-7xl space-y-16">
          {/* Social Pins */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {/* LinkedIn */}
            <PinContainer
              title={contactInfo?.linkedIn?.trim() || DEFAULT_LINKEDIN}
              href={contactInfo?.linkedIn?.trim() || DEFAULT_LINKEDIN}
            >
              <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[18rem] md:w-[20rem] h-[15rem] bg-gradient-to-b from-slate-900/90 to-slate-900/0 backdrop-blur-sm border border-slate-700/50 rounded-2xl group-hover/pin:border-cyan-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {t("social.connect")}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <svg
                    className="w-12 h-12 text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="text-lg font-bold text-white">LinkedIn</span>
                </div>
              </div>
            </PinContainer>

            {/* GitHub */}
            <PinContainer
              title={contactInfo?.github?.trim() || DEFAULT_GITHUB}
              href={contactInfo?.github?.trim() || DEFAULT_GITHUB}
            >
              <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[18rem] md:w-[20rem] h-[15rem] bg-gradient-to-b from-slate-900/90 to-slate-900/0 backdrop-blur-sm border border-slate-700/50 rounded-2xl group-hover/pin:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {t("social.code")}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <svg
                    className="w-12 h-12 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="text-lg font-bold text-white">GitHub</span>
                </div>
              </div>
            </PinContainer>

            {/* Email */}
            <PinContainer
              title={contactInfo?.email?.trim() || DEFAULT_EMAIL}
              href={`mailto:${contactInfo?.email?.trim() || DEFAULT_EMAIL}`}
            >
              <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[18rem] md:w-[20rem] h-[15rem] bg-gradient-to-b from-slate-900/90 to-slate-900/0 backdrop-blur-sm border border-slate-700/50 rounded-2xl group-hover/pin:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {t("social.message")}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <svg
                    className="w-12 h-12 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-lg font-bold text-white">
                    {contactInfo?.email?.trim() || DEFAULT_EMAIL}
                  </span>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Contact Form Section */}
          <div className="w-full max-w-4xl mx-auto">
            <SectionHeading
              title={t("formTitle")}
              description={t("description")}
              icon={Mail}
              className="mb-12"
              gradient="from-cyan-400 via-blue-500 to-purple-500"
            />

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                {/* Glossy gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {success ? (
                  <div className="text-center py-16 relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mx-auto mb-8 flex items-center justify-center shadow-lg shadow-green-500/10"
                    >
                      <svg
                        className="w-12 h-12 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <Label
                          htmlFor="name"
                          className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1"
                        >
                          {t("form.name")}
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setFieldErrors((p) => ({ ...p, name: undefined }));
                          }}
                          placeholder={t("form.namePlaceholder")}
                          maxLength={LIMITS.name}
                          className={`h-12 bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all rounded-xl ${fieldErrors.name ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                        />
                        <div className="flex justify-between items-center">
                          {fieldErrors.name ? (
                            <p className="text-xs text-red-400">
                              {fieldErrors.name}
                            </p>
                          ) : (
                            <span />
                          )}
                          <span className="text-[10px] text-slate-600 font-mono">
                            {name.length}/{LIMITS.name}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label
                          htmlFor="email"
                          className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1"
                        >
                          {t("form.email")}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setFieldErrors((p) => ({ ...p, email: undefined }));
                          }}
                          placeholder={t("form.emailPlaceholder")}
                          maxLength={LIMITS.email}
                          className={`h-12 bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all rounded-xl ${fieldErrors.email ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                        />
                        <div className="flex justify-between items-center">
                          {fieldErrors.email ? (
                            <p className="text-xs text-red-400">
                              {fieldErrors.email}
                            </p>
                          ) : (
                            <span />
                          )}
                          <span className="text-[10px] text-slate-600 font-mono">
                            {email.length}/{LIMITS.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label
                        htmlFor="subject"
                        className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1"
                      >
                        {t("form.subject")}
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value);
                          setFieldErrors((p) => ({ ...p, subject: undefined }));
                        }}
                        placeholder={t("form.subjectPlaceholder")}
                        maxLength={LIMITS.subject}
                        className={`h-12 bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all rounded-xl ${fieldErrors.subject ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                      />
                      <div className="flex justify-between items-center">
                        {fieldErrors.subject ? (
                          <p className="text-xs text-red-400">
                            {fieldErrors.subject}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span className="text-[10px] text-slate-600 font-mono">
                          {subject.length}/{LIMITS.subject}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label
                        htmlFor="message"
                        className="text-cyan-100/80 text-xs font-semibold tracking-wider uppercase pl-1"
                      >
                        {t("form.message")}
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setFieldErrors((p) => ({ ...p, message: undefined }));
                        }}
                        placeholder={t("form.messagePlaceholder")}
                        maxLength={LIMITS.message}
                        className={`min-h-[160px] bg-slate-950/30 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-slate-950/50 transition-all resize-y rounded-xl p-4 leading-relaxed ${fieldErrors.message ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                      />
                      <div className="flex justify-between items-center">
                        {fieldErrors.message ? (
                          <p className="text-xs text-red-400">
                            {fieldErrors.message}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span className="text-[10px] text-slate-600 font-mono">
                          {message.length}/{LIMITS.message}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
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
                          {t("form.sending")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {t("form.send")}
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
