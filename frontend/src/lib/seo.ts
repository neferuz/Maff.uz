import type { Metadata } from "next";
import { APP_CONFIG } from "@/constants";

/** Build a consistent Metadata object for a static page. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = canonical(opts.path);
  const image = opts.image || "/og-image.jpg";
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url,
      title: `${opts.title} | Maff.uz`,
      description: opts.description,
      siteName: "Maff.uz",
      images: [{ url: image, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | Maff.uz`,
      description: opts.description,
      images: [image],
    },
  };
}

/**
 * Resolve the API base URL for SERVER-SIDE fetches (generateMetadata, sitemap).
 * On the server, relative `/api/v1/...` paths and Next.js rewrites are not
 * available, so we must call the backend directly. In production set
 * API_INTERNAL_URL (or NEXT_PUBLIC_API_URL) to the backend origin.
 */
export function getServerApiBase(): string {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000"
  );
}

/** Strip HTML tags and collapse whitespace for safe meta descriptions. */
export function stripHtml(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate text to a max length on a word boundary, appending an ellipsis. */
export function truncate(text: string, max = 160): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}

/** Build an absolute canonical URL from a path. */
export function canonical(path: string): string {
  const base = APP_CONFIG.url.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

/** Format a price into a localized RUB/UZS string (numeric only for schema). */
export function formatPrice(value?: number | null): string | undefined {
  if (value == null || Number.isNaN(value) || value <= 0) return undefined;
  return String(Math.round(value));
}

/** Server-side fetch helper with short revalidation and graceful failure. */
export async function fetchJson<T = any>(
  path: string,
  revalidate = 3600
): Promise<T | null> {
  try {
    const base = getServerApiBase().replace(/\/$/, "");
    const url = path.startsWith("http") ? path : `${base}${path}`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Organization structured data (JSON-LD) for the whole site. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MAFF",
    url: APP_CONFIG.url,
    logo: `${APP_CONFIG.url}/logo.png`,
    description: APP_CONFIG.description,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+998-71-205-54-54",
      contactType: "customer service",
      areaServed: "UZ",
      availableLanguage: ["Russian", "Uzbek"],
    },
    sameAs: [APP_CONFIG.links.telegram, APP_CONFIG.links.instagram],
  };
}

/** Breadcrumb structured data (JSON-LD). */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
