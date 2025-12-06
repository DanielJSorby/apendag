import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

/**
 * @type {import('./$types').RequestHandler}
 */
export async function POST(event) {
    const user = event.locals.user;

    if (!user) {
        return json({ message: 'Du må være logget inn for å melde deg på.' }, { status: 401 });
    }

    const { kursId, tidspunkt } = await event.request.json(); // Endret til kursId

    // Valider at vi har fått det vi trenger
    if (!kursId || !tidspunkt) {
        return json({ message: 'Mangler kurs-ID eller tidspunkt i forespørselen.' }, { status: 400 });
    }

    try {
        // Sjekk om brukeren allerede er påmeldt et kurs
        const [rows] = await db.query('SELECT paameldt_kurs_id FROM bruker WHERE id = ?', [user.id]);
        
        // @ts-ignore
        if (rows[0] && rows[0].paameldt_kurs_id) {
            return json({ message: 'Du er allerede påmeldt et kurs.' }, { status: 409 }); // 409 Conflict
        }

        // Oppdater databasen med det nye kurset og tidspunktet
        const sql = 'UPDATE bruker SET paameldt_kurs_id = ?, paameldt_tidspunkt = ? WHERE id = ?';
        await db.query(sql, [kursId, tidspunkt, user.id]);

        // Send en suksessmelding tilbake
        return json({ message: 'Du er nå påmeldt kurset!' }, { status: 200 });

    } catch (error) {
        console.error('Databasefeil ved påmelding:', error);
        return json({ message: 'En intern feil oppstod på serveren.' }, { status: 500 });
    }
}
