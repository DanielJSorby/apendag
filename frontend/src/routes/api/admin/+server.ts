import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET - Hent alle brukere
export const GET: RequestHandler = async () => {
    try {
        const pool = await getDb();
        const [users] = await pool.query('SELECT * FROM bruker ORDER BY id DESC');
        return json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return json({ error: 'Kunne ikke hente brukere' }, { status: 500 });
    }
};

// POST - Opprett ny bruker
export const POST: RequestHandler = async ({ request }) => {
    try {
        const pool = await getDb();
        const data = await request.json();
        const { id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe } = data;
        
        await pool.query(
            'INSERT INTO bruker (id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe) VALUES (?, ?, ?, ?, ?, ?)',
            [id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe]
        );
        
        return json({ success: true, message: 'Bruker opprettet' });
    } catch (error) {
        console.error('Error creating user:', error);
        return json({ error: 'Kunne ikke opprette bruker' }, { status: 500 });
    }
};

// PUT - Oppdater bruker
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const pool = await getDb();
        const data = await request.json();
        const { id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe } = data;
        
        await pool.query(
            'UPDATE bruker SET navn = ?, email = ?, paameldt_kurs_id = ?, paameldt_tidspunkt_tekst = ?, studiesuppe = ? WHERE id = ?',
            [navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe, id]
        );
        
        return json({ success: true, message: 'Bruker oppdatert' });
    } catch (error) {
        console.error('Error updating user:', error);
        return json({ error: 'Kunne ikke oppdatere bruker' }, { status: 500 });
    }
};

// DELETE - Slett bruker
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const pool = await getDb();
        const { id } = await request.json();
        
        // Slett først meldinger fra brukeren (hvis de eksisterer)
        await pool.query('DELETE FROM chat WHERE brukerID = ?', [id]);
        
        // Deretter slett brukeren
        await pool.query('DELETE FROM bruker WHERE id = ?', [id]);
        
        return json({ success: true, message: 'Bruker slettet' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return json({ error: 'Kunne ikke slette bruker' }, { status: 500 });
    }
};
