import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Доставка",
  description:
    "Условия доставки напольных покрытий и дверей от MAFF по Ташкенту и Узбекистану. Быстрая и бережная доставка, удобные способы оплаты и самовывоз.",
  path: "/delivery",
  keywords: ["доставка ламината", "доставка дверей Ташкент", "доставка MAFF"],
});

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
