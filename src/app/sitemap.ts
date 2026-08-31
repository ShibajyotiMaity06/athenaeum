import type { MetadataRoute } from "next";
import { listStacks } from "@/lib/content";
import { LEVELS, ROLE_PILLARS, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;
  const lastMod = new Date("2026-08-28T00:00:00Z");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${baseUrl}/interview-prep`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.95
    },
    {
      url: `${baseUrl}/interview-prep/nodejs`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/interview-prep/javascript`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/interview-prep/react`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/interview-prep/sql`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/interview-prep/dbms`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/cancellation-and-refund`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];

  // Role Pillar Pages
  const roleRoutes: MetadataRoute.Sitemap = Object.keys(ROLE_PILLARS).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: lastMod,
    changeFrequency: "weekly",
    priority: 0.9
  }));

  // Technology Hub Pages & Level Pages
  const stacks = listStacks();
  const techHubRoutes: MetadataRoute.Sitemap = [];
  const levelRoutes: MetadataRoute.Sitemap = [];

  for (const stack of stacks) {
    techHubRoutes.push({
      url: `${baseUrl}/${stack.hubSlug}`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.85
    });

    for (const level of LEVELS) {
      levelRoutes.push({
        url: `${baseUrl}/${stack.hubSlug}/${level.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.75
      });
    }
  }

  return [...staticRoutes, ...roleRoutes, ...techHubRoutes, ...levelRoutes];
}
