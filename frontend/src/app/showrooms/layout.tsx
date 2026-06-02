import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Шоу-румы и салоны в Ташкенте",
  description:
    "Шоу-румы MAFF в Ташкенте: адреса, режим работы и контакты. Приходите посмотреть ламинат, паркет, кварцвинил и межкомнатные двери вживую перед покупкой.",
  path: "/showrooms",
  keywords: [
    "шоу-рум ламината Ташкент",
    "салон дверей",
    "магазин напольных покрытий",
    "адреса MAFF",
  ],
});

export default function ShowroomsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
