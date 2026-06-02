import type { Metadata } from "next";
import ProductPageClient from "./product-page-client";
import {
  fetchJson,
  stripHtml,
  truncate,
  canonical,
  formatPrice,
  breadcrumbJsonLd,
} from "@/lib/seo";
import { APP_CONFIG } from "@/constants";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchJson<any>(`/api/v1/products/${slug}`);

  if (!product || !product.name) {
    return {
      title: "Товар не найден",
      description: "Запрашиваемый товар не найден в каталоге MAFF.",
      robots: { index: false, follow: true },
    };
  }

  const name: string = product.name;
  const brand: string = product.brand || "MAFF";
  const rawDescription = stripHtml(product.description);
  const fallbackDescription = `Купить ${name}${
    brand && brand !== "MAFF" ? ` (${brand})` : ""
  } в Ташкенте. Официальная гарантия, доставка по Узбекистану и выгодная рассрочка от MAFF.`;
  const description = truncate(rawDescription || fallbackDescription, 160);

  const image: string | undefined =
    product.image_url || (Array.isArray(product.images) ? product.images[0] : undefined);
  const url = canonical(`/product/${slug}`);

  return {
    title: `${name} — купить в Ташкенте`,
    description,
    keywords: [name, brand, product.country, product.grade, "купить", "Ташкент", "MAFF"].filter(
      Boolean
    ) as string[],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${name} — купить в Ташкенте | MAFF`,
      description,
      siteName: "Maff.uz",
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | MAFF`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function generateStaticParams() {
  return [
    { slug: "1502" },
    { slug: "101" },
    { slug: "102" },
    { slug: "103" },
    { slug: "104" },
    { slug: "501" },
    { slug: "502" },
    { slug: "503" },
    { slug: "1" },
    { slug: "2" },
    { slug: "3" },
    { slug: "4" },
    { slug: "5" },
    { slug: "6" },
    { slug: "7" },
    { slug: "8" },
    { slug: "9" },
    { slug: "10" },
  ];
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await fetchJson<any>(`/api/v1/products/${resolvedParams.slug}`);

  const jsonLd = product?.name
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
          truncate(stripHtml(product.description), 300) || `${product.name} от MAFF`,
        sku: product.sku || String(product.id),
        image:
          product.image_url ||
          (Array.isArray(product.images) ? product.images : undefined),
        brand: { "@type": "Brand", name: product.brand || "MAFF" },
        ...(product.country
          ? { countryOfOrigin: product.country }
          : {}),
        ...(formatPrice(product.price)
          ? {
              offers: {
                "@type": "Offer",
                url: canonical(`/product/${resolvedParams.slug}`),
                priceCurrency: "UZS",
                price: formatPrice(product.price),
                availability:
                  (product.stock ?? 0) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                seller: { "@type": "Organization", name: "MAFF" },
              },
            }
          : {}),
      }
    : null;

  const breadcrumb = product?.name
    ? breadcrumbJsonLd([
        { name: "Главная", url: APP_CONFIG.url },
        { name: "Каталог", url: canonical("/catalog") },
        { name: product.name, url: canonical(`/product/${resolvedParams.slug}`) },
      ])
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
      )}
      <ProductPageClient params={resolvedParams} />
    </>
  );
}
