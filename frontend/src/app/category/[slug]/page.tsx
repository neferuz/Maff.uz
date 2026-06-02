import type { Metadata } from "next";
import CategoryPageClient from "./category-page-client";
import { fetchJson, truncate, canonical, breadcrumbJsonLd } from "@/lib/seo";
import { APP_CONFIG } from "@/constants";

export const dynamicParams = true;

function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

async function resolveCategory(slug: string): Promise<any | null> {
  const categories = await fetchJson<any[]>(`/api/v1/categories/`);
  if (!Array.isArray(categories)) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ");
  return (
    categories.find(
      (c) => c && c.name && c.name.toLowerCase().replace(/-/g, " ") === cleanSlug
    ) || null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  const title = category?.name ? titleFromSlug(category.name) : titleFromSlug(slug);
  const description = truncate(
    category?.description ||
      `${title} в Ташкенте — широкий выбор, официальная гарантия, доставка по Узбекистану и рассрочка от MAFF.`,
    160
  );
  const url = canonical(`/category/${slug}`);

  return {
    title: `${title} — каталог`,
    description,
    keywords: [title, "купить", "Ташкент", "Узбекистан", "MAFF"],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} — каталог | MAFF`,
      description,
      siteName: "Maff.uz",
      images: category?.image_url ? [{ url: category.image_url, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MAFF`,
      description,
    },
  };
}

export function generateStaticParams() {
  const categories = [
    "ламинат", "паркетная-доска", "межкомнатные-двери", "плинтус", 
    "подложка", "инженерная-доска", "настенные-декоры", "пороги", 
    "osb-плиты", "spc-ламинат", "ручки-и-фурнитура", "экопробка"
  ];
  return categories.map((slug) => ({
    slug: slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  const title = category?.name ? titleFromSlug(category.name) : titleFromSlug(slug);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Главная", url: APP_CONFIG.url },
    { name: "Каталог", url: canonical("/catalog") },
    { name: title, url: canonical(`/category/${slug}`) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <CategoryPageClient />
    </>
  );
}
