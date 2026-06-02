import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Часто задаваемые вопросы",
  description:
    "Ответы на частые вопросы о покупке, доставке, гарантии и рассрочке в MAFF. Всё о ламинате, паркете, кварцвиниле и межкомнатных дверях в Ташкенте.",
  path: "/faq",
  keywords: ["вопросы и ответы", "FAQ MAFF", "гарантия", "доставка", "рассрочка"],
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
