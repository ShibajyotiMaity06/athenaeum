import type { Metadata } from "next";
import { getCurrentUser, hasDsaAccess } from "@/lib/auth";
import { getAllDsaTracks } from "@/lib/dsa-data";
import { SITE } from "@/lib/site";
import DsaClient from "@/components/DsaClient";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DSA Interview Questions & Coding Interview Preparation | DevPrep",
  description:
    "600+ Curated DSA interview questions covering LeetCode top questions, Google SWE questions, Dynamic Programming, Graphs, Binary Search, Segment Trees, Sliding Window, and Two Pointers.",
  alternates: { canonical: `${SITE.url}/dsa` },
  openGraph: {
    title: "DSA Interview Questions & Coding Interview Preparation | DevPrep",
    description:
      "600+ Curated DSA interview questions covering LeetCode top questions, Google SWE questions, Dynamic Programming, Graphs, Binary Search, Segment Trees, Sliding Window, and Two Pointers.",
    url: `${SITE.url}/dsa`,
    siteName: SITE.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DSA Interview Questions & Coding Interview Preparation | DevPrep",
    description:
      "600+ Curated DSA interview questions covering LeetCode top questions, Google SWE questions, Dynamic Programming, Graphs, Binary Search, Segment Trees, Sliding Window, and Two Pointers."
  }
};

export default async function DsaPage() {
  const user = await getCurrentUser();
  const isUnlocked = hasDsaAccess(user);
  const tracks = getAllDsaTracks();

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Data Structures & Algorithms Interview Codex",
    description:
      "600+ Curated Data Structures & Algorithms problems categorized by patterns: Dynamic Programming, Graphs, Segment Trees, Binary Search, Greedy, Sliding Window, and Top Company questions.",
    provider: {
      "@type": "Organization",
      name: SITE.name,
      sameAs: SITE.url
    },
    educationalLevel: "Advanced",
    about: [
      "DSA interview questions",
      "Algorithms",
      "Data Structures",
      "LeetCode interview questions",
      "Dynamic Programming interview questions",
      "Graph interview questions",
      "Binary Search interview questions",
      "Competitive Programming"
    ]
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "DSA Problem Codex",
        item: `${SITE.url}/dsa`
      }
    ]
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <JsonLd data={courseJsonLd} />
      <JsonLd data={breadcrumbsJsonLd} />
      <DsaClient tracks={tracks} isUnlocked={isUnlocked} userEmail={user?.email} />
    </div>
  );
}
