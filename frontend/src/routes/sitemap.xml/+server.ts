import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;
	const currentDate = new Date().toISOString().split('T')[0];

	// Statiske ruter
	const staticRoutes = [
		{ path: '', priority: '1.0', changefreq: 'weekly' },
		{ path: '/FAQ', priority: '0.8', changefreq: 'monthly' },
		{ path: '/kalender20', priority: '1.0', changefreq: 'monthly' },
		{ path: '/kalender22', priority: '1.0', changefreq: 'monthly' },
		{ path: '/chatside', priority: '0.1', changefreq: 'weekly' },
		{ path: '/noe-mer', priority: '0.7', changefreq: 'monthly' }
	];

	// Dynamiske ruter - studieretninger
	const linjer = ['st', 'kda', 'mk', 'im', 'el'];
	const dynamicRoutes = linjer.map((linje) => ({
		path: `/linjer/${linje}`,
		priority: '0.9',
		changefreq: 'weekly'
	}));

	// Kombiner alle ruter
	const allRoutes = [...staticRoutes, ...dynamicRoutes];

	// Generer XML
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
	.map(
		(route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};

