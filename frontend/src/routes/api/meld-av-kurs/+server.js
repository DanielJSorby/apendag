import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/**
 * @type {import('./$types').RequestHandler}
 */
export async function POST(event) {
    const user = event.locals.user;

    if (!user) {
        return json({ message: 'Du må være logget inn for å melde deg av.' }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
        return json({ message: 'Databaseforbindelse kunne ikke etableres.' }, { status: 500 });
    }
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Hent brukerens nåværende påmelding
        const [userRows] = await connection.query('SELECT paameldt_kurs_id, paameldt_tidspunkt_tekst FROM bruker WHERE id = ? FOR UPDATE', [user.id]);
        
        // @ts-ignore
        if (userRows.length === 0 || !userRows[0].paameldt_kurs_id) {
            await connection.rollback();
            return json({ message: 'Du er ikke påmeldt noe kurs.' }, { status: 404 });
        }

        // @ts-ignore
        const { paameldt_kurs_id: kursId, paameldt_tidspunkt_tekst: tidspunktTekst } = userRows[0];

        // Hent det aktuelle kurset
        const [kursRows] = await connection.query('SELECT * FROM kurs WHERE id = ?', [kursId]);
        // @ts-ignore
        if (kursRows.length === 0) {
            // Dette burde ikke skje hvis databasen er konsistent
            await connection.rollback();
            return json({ message: 'Det påmeldte kurset finnes ikke.' }, { status: 404 });
        }
        // @ts-ignore
        const kurs = kursRows[0];

        // Bestem hvilken kolonne som skal oppdateres
        let tidspunktKolonne;
        if (tidspunktTekst === kurs.tid_for_lunsj) {
            tidspunktKolonne = 'plasser_for';
        } else if (tidspunktTekst === kurs.tid_etter_lunsj) {
            tidspunktKolonne = 'plasser_etter';
        } else if (tidspunktTekst === kurs.tid_siste) {
            tidspunktKolonne = 'plasser_siste';
        } else {
            // Ugyldig tilstand, avbryt
            await connection.rollback();
            return json({ message: 'Påmeldt tidspunkt er ugyldig.' }, { status: 400 });
        }

        // 1. Oppdater (inkrementer) antall plasser i 'kurs'-tabellen
        const updateKursSql = `UPDATE kurs SET ${tidspunktKolonne} = ${tidspunktKolonne} + 1 WHERE id = ?`;
        await connection.query(updateKursSql, [kursId]);

        // 2. Fjern påmeldingen fra 'bruker'-tabellen
        const updateUserSql = 'UPDATE bruker SET paameldt_kurs_id = NULL, paameldt_tidspunkt_tekst = NULL WHERE id = ?';
        await connection.query(updateUserSql, [user.id]);

        await connection.commit();

        return json({ message: 'Du er nå meldt av kurset.' }, { status: 200 });

    } catch (error) {
        await connection.rollback();
        console.error('Databasefeil ved avmelding:', error);
        return json({ message: 'En intern feil oppstod på serveren.' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
