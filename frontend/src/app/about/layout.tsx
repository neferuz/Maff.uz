import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "О компании MAFF",
  description:
    "MAFF — ведущий дистрибьютор напольных покрытий и межкомнатных дверей в Узбекистане. 20 лет опыта, 17 международных брендов и безупречный сервис в Ташкенте.",
  path: "/about",
  keywords: ["о компании MAFF", "дистрибьютор напольных покрытий", "MAFF Ташкент"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
