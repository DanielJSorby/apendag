import { db } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    const user = locals.user;
    let paameldtKursId = null;
    let paameldtTidspunktTekst = null; // Ny variabel for tidspunkt

    // Hvis brukeren er "innlogget" (via hooks.server.js)
    if (user) {
        try {
            // Henter både kurs-ID og tidspunkt-tekst fra databasen
            const [rows] = await db.query(
                'SELECT paameldt_kurs_id, paameldt_tidspunkt_tekst FROM bruker WHERE id = ?',
                [user.id]
            );
            
            // @ts-ignore
            if (rows.length > 0 && rows[0].paameldt_kurs_id) {
                // @ts-ignore
                paameldtKursId = rows[0].paameldt_kurs_id;
                // @ts-ignore
                paameldtTidspunktTekst = rows[0].paameldt_tidspunkt_tekst;
            }
        } catch (error) {
            console.error("Databasefeil ved henting av påmeldt kurs:", error);
        }
    }

    // Sender begge verdiene til frontend
    return {
        paameldtKursId: paameldtKursId,
        paameldtTidspunktTekst: paameldtTidspunktTekst
    };
}
