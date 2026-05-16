import CategoryPageClient from "../../category/[slug]/category-page-client";

export default async function CatalogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CategoryPageClient />;
}
