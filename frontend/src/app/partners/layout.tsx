import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Партнёрам",
  description:
    "Партнёрская программа MAFF для архитекторов, дизайнеров, прорабов, мастеров и оптовых покупателей. Специальные условия и сотрудничество в Ташкенте.",
  path: "/partners",
  keywords: [
    "партнёрам MAFF",
    "сотрудничество",
    "оптом напольные покрытия",
    "дизайнерам",
    "архитекторам",
  ],
});

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
