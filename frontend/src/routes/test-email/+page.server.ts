import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	// Kun tillat på localhost
	const hostname = url.hostname;
	const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
	
	if (!isLocalhost) {
		throw error(404, 'Page not found');
	}

	// Sjekk SMTP-konfigurasjon (uten å vise faktiske verdier)
	const smtpConfigured = !!(
		process.env.SMTP_HOST &&
		process.env.SMTP_USER &&
		process.env.SMTP_PASS
	);

	const smtpHost = process.env.SMTP_HOST || 'Ikke satt';
	const smtpPort = process.env.SMTP_PORT || 'Ikke satt';
	const smtpUser = process.env.SMTP_USER || 'Ikke satt';
	const smtpUserSet = !!process.env.SMTP_USER;
	const smtpPassSet = !!process.env.SMTP_PASS;
	const fromEmail = process.env.FROM_EMAIL || 'Ikke satt';

	return {
		smtpConfigured,
		smtpHost,
		smtpPort,
		smtpUser,
		smtpUserSet,
		smtpPassSet,
		fromEmail
	};
};

