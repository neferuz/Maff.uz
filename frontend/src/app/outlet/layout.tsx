import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Outlet — распродажа со скидками",
  description:
    "Outlet MAFF: ламинат, паркет и двери по сниженным ценам. Остатки коллекций и выгодные предложения со скидками в Ташкенте. Успейте купить со склада.",
  path: "/outlet",
  keywords: [
    "распродажа ламината",
    "скидки двери Ташкент",
    "outlet напольные покрытия",
    "дешёвый ламинат",
    "MAFF",
  ],
});

export default function OutletLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
