import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Helper function to check admin authorization
async function checkAdmin(cookies: any, url: URL): Promise<string | null> {
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
    
    if (!currentUserId) {
        return null;
    }
    
    if (isLocalhost) {
        return currentUserId;
    }
    
    const pool = await getDb();
    const [rolleCheck] = await pool.query(
        'SELECT rolle FROM roller WHERE bruker_id = ?',
        [currentUserId]
    );
    
    if (!Array.isArray(rolleCheck) || rolleCheck.length === 0) {
        return null;
    }
    
    const rolle = (rolleCheck[0] as any).rolle;
    if (rolle !== 'admin' && rolle !== 'developer') {
        return null;
    }
    
    return currentUserId;
}

// GET - Hent alle FAQ spørsmål med display_order
export const GET: RequestHandler = async ({ cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const [questions] = await pool.query(
            'SELECT id, question, answer, display_order FROM faq ORDER BY display_order ASC, id ASC'
        );
        return json({ questions: questions || [] });
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        return json({ error: 'Kunne ikke hente FAQ' }, { status: 500 });
    }
};

// POST - Opprett nytt FAQ spørsmål
export const POST: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const data = await request.json();
        const { question, answer } = data;
        
        if (!question || !answer) {
            return json({ error: 'Spørsmål og svar er påkrevd' }, { status: 400 });
        }
        
        // Finn høyeste display_order og legg til 1
        const [maxOrder] = await pool.query(
            'SELECT MAX(display_order) as max_order FROM faq'
        );
        const maxOrderValue = (maxOrder as any[])[0]?.max_order ?? 0;
        const newOrder = maxOrderValue + 1;
        
        const [result] = await pool.query(
            'INSERT INTO faq (question, answer, display_order) VALUES (?, ?, ?)',
            [question, answer, newOrder]
        );
        
        const insertId = (result as any).insertId;
        
        return json({ success: true, id: insertId, message: 'FAQ spørsmål opprettet' });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return json({ error: 'Kunne ikke opprette FAQ spørsmål' }, { status: 500 });
    }
};

// PUT - Oppdater FAQ spørsmål
export const PUT: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const data = await request.json();
        const { id, question, answer } = data;
        
        if (!id || !question || !answer) {
            return json({ error: 'ID, spørsmål og svar er påkrevd' }, { status: 400 });
        }
        
        await pool.query(
            'UPDATE faq SET question = ?, answer = ? WHERE id = ?',
            [question, answer, id]
        );
        
        return json({ success: true, message: 'FAQ spørsmål oppdatert' });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        return json({ error: 'Kunne ikke oppdatere FAQ spørsmål' }, { status: 500 });
    }
};

// DELETE - Slett FAQ spørsmål
export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const { id } = await request.json();
        
        if (!id) {
            return json({ error: 'ID er påkrevd' }, { status: 400 });
        }
        
        await pool.query('DELETE FROM faq WHERE id = ?', [id]);
        
        return json({ success: true, message: 'FAQ spørsmål slettet' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return json({ error: 'Kunne ikke slette FAQ spørsmål' }, { status: 500 });
    }
};

// PATCH - Reorder FAQ spørsmål
export const PATCH: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const { orders } = await request.json();
        
        if (!Array.isArray(orders)) {
            return json({ error: 'Orders må være en array' }, { status: 400 });
        }
        
        // Update display_order for alle spørsmål
        for (const { id, display_order } of orders) {
            await pool.query(
                'UPDATE faq SET display_order = ? WHERE id = ?',
                [display_order, id]
            );
        }
        
        return json({ success: true, message: 'Rekkefølge oppdatert' });
    } catch (error) {
        console.error('Error reordering FAQ:', error);
        return json({ error: 'Kunne ikke oppdatere rekkefølge' }, { status: 500 });
    }
};

