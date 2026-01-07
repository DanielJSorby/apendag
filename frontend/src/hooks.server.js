import { db } from '$lib/server/db';
import { initializeTables } from '$lib/server/initDb';
import { redirect } from '@sveltejs/kit';

let dbInitialized = false;

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Initialize database tables on first request
	if (!dbInitialized) {
		await initializeTables();
		dbInitialized = true;
	}

	const userId = event.cookies.get('UserId');
	const url = event.url.pathname;

	// Sjekk maintenance mode (unntatt API calls, maintenance siden, og login)
	if (url !== '/maintenance' && !url.startsWith('/api/') && url !== '/login' && url !== '/logout') {
		try {
			const [maintenanceRows] = await db.query('SELECT is_active FROM maintenance_break LIMIT 1');
			const isMaintenance = Array.isArray(maintenanceRows) && maintenanceRows.length > 0 
				? Boolean(maintenanceRows[0].is_active)
				: false;

			console.log(`[Maintenance Check] URL: ${url}, Maintenance Active: ${isMaintenance}, User: ${userId || 'none'}`);

			if (isMaintenance) {
				// Sjekk om bruker er developer eller admin
				let isDeveloper = false;
				if (userId) {
					const [roleCheck] = await db.query(
						'SELECT rolle FROM roller WHERE bruker_id = ? AND (rolle = ? OR rolle = ?)',
						[userId, 'developer', 'admin']
					);
					isDeveloper = Array.isArray(roleCheck) && roleCheck.length > 0;
					console.log(`[Maintenance Check] User ${userId} is developer: ${isDeveloper}`);
				} else {
					console.log(`[Maintenance Check] No user logged in`);
				}

				// Hvis ikke developer, redirect til maintenance siden
				if (!isDeveloper) {
					console.log(`[Maintenance] Redirecting ${userId ? userId : 'unauthenticated user'} to maintenance page`);
					throw redirect(303, '/maintenance');
				}
			}
		} catch (error) {
			// Hvis det er en redirect, kast den videre
			if (error instanceof Response) {
				throw error;
			}
			console.error('Feil ved sjekking av maintenance status:', error);
		}
	}

	if (userId) {
		try {
			const [userRows] = await db.query('SELECT id, navn, email FROM bruker WHERE id = ?', [userId]);
			// @ts-ignore
			if (userRows.length > 0) {
				// @ts-ignore
				event.locals.user = {
					// @ts-ignore
					id: userRows[0].id,
					// @ts-ignore
					navn: userRows[0].navn,
					// @ts-ignore
					email: userRows[0].email
				};
			} else {
				event.locals.user = null;
			}
		} catch (error) {
			console.error('Databasefeil i hooks:', error);
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
}
