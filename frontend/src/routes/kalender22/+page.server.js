import { db } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    const user = locals.user;
    let paameldtKursId = null;
    let paameldtTidspunktTekst = null;
    let ventelisteKursId = null;
    let ventelisteTidspunktTekst = null;
    let kursListe = [];

    try {
        // Henter all kursinformasjon fra den nye 'kurs'-tabellen
        const [kursRows] = await db.query('SELECT * FROM kurs');
        // @ts-ignore
        kursListe = kursRows;

        // Henter påmeldingsstatus for den innloggede brukeren, hvis brukeren finnes
        if (user) {
            const [userRows] = await db.query(
                'SELECT paameldt_kurs_id, paameldt_tidspunkt_tekst FROM bruker WHERE id = ?',
                [user.id]
            );
            
            // @ts-ignore
            if (userRows.length > 0 && userRows[0].paameldt_kurs_id) {
                // @ts-ignore
                paameldtKursId = userRows[0].paameldt_kurs_id;
                // @ts-ignore
                paameldtTidspunktTekst = userRows[0].paameldt_tidspunkt_tekst;
            }

            // Henter venteliste-status for brukeren
            const [ventelisteRows] = await db.query(
                'SELECT kurs_id, tidspunkt_tekst FROM venteliste WHERE bruker_id COLLATE utf8mb4_unicode_ci = ?',
                [user.id]
            );
            
            // @ts-ignore
            if (ventelisteRows.length > 0) {
                // @ts-ignore
                ventelisteKursId = ventelisteRows[0].kurs_id;
                // @ts-ignore
                ventelisteTidspunktTekst = ventelisteRows[0].tidspunkt_tekst;
            }
        }
    } catch (error) {
        console.error("Databasefeil ved lasting av kalenderside:", error);
        // Returnerer tomme data ved feil for å unngå at siden krasjer
        return {
            kursListe: [],
            paameldtKursId: null,
            paameldtTidspunktTekst: null,
            ventelisteKursId: null,
            ventelisteTidspunktTekst: null,
            erLoggetInn: false
        };
    }

    // Sender all data til frontend
    return {
        kursListe: kursListe.map(kurs => ({
            ...kurs,
            tid: {
                forLunsj: kurs.tid_for_lunsj,
                etterLunsj: kurs.tid_etter_lunsj,
                siste: kurs.tid_siste
            },
            plasser: {
                forLunsj: kurs.plasser_for,
                etterLunsj: kurs.plasser_etter,
                siste: kurs.plasser_siste
            }
        })),
        paameldtKursId: paameldtKursId,
        paameldtTidspunktTekst: paameldtTidspunktTekst,
        ventelisteKursId: ventelisteKursId,
        ventelisteTidspunktTekst: ventelisteTidspunktTekst,
        erLoggetInn: user !== null
    };
}
