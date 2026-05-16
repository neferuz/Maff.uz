import ProductPageClient from "./product-page-client";

export const dynamicParams = true;

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
  return <ProductPageClient params={resolvedParams} />;
}
