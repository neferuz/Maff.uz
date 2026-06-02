import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Гарантия и возврат",
  description:
    "Гарантия и возврат в MAFF: официальная заводская гарантия до 30 лет, лёгкий возврат в течение 14 дней и 100% оригинальная продукция. Условия сервиса в Ташкенте.",
  path: "/warranty",
  keywords: ["гарантия ламинат", "возврат товара", "гарантия двери", "MAFF"],
});

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
