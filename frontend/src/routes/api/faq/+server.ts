import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET - Hent alle FAQ spørsmål (public endpoint)
export const GET: RequestHandler = async () => {
    try {
        const pool = await getDb();
        const [questions] = await pool.query(
            'SELECT id, question, answer FROM faq ORDER BY display_order ASC, id ASC'
        );
        return json({ questions: questions || [] });
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        return json({ error: 'Kunne ikke hente FAQ' }, { status: 500 });
    }
};

