import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Сравнение товаров",
  description:
    "Сравнивайте напольные покрытия и двери MAFF по характеристикам, цене и бренду, чтобы выбрать лучший вариант для вашего интерьера.",
  path: "/compare",
  noIndex: true,
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
