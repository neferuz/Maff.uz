import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;

  const routes = [
    '',
    '/catalog',
    '/outlet',
    '/installment',
    '/showrooms',
    '/about',
    '/faq',
    '/jobs',
    '/partners',
    '/warranty',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
