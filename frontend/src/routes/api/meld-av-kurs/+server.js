import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { sendWaitlistNotificationEmail } from '$lib/server/email';

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

        // Siden vi kun har ett tidspunkt nå, er kolonnen alltid 'plasser_siste'
        const tidspunktKolonne = 'plasser_siste';

        // Valider at det lagrede tidspunktet er det vi forventer
        if (tidspunktTekst !== kurs.tid_siste) {
            // Ugyldig tilstand, avbryt
            await connection.rollback();
            return json({ message: 'Påmeldt tidspunkt er ugyldig.' }, { status: 400 });
        }

        // 1. Oppdater (inkrementer) antall plasser i 'kurs'-tabellen
        const updateKursSql = `UPDATE kurs SET ${tidspunktKolonne} = ${tidspunktKolonne} + 1 WHERE id = ?`;
        await connection.query(updateKursSql, [kursId]);

        // 2. Fjern påmeldingen fra 'bruker'-tabellen og nullstill studiesuppe
        const updateUserSql = 'UPDATE bruker SET paameldt_kurs_id = NULL, paameldt_tidspunkt_tekst = NULL, studiesuppe = NULL WHERE id = ?';
        await connection.query(updateUserSql, [user.id]);

        // 3. Sjekk om det er noen på venteliste for dette kurset/tidspunktet
        const [waitlistRows] = await connection.query(
            `SELECT v.id, v.bruker_id, b.navn, b.email 
             FROM venteliste v 
             INNER JOIN bruker b ON v.bruker_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci 
             WHERE v.kurs_id = ? AND v.tidspunkt_tekst = ? 
             ORDER BY v.created_at ASC 
             LIMIT 1`,
            [kursId, tidspunktTekst]
        );

        // @ts-ignore
        if (waitlistRows.length > 0) {
            const waitlistEntry = waitlistRows[0];
            const waitlistUserId = waitlistEntry.bruker_id;
            const waitlistUserName = waitlistEntry.navn;
            const waitlistUserEmail = waitlistEntry.email;

            // Sjekk om ventelistebrukeren fortsatt ikke er påmeldt et annet kurs
            const [waitlistUserRows] = await connection.query(
                'SELECT paameldt_kurs_id FROM bruker WHERE id = ?',
                [waitlistUserId]
            );
            
            // @ts-ignore
            const isWaitlistUserAvailable = !waitlistUserRows[0] || !waitlistUserRows[0].paameldt_kurs_id;

            if (isWaitlistUserAvailable) {
                // Meld ventelistebrukeren på kurset
                // 1. Reduser antall plasser igjen
                const decreaseKursSql = `UPDATE kurs SET ${tidspunktKolonne} = ${tidspunktKolonne} - 1 WHERE id = ?`;
                await connection.query(decreaseKursSql, [kursId]);

                // 2. Oppdater ventelistebrukerens påmelding
                const enrollWaitlistUserSql = 'UPDATE bruker SET paameldt_kurs_id = ?, paameldt_tidspunkt_tekst = ? WHERE id = ?';
                await connection.query(enrollWaitlistUserSql, [kursId, tidspunktTekst, waitlistUserId]);

                // 3. Fjern fra venteliste
                await connection.query('DELETE FROM venteliste WHERE id = ?', [waitlistEntry.id]);

                await connection.commit();
                connection.release();

                // Send e-post til ventelistebrukeren (utenfor transaksjonen for å unngå å holde transaksjonen åpen)
                try {
                    // Hent kursnavn fra aktiviteter.json eller bruk standard
                    let kursNavn = 'Kurset';
                    try {
                        // Prøv å hente kursnavn fra databasen hvis det finnes
                        if (kurs.navn) {
                            kursNavn = kurs.navn;
                        }
                    } catch (e) {
                        // Fallback til standard navn
                    }
                    
                    await sendWaitlistNotificationEmail(
                        waitlistUserEmail,
                        waitlistUserName || '',
                        kursNavn,
                        tidspunktTekst
                    );
                } catch (emailError) {
                    // Log email error but don't fail the request
                    console.error('Failed to send waitlist notification email:', emailError);
                }

                return json({ message: 'Du er nå meldt av kurset. En person fra ventelisten har fått plassen din.' }, { status: 200 });
            } else {
                // Ventelistebrukeren er allerede påmeldt et annet kurs, hopp over dem
                // Fjern dem fra ventelisten og prøv neste
                await connection.query('DELETE FROM venteliste WHERE id = ?', [waitlistEntry.id]);
                
                // Prøv å finne neste person på ventelisten
                const [nextWaitlistRows] = await connection.query(
                    `SELECT v.id, v.bruker_id, b.navn, b.email 
                     FROM venteliste v 
                     INNER JOIN bruker b ON v.bruker_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci 
                     WHERE v.kurs_id = ? AND v.tidspunkt_tekst = ? 
                     ORDER BY v.created_at ASC 
                     LIMIT 1`,
                    [kursId, tidspunktTekst]
                );

                // @ts-ignore
                if (nextWaitlistRows.length > 0) {
                    const nextWaitlistEntry = nextWaitlistRows[0];
                    const nextWaitlistUserId = nextWaitlistEntry.bruker_id;
                    const nextWaitlistUserName = nextWaitlistEntry.navn;
                    const nextWaitlistUserEmail = nextWaitlistEntry.email;

                    const [nextUserRows] = await connection.query(
                        'SELECT paameldt_kurs_id FROM bruker WHERE id = ?',
                        [nextWaitlistUserId]
                    );
                    
                    // @ts-ignore
                    const isNextUserAvailable = !nextUserRows[0] || !nextUserRows[0].paameldt_kurs_id;

                    if (isNextUserAvailable) {
                        // Meld neste person på
                        const decreaseKursSql = `UPDATE kurs SET ${tidspunktKolonne} = ${tidspunktKolonne} - 1 WHERE id = ?`;
                        await connection.query(decreaseKursSql, [kursId]);

                        const enrollWaitlistUserSql = 'UPDATE bruker SET paameldt_kurs_id = ?, paameldt_tidspunkt_tekst = ? WHERE id = ?';
                        await connection.query(enrollWaitlistUserSql, [kursId, tidspunktTekst, nextWaitlistUserId]);

                        await connection.query('DELETE FROM venteliste WHERE id = ?', [nextWaitlistEntry.id]);

                        await connection.commit();
                        connection.release();

                        try {
                            // Hent kursnavn fra aktiviteter.json eller bruk standard
                            let kursNavn = 'Kurset';
                            try {
                                if (kurs.navn) {
                                    kursNavn = kurs.navn;
                                }
                            } catch (e) {
                                // Fallback til standard navn
                            }
                            
                            await sendWaitlistNotificationEmail(
                                nextWaitlistUserEmail,
                                nextWaitlistUserName || '',
                                kursNavn,
                                tidspunktTekst
                            );
                        } catch (emailError) {
                            console.error('Failed to send waitlist notification email:', emailError);
                        }

                        return json({ message: 'Du er nå meldt av kurset. En person fra ventelisten har fått plassen din.' }, { status: 200 });
                    }
                }
            }
        }

        await connection.commit();
        connection.release();

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
