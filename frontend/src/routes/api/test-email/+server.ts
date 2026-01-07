import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendWaitlistNotificationEmail } from '$lib/server/email';
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

export const POST: RequestHandler = async ({ request, url, cookies }) => {
	// Kun tillat for developers
	const isDeveloper = await checkDeveloper(cookies, url);
	
	if (!isDeveloper) {
		return json({ message: 'Kun tilgjengelig for developers' }, { status: 403 });
	}

	try {
		const { email, navn, kursNavn, tidspunkt } = await request.json();

		if (!email || !navn) {
			return json({ message: 'E-post og navn er påkrevd' }, { status: 400 });
		}

		// Send test e-post
		await sendWaitlistNotificationEmail(
			email,
			navn,
			kursNavn || 'Test Kurs',
			tidspunkt || '09:00-10:30'
		);

		return json({ 
			message: 'Test e-post sendt! Sjekk innboksen din (og søppelpost hvis nødvendig).' 
		});

	} catch (err: any) {
		console.error('Error sending test email:', err);
		
		// Gi mer detaljert feilmelding til brukeren
		let errorMessage = 'Kunne ikke sende e-post. ';
		
		if (err.name === 'SMTPAuthError' || err.code === 'EAUTH') {
			errorMessage += 'Autentisering feilet. Sjekk at SMTP_USER og SMTP_PASS er korrekte. ';
			errorMessage += 'For Gmail: Bruk App Password (ikke vanlig passord). ';
			errorMessage += 'For Outlook: Sjekk at "Less secure app access" er aktivert hvis nødvendig.';
		} else if (err.name === 'SMTPEnvelopeError' || err.code === 'EENVELOPE') {
			errorMessage += 'FROM_EMAIL-adressen er ikke gyldig. ';
			errorMessage += 'For Domeneshop wildcard-kontoer: FROM_EMAIL må være en e-postadresse på samme domene som kontoen. ';
			errorMessage += 'Eksempel: Hvis SMTP_USER er "elvebakkenapend1", sett FROM_EMAIL til "noreply@elvebakkenapendag.no"';
		} else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
			errorMessage += 'Kunne ikke koble til SMTP-serveren. Sjekk SMTP_HOST og SMTP_PORT.';
		} else {
			errorMessage += err.message || 'Ukjent feil';
		}
		
		return json({ 
			message: errorMessage,
			error: err.message,
			code: err.code
		}, { status: 500 });
	}
};

