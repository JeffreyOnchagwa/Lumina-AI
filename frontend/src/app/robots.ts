import type { MetadataRoute } from "next";


export default function robots():
  MetadataRoute.Robots {
  const baseUrl =
    "https://lumina-ai-rust-mu.vercel.app";

  return {
    rules: {
      userAgent:
        "*",

      allow:
        "/",

      disallow: [
        "/app",
        "/documents",
        "/preferences",
        "/profile",
      ],
    },

    sitemap:
      `${baseUrl}/sitemap.xml`,
  };
}