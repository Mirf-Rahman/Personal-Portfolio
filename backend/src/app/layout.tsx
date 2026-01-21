import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio API",
  description: "Backend API for Personal Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
