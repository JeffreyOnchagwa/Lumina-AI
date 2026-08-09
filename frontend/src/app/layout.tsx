import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina AI",
  description:
    "An intelligent, accessible AI assistant for voice, documents, learning, and conversation.",
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