import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/**
 * @type {import('./$types').RequestHandler}
 */
export async function POST(event) {
    const user = event.locals.user;

    if (!user) {
        return json({ message: 'Du må være logget inn for å melde deg på.' }, { status: 401 });
    }

    const { kursId, tidspunktTekst, studiesuppe } = await event.request.json();

    if (!kursId || !tidspunktTekst) {
        return json({ message: 'Mangler kurs-ID eller tidspunkt i forespørselen.' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
        return json({ message: 'Databaseforbindelse kunne ikke etableres.' }, { status: 500 });
    }
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Hent det aktuelle kurset for å sjekke tidspunkter og antall plasser
        const [kursRows] = await connection.query('SELECT * FROM kurs WHERE id = ? FOR UPDATE', [kursId]);
        // @ts-ignore
        if (kursRows.length === 0) {
            await connection.rollback();
            connection.release();
            return json({ message: 'Kurset finnes ikke.' }, { status: 404 });
        }
        // @ts-ignore
        const kurs = kursRows[0];

        // Bestem hvilken kolonne som skal oppdateres basert på tidspunktTekst
        let tidspunktKolonne;
        if (tidspunktTekst === kurs.tid_for_lunsj) {
            tidspunktKolonne = 'plasser_for';
        } else if (tidspunktTekst === kurs.tid_etter_lunsj) {
            tidspunktKolonne = 'plasser_etter';
        } else if (tidspunktTekst === kurs.tid_siste) {
            tidspunktKolonne = 'plasser_siste';
        } else {
            await connection.rollback();
            connection.release();
            return json({ message: 'Ugyldig tidspunkt.' }, { status: 400 });
        }

        // Sjekk om det er ledige plasser
        if (kurs[tidspunktKolonne] <= 0) {
            await connection.rollback();
            connection.release();
            return json({ message: 'Det er ingen ledige plasser på dette tidspunktet.' }, { status: 409 });
        }

        // Sjekk om brukeren allerede er påmeldt et kurs
        const [rows] = await connection.query('SELECT paameldt_kurs_id FROM bruker WHERE id = ?', [user.id]);
        
        // @ts-ignore
        if (rows[0] && rows[0].paameldt_kurs_id) {
            await connection.rollback();
            connection.release();
            return json({ message: 'Du er allerede påmeldt et kurs.' }, { status: 409 }); // 409 Conflict
        }

        // 1. Oppdater antall plasser i 'kurs'-tabellen
        const updateKursSql = `UPDATE kurs SET ${tidspunktKolonne} = ${tidspunktKolonne} - 1 WHERE id = ?`;
        await connection.query(updateKursSql, [kursId]);

        // 2. Oppdater brukerens påmelding
        const studiesuppeVerdi = studiesuppe ? 'ja' : null;
        const updateUserSql = 'UPDATE bruker SET paameldt_kurs_id = ?, paameldt_tidspunkt_tekst = ?, studiesuppe = ? WHERE id = ?';
        await connection.query(updateUserSql, [kursId, tidspunktTekst, studiesuppeVerdi, user.id]);

        await connection.commit();

        return json({ message: 'Du er nå påmeldt kurset!' }, { status: 200 });

    } catch (error) {
        await connection.rollback();
        console.error('Databasefeil ved påmelding:', error);
        return json({ message: 'En intern feil oppstod på serveren.' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
