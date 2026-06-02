import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Контакты",
  description:
    "Контакты MAFF в Ташкенте: телефон +998 71 205-54-54, адреса салонов, мессенджеры и соцсети. Свяжитесь с нами по вопросам покупки, доставки и рассрочки.",
  path: "/contacts",
  keywords: ["контакты MAFF", "телефон MAFF", "адрес магазина Ташкент"],
});

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
