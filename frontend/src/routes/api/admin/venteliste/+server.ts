import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET - Hent alle venteliste-oppføringer med brukerinformasjon
export const GET: RequestHandler = async () => {
    try {
        const pool = await getDb();
        const [rows] = await pool.query(`
            SELECT 
                v.*,
                b.navn as bruker_navn,
                b.email as bruker_email,
                ROW_NUMBER() OVER (
                    PARTITION BY v.kurs_id, v.tidspunkt_tekst 
                    ORDER BY v.created_at ASC
                ) as position
            FROM venteliste v
            JOIN bruker b ON v.bruker_id = b.id
            ORDER BY v.kurs_id, v.tidspunkt_tekst, v.created_at
        `);
        
        return json({ venteliste: rows || [] });
    } catch (error) {
        console.error('Error fetching venteliste:', error);
        return json({ error: 'Kunne ikke hente venteliste' }, { status: 500 });
    }
};

// DELETE - Fjern fra venteliste
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const pool = await getDb();
        const { id } = await request.json();
        
        await pool.query('DELETE FROM venteliste WHERE id = ?', [id]);
        
        return json({ success: true, message: 'Fjernet fra venteliste' });
    } catch (error) {
        console.error('Error removing from venteliste:', error);
        return json({ error: 'Kunne ikke fjerne fra venteliste' }, { status: 500 });
    }
};
