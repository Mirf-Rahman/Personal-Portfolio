"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShaderBackground } from "@/components/ui/shader-background";
import { ShineBorder } from "@/components/ui/shine-border";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(t("errors.invalid"));
        setLoading(false);
        return;
      }

      // Check if user is admin
      const session = await authClient.getSession();
      const userRole = (session.data?.user as { role?: string })?.role;
      if (userRole !== "ADMIN") {
        setError(t("errors.invalid"));
        await authClient.signOut();
        setLoading(false);
        return;
      }

      // Success - redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError(t("errors.generic"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans">
      {/* Reused Shader Background */}
      <ShaderBackground opacity={0.8} />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px] mx-4"
      >
        <ShineBorder
          className="relative flex flex-col items-center justify-center w-full p-8 rounded-3xl border border-white/[0.08] bg-slate-950/60 backdrop-blur-2xl shadow-2xl"
          shineColor={["#38bdf8", "#818cf8", "#c084fc"]}
          borderWidth={1.5}
          duration={8}
        >
          {/* Header */}
          <div className="text-center space-y-6 mb-8 w-full">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-white/[0.08] shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Lock className="w-7 h-7 text-cyan-200/90 relative z-10" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-display tracking-tight text-white">
                {t("title")}
              </h1>
              <p className="text-sm text-slate-400 font-light tracking-wide">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Email Field */}
            <div className="space-y-2 group">
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono transition-colors group-focus-within:text-cyan-400"
              >
                {t("email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 shadow-inner group-hover:border-white/[0.12] group-hover:bg-slate-900/60"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold text-cyan-100/60 uppercase tracking-widest pl-1 font-mono transition-colors group-focus-within:text-indigo-400"
              >
                {t("password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-900/40 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 shadow-inner group-hover:border-white/[0.12] group-hover:bg-slate-900/60"
                  placeholder={t("passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs backdrop-blur-sm"
              >
                <div className="w-1 h-1 rounded-full bg-red-500 box-content border-2 border-red-500/30" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="w-full py-4 shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_-5px_rgba(56,189,248,0.5)] transition-shadow duration-300"
                shimmerColor="rgba(255, 255, 255, 0.3)"
                shimmerSize="0.15em"
                shimmerDuration="2.5s"
                background="#38bdf8"
                borderRadius="12px"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-950">
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {t("submitting")}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold tracking-wide font-display text-slate-950 uppercase">
                    {t("submit")}
                  </span>
                )}
              </ShimmerButton>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-cyan-400 transition-colors group px-4 py-2 rounded-full hover:bg-white/[0.03]"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">
                ←
              </span>
              {t("backToHome")}
            </Link>
          </div>
        </ShineBorder>
      </motion.div>
    </div>
  );
}
