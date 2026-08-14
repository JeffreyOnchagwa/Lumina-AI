import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(
    "https://lumina-ai-rust-mu.vercel.app"
  ),

  title: {
    default:
      "Lumina AI | Voice, Documents & Intelligent Assistant",
    template:
      "%s | Lumina AI",
  },

  description:
    "Lumina AI is an intelligent AI assistant for voice conversations, document analysis, image text extraction, learning, accessibility, and personalized conversations.",

  applicationName:
    "Lumina AI",

  authors: [
    {
      name: "Lumina AI",
    },
  ],

  creator:
    "Lumina AI",

  publisher:
    "Lumina AI",

  keywords: [
    "Lumina AI",
    "AI assistant",
    "voice AI",
    "AI voice assistant",
    "document AI",
    "AI document reader",
    "PDF AI",
    "image OCR AI",
    "AI learning assistant",
    "accessible AI",
    "AI chatbot",
    "document summarizer",
    "AI study assistant",
  ],

  alternates: {
    canonical:
      "https://lumina-ai-rust-mu.vercel.app/",
  },

  openGraph: {
    type: "website",

    url:
      "https://lumina-ai-rust-mu.vercel.app/",

    siteName:
      "Lumina AI",

    title:
      "Lumina AI | Voice, Documents & Intelligent Assistant",

    description:
      "Talk, upload documents, analyze images, summarize information, learn, and interact naturally with Lumina AI.",

    locale:
      "en_US",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Lumina AI | Voice, Documents & Intelligent Assistant",

    description:
      "An intelligent AI assistant for voice conversations, documents, image understanding, learning, and accessibility.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}