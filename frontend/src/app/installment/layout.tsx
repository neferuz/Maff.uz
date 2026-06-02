import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Рассрочка",
  description:
    "Рассрочка на ламинат, паркет и двери в MAFF. Выгодные условия от партнёров (Alif, Uzum, Anor), от 3 до 24 месяцев. Оформите покупку в рассрочку в Ташкенте.",
  path: "/installment",
  keywords: [
    "рассрочка ламинат",
    "двери в рассрочку",
    "купить ламинат в кредит",
    "рассрочка Ташкент",
    "MAFF",
  ],
});

export default function InstallmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
