import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://propfident.online";
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/tools/prop-match`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/prop-firms`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}