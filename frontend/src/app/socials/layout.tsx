import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Мы в соцсетях",
  description:
    "Официальные страницы MAFF в социальных сетях и мессенджерах: Telegram, Instagram, Facebook. Следите за новинками, акциями и идеями для интерьера.",
  path: "/socials",
  keywords: ["MAFF соцсети", "Telegram MAFF", "Instagram MAFF"],
});

export default function SocialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
