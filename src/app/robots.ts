import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/login',
        '/dashboard',
        '/docker',
        '/status',
        '/note/', // Užblokuoja visus /note/... maršrutus (redagavimą, istoriją)
        '/*/edit', // Papildomas saugiklis redagavimo puslapiams
        '/*/history', // Papildomas saugiklis istorijos puslapiams
      ],
    },
    sitemap: 'https://knowledge.morkunas.info/sitemap.xml',
  };
}
