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

// GET - Hent alle linjer (admin endpoint)
export const GET: RequestHandler = async ({ cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const [linjer] = await pool.query('SELECT * FROM linjer ORDER BY id');
        return json({ linjer: linjer || [] });
    } catch (error) {
        console.error('Error fetching linjer:', error);
        return json({ error: 'Kunne ikke hente linjer' }, { status: 500 });
    }
};

// PUT - Oppdater linje
export const PUT: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const data = await request.json();
        const { id, tittel, beskrivelse, langBeskrivelse, bilde, farge, lysfarge, eksternLenke } = data;
        
        if (!id || !tittel || !beskrivelse || !bilde || !farge || !lysfarge) {
            return json({ error: 'Alle påkrevde felt må fylles ut' }, { status: 400 });
        }
        
        await pool.query(
            'UPDATE linjer SET tittel = ?, beskrivelse = ?, langBeskrivelse = ?, bilde = ?, farge = ?, lysfarge = ?, eksternLenke = ? WHERE id = ?',
            [tittel, beskrivelse, langBeskrivelse || null, bilde, farge, lysfarge, eksternLenke || null, id]
        );
        
        return json({ success: true, message: 'Linje oppdatert' });
    } catch (error) {
        console.error('Error updating linje:', error);
        return json({ error: 'Kunne ikke oppdatere linje' }, { status: 500 });
    }
};

