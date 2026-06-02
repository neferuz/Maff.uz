import type { Metadata } from "next";
import PartnerPageClient from "./partner-page-client";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = true;

const PARTNER_META: Record<string, { title: string; description: string }> = {
  architects: {
    title: "Архитекторам",
    description:
      "Сотрудничество MAFF с архитекторами: профессиональные образцы, спецификации и выгодные условия на напольные покрытия и двери в Ташкенте.",
  },
  developers: {
    title: "Застройщикам",
    description:
      "MAFF для застройщиков: поставки напольных покрытий и дверей на объекты, оптовые цены и сопровождение проектов в Узбекистане.",
  },
  designers: {
    title: "Дизайнерам",
    description:
      "Партнёрство MAFF с дизайнерами интерьера: каталоги, образцы материалов и специальные условия на ламинат, паркет и двери.",
  },
  wholesale: {
    title: "Оптовым покупателям",
    description:
      "Оптовые поставки напольных покрытий и дверей от MAFF в Узбекистане. Выгодные цены, широкий ассортимент и надёжная логистика.",
  },
  masters: {
    title: "Мастерам",
    description:
      "Программа MAFF для мастеров и укладчиков: бонусы, профессиональная поддержка и удобные условия покупки материалов в Ташкенте.",
  },
  foremen: {
    title: "Прорабам",
    description:
      "MAFF для прорабов: материалы для объектов, оптовые цены и оперативные поставки напольных покрытий и дверей в Узбекистане.",
  },
  dealers: {
    title: "Дилерам",
    description:
      "Дилерская программа MAFF: сотрудничество, выгодные условия и поставки напольных покрытий и дверей по Узбекистану.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const info = PARTNER_META[slug] || {
    title: "Партнёрам",
    description:
      "Партнёрская программа MAFF: специальные условия сотрудничества для профессионалов в Ташкенте и по всему Узбекистану.",
  };
  return pageMetadata({
    title: info.title,
    description: info.description,
    path: `/partners/${slug}`,
    keywords: [info.title, "партнёрам MAFF", "сотрудничество", "Ташкент"],
  });
}

export function generateStaticParams() {
  return [
    { slug: "architects" },
    { slug: "developers" },
    { slug: "designers" },
    { slug: "wholesale" },
    { slug: "masters" },
    { slug: "foremen" },
    { slug: "dealers" },
  ];
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PartnerPageClient params={params} />;
}
