import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: [
        '/admin/',
        '/api/',
        '/auth/',
        '/booking/',
        '/chat/',
        '/dashboard/',
        '/profile/',
      ],
    },
    sitemap: 'https://sageto.net/sitemap.xml',
  }
}
