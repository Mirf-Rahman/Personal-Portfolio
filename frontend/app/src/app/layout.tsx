import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mir Faiyazur Rahman | Full Stack Developer",
  description: "Personal portfolio showcasing skills, projects, and experience of Mir Faiyazur Rahman - Full Stack Developer building modern web applications.",
  keywords: ["Full Stack Developer", "React", "Next.js", "TypeScript", "Portfolio"],
  authors: [{ name: "Mir Faiyazur Rahman" }],
  openGraph: {
    title: "Mir Faiyazur Rahman | Full Stack Developer",
    description: "Personal portfolio showcasing skills, projects, and experience",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 relative z-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
