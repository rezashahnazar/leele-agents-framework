import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeelE Agent Framework",
  description: "LeelE Agent Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
