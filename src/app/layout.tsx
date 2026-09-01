import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE } from "@/lib/site";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap"
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "DevPrep — Technical Interview Preparation & Coding Interview Questions",
    template: `%s | ${SITE.name}`
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "DevPrep",
    "DevPrep online",
    "DevPrep interview preparation",
    "DevPrep technical interview questions",
    "technical interview questions",
    "technical interview preparation",
    "software engineering interview questions",
    "developer interview questions",
    "coding interview preparation",
    "software developer interview preparation",
    "web development interview questions",
    "web developer interview questions",
    "frontend interview questions",
    "backend interview questions",
    "full stack interview questions",
    "full stack developer interview questions",
    "JavaScript interview questions",
    "JavaScript interview questions and answers",
    "React interview questions",
    "React interview questions and answers",
    "Next.js interview questions",
    "TypeScript interview questions",
    "HTML interview questions",
    "CSS interview questions",
    "Zustand interview questions",
    "Context API interview questions",
    "Node.js interview questions",
    "Node.js interview questions and answers",
    "Express.js interview questions",
    "REST API interview questions",
    "GraphQL interview questions",
    "Redis interview questions",
    "MongoDB interview questions",
    "PostgreSQL interview questions",
    "SQL interview questions",
    "DBMS interview questions",
    "operating system interview questions",
    "OS interview questions",
    "computer networks interview questions",
    "OOP interview questions",
    "system design interview questions",
    "HLD interview questions",
    "high level design interview questions",
    "LLD interview questions",
    "low level design interview questions",
    "system design interview preparation",
    "Docker interview questions",
    "DevOps interview questions",
    "Git interview questions",
    "CI/CD interview questions",
    "DSA interview questions",
    "data structures and algorithms interview questions",
    "coding interview questions",
    "LeetCode interview questions",
    "binary search interview questions",
    "dynamic programming interview questions",
    "graph interview questions",
    "sliding window interview questions",
    "two pointer interview questions"
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: SITE.url
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: SITE.url,
    title: "DevPrep — Technical Interview Preparation & Coding Interview Questions",
    description: SITE.description
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPrep — Technical Interview Preparation & Coding Interview Questions",
    description: SITE.description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export const viewport: Viewport = {
  themeColor: "#e0e5ec",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
    description: SITE.description,
    sameAs: [
      "https://github.com",
      "https://twitter.com"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${sansFont.variable} ${monoFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a1a36f62-0f7e-44ea-a50b-38856c35112d"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('devprep_theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-chassis)] font-sans text-[var(--text-primary)] antialiased flex flex-col justify-between transition-colors duration-200">
        <div className="chassis-noise" aria-hidden="true" />
        <SiteHeader />
        <main id="main" className="flex-1 w-full">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
