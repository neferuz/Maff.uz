import type { Metadata } from "next";
import { fetchJson, stripHtml, truncate, canonical } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchJson<any>(`/api/v1/pages/${slug}`);
  const post = page?.content;

  if (!post || !post.title) {
    return {
      title: "Статья не найдена",
      description: "Запрашиваемая статья не найдена в блоге MAFF.",
      robots: { index: false, follow: true },
    };
  }

  const title: string = post.title;
  const description = truncate(
    stripHtml(post.excerpt) ||
      stripHtml(Array.isArray(post.sections) ? post.sections[0]?.content : "") ||
      `${title} — экспертная статья в блоге MAFF о напольных покрытиях и дверях.`,
    160
  );
  const url = canonical(`/blog/${slug}`);

  return {
    title,
    description,
    keywords: [post.category, "блог", "MAFF", "ремонт", "напольные покрытия"].filter(
      Boolean
    ) as string[],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} | Блог MAFF`,
      description,
      siteName: "Maff.uz",
      publishedTime: post.date || undefined,
      images: post.image ? [{ url: post.image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MAFF`,
      description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
