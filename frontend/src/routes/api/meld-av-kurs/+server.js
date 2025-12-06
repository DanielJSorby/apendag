import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

/**
 * @type {import('./$types').RequestHandler}
 */
export async function POST(event) {
    const user = event.locals.user;

    // Sikkerhetssjekk
    if (!user) {
        return json({ message: 'Du må være logget inn for å melde deg av.' }, { status: 401 });
    }

    try {
        // Korrigert SQL til å bruke riktig kolonnenavn 'paameldt_tidspunkt_tekst'
        const sql = 'UPDATE bruker SET paameldt_kurs_id = NULL, paameldt_tidspunkt_tekst = NULL WHERE id = ?';
        await db.query(sql, [user.id]);

        // Sender suksessmelding
        return json({ message: 'Du er nå meldt av kurset.' }, { status: 200 });

    } catch (error) {
        console.error('Databasefeil ved avmelding:', error);
        return json({ message: 'En intern feil oppstod på serveren.' }, { status: 500 });
    }
}
