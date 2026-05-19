import CategoryPageClient from "./category-page-client";

export const dynamicParams = true;

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
  return <CategoryPageClient />;
}
