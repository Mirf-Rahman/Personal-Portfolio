"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const navItems = [
    { key: "dashboard", href: "/admin/dashboard" },
    { key: "skills", href: "/admin/skills" },
    { key: "projects", href: "/admin/projects" },
    { key: "experience", href: "/admin/experience" },
    { key: "education", href: "/admin/education" },
    { key: "hobbies", href: "/admin/hobbies" },
    { key: "testimonials", href: "/admin/testimonials" },
    { key: "messages", href: "/admin/messages" },
    { key: "resume", href: "/admin/resume" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">{t("panel")}</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`block px-4 py-2 rounded hover:bg-accent ${
                isActive(item.href) ? "bg-accent font-medium" : ""
              }`}
            >
              {t(`sidebar.${item.key}`)}
            </Link>
          ))}
          <Link
            href="/"
            className="block px-4 py-2 rounded hover:bg-accent text-muted-foreground"
          >
            {t("backToSite")}
          </Link>
        </nav>
      </div>
    </aside>
  );
}
