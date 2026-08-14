import type { MetadataRoute } from "next";


export default function sitemap():
  MetadataRoute.Sitemap {
  const baseUrl =
    "https://lumina-ai-rust-mu.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified:
        new Date(),
      changeFrequency:
        "weekly",
      priority:
        1,
    },
  ];
}