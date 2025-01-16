import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeelE | Intelligent Agent Framework",
  description:
    "A powerful framework for building, deploying, and managing intelligent AI agents with advanced capabilities and seamless integration",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
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
