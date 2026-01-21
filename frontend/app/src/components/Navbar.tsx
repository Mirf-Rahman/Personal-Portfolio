import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Mirf.dev</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/#projects"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Projects
          </Link>
          <Link
            href="/#skills"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Skills
          </Link>
          <Link
            href="/#experience"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Experience
          </Link>
          <Link
            href="/#education"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Education
          </Link>
          <Link
            href="/#hobbies"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Hobbies
          </Link>
          <Link
            href="/testimonials"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Testimonials
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
           {/* Placeholder for future Theme Toggle */}
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Login
            </Link>
        </div>
      </div>
    </header>
  );
}
