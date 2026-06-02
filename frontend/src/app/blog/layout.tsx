import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Блог",
  description:
    "Блог MAFF: экспертные статьи о выборе ламината, паркета и дверей, советы по ремонту и уходу за напольными покрытиями. Полезные материалы для вашего интерьера.",
  path: "/blog",
  keywords: [
    "блог о ремонте",
    "как выбрать ламинат",
    "советы по напольным покрытиям",
    "MAFF",
  ],
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
