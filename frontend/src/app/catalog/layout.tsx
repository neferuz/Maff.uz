import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Каталог напольных покрытий и дверей",
  description:
    "Каталог MAFF в Ташкенте: ламинат, паркетная доска, кварцвинил (SPC), межкомнатные двери, плинтусы и фурнитура. 17 брендов, официальная гарантия и рассрочка.",
  path: "/catalog",
  keywords: [
    "каталог ламината",
    "купить двери Ташкент",
    "напольные покрытия Узбекистан",
    "кварцвинил",
    "паркетная доска",
    "MAFF",
  ],
});

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
