import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/profile/', '/login/'],
    },
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
  };
}
