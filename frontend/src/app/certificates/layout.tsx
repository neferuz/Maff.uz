import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Сертификаты",
  description:
    "Сертификаты качества и официальные документы MAFF. Подтверждение подлинности и соответствия продукции — ламината, паркета и дверей в Ташкенте.",
  path: "/certificates",
  keywords: ["сертификаты качества", "документы MAFF", "оригинальная продукция"],
});

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
