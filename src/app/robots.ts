import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/login", "/register"]
      }
    ],
    sitemap: "https://www.devprep.online/sitemap.xml"
  };
}
