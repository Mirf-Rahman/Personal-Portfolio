export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Mir Faiyazur Rahman. All rights reserved.
        </p>
        <div className="flex gap-4">
            {/* Social Links Placeholders */}
            <span className="text-sm text-muted-foreground">GitHub</span>
            <span className="text-sm text-muted-foreground">LinkedIn</span>
            <span className="text-sm text-muted-foreground">Twitter</span>
        </div>
      </div>
    </footer>
  );
}
