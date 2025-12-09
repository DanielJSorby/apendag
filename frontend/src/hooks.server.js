import { db } from '$lib/server/db';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const userId = event.cookies.get('UserId');

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
