import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-accent">
              Dashboard
            </Link>
            <Link href="/admin/skills" className="block px-4 py-2 rounded hover:bg-accent">
              Skills
            </Link>
            <Link href="/admin/projects" className="block px-4 py-2 rounded hover:bg-accent">
              Projects
            </Link>
            <Link href="/admin/experience" className="block px-4 py-2 rounded hover:bg-accent">
              Experience
            </Link>
            <Link href="/admin/education" className="block px-4 py-2 rounded hover:bg-accent">
              Education
            </Link>
            <Link href="/admin/hobbies" className="block px-4 py-2 rounded hover:bg-accent">
              Hobbies
            </Link>
            <Link href="/admin/testimonials" className="block px-4 py-2 rounded hover:bg-accent">
              Testimonials
            </Link>
            <Link href="/admin/messages" className="block px-4 py-2 rounded hover:bg-accent">
              Messages
            </Link>
            <Link href="/admin/resume" className="block px-4 py-2 rounded hover:bg-accent">
              Resume
            </Link>
            <Link href="/" className="block px-4 py-2 rounded hover:bg-accent text-muted-foreground">
              ← Back to Site
            </Link>
          </nav>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
