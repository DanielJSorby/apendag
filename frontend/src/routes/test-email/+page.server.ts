import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

async function checkDeveloper(cookies: any, url: URL): Promise<boolean> {
	const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
	const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
	
	if (!currentUserId) {
		return false;
	}
	
	if (isLocalhost) {
		return true; // Localhost har developer-rolle
	}
	
	const pool = await getDb();
	const [rolleCheck] = await pool.query(
		'SELECT rolle FROM roller WHERE bruker_id = ?',
		[currentUserId]
	);
	
	if (!Array.isArray(rolleCheck) || rolleCheck.length === 0) {
		return false;
	}
	
	const rolle = (rolleCheck[0] as any).rolle;
	return rolle === 'developer';
}

export const load: PageServerLoad = async ({ url, cookies }) => {
	// Kun tillat for developers
	const isDeveloper = await checkDeveloper(cookies, url);
	
	if (!isDeveloper) {
		throw error(403, 'Kun tilgjengelig for developers');
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

