export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Skills" count={0} href="/admin/skills" />
        <DashboardCard title="Projects" count={0} href="/admin/projects" />
        <DashboardCard title="Experience" count={0} href="/admin/experience" />
        <DashboardCard title="Education" count={0} href="/admin/education" />
        <DashboardCard title="Hobbies" count={0} href="/admin/hobbies" />
        <DashboardCard title="Testimonials" count={0} href="/admin/testimonials" />
        <DashboardCard title="Messages" count={0} href="/admin/messages" />
        <DashboardCard title="Resume" count={0} href="/admin/resume" />
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  count, 
  href 
}: { 
  title: string; 
  count: number; 
  href: string; 
}) {
  return (
    <a 
      href={href}
      className="block p-6 bg-card rounded-lg shadow hover:shadow-md transition-shadow border border-border"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-3xl font-bold text-primary">{count}</p>
      <p className="text-sm text-muted-foreground mt-2">
        Manage {title.toLowerCase()}
      </p>
    </a>
  );
}
