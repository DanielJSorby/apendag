import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/**
 * @type {import('./$types').RequestHandler}
 */
export async function POST(event) {
    const user = event.locals.user;

    if (!user) {
        return json({ message: 'Du må være logget inn for å melde deg av ventelisten.' }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
        return json({ message: 'Databaseforbindelse kunne ikke etableres.' }, { status: 500 });
    }
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Sjekk om brukeren er på venteliste
        const [waitlistRows] = await connection.query(
            'SELECT id, kurs_id, tidspunkt_tekst FROM venteliste WHERE bruker_id COLLATE utf8mb4_unicode_ci = ? FOR UPDATE',
            [user.id]
        );
        
        // @ts-ignore
        if (waitlistRows.length === 0) {
            await connection.rollback();
            connection.release();
            return json({ message: 'Du er ikke på venteliste for noe kurs.' }, { status: 404 });
        }

        // Fjern brukeren fra ventelisten
        await connection.query(
            'DELETE FROM venteliste WHERE bruker_id COLLATE utf8mb4_unicode_ci = ?',
            [user.id]
        );

        await connection.commit();
        connection.release();

        return json({ message: 'Du er nå meldt av ventelisten.' }, { status: 200 });

    } catch (error) {
        await connection.rollback();
        console.error('Databasefeil ved avmelding fra venteliste:', error);
        return json({ message: 'En intern feil oppstod på serveren.' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

