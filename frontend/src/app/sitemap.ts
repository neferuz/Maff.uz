import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/constants';
import { fetchJson } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url.replace(/\/$/, '');
  const now = new Date();

  // ── Static routes ──
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/catalog',
    '/outlet',
    '/installment',
    '/showrooms',
    '/about',
    '/faq',
    '/partners',
    '/warranty',
    '/delivery',
    '/contacts',
    '/blog',
    '/certificates',
    '/socials',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // ── Categories ──
  const categories = (await fetchJson<any[]>('/api/v1/categories/')) || [];
  const categoryRoutes: MetadataRoute.Sitemap = Array.isArray(categories)
    ? categories
        .filter((c) => c && c.name && c.is_active !== false)
        .map((c) => ({
          url: `${baseUrl}/category/${encodeURIComponent(
            String(c.name).toLowerCase().replace(/\s+/g, '-')
          )}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
    : [];

  // ── Products ──
  const products = (await fetchJson<any[]>('/api/v1/products?limit=10000')) || [];
  const productRoutes: MetadataRoute.Sitemap = Array.isArray(products)
    ? products
        .filter((p) => p && p.id)
        .map((p) => ({
          url: `${baseUrl}/product/${p.id}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
    : [];

  // ── Blog posts ──
  const pages = (await fetchJson<any[]>('/api/v1/pages/')) || [];
  const blogRoutes: MetadataRoute.Sitemap = Array.isArray(pages)
    ? pages
        .filter((p) => p && typeof p.slug === 'string' && p.slug.startsWith('post-'))
        .map((p) => ({
          url: `${baseUrl}/blog/${p.slug}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }))
    : [];

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
