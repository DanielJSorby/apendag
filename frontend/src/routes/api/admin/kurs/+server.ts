import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Helper function to check developer authorization
async function checkDeveloper(cookies: any, url: URL): Promise<string | null> {
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
    
    if (!currentUserId) {
        return null;
    }
    
    if (isLocalhost) {
        return currentUserId; // Localhost har developer-rolle
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
    // Kun developers har tilgang til database-administrasjon
    if (rolle !== 'developer') {
        return null;
    }
    
    return currentUserId;
}

// PUT - Oppdater kurs (kun for developers)
export const PUT: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkDeveloper(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert - kun for developers' }, { status: 403 });
        }
        
        const pool = await getDb();
        const kurs = await request.json();
        
        // Valider data
        if (!kurs.id || !kurs.linje || !kurs.navn) {
            return json({ error: 'Mangler påkrevde felt' }, { status: 400 });
        }
        
        // Oppdater kurs i databasen
        const result = await pool.query(
            `UPDATE kurs SET 
                linje = ?, 
                navn = ?, 
                tid_for_lunsj = ?, 
                tid_etter_lunsj = ?, 
                tid_siste = ?, 
                plasser_for = ?, 
                plasser_etter = ?, 
                plasser_siste = ?
            WHERE id = ?`,
            [
                kurs.linje,
                kurs.navn,
                kurs.tid_for_lunsj || null,
                kurs.tid_etter_lunsj || null,
                kurs.tid_siste || null,
                kurs.plasser_for || 0,
                kurs.plasser_etter || 0,
                kurs.plasser_siste || 0,
                kurs.id
            ]
        );
        
        console.log('Kurs updated:', result);
        
        return json({ success: true, message: 'Kurs oppdatert' });
    } catch (error) {
        console.error('Error updating kurs:', error);
        return json({ error: 'Kunne ikke oppdatere kurs' }, { status: 500 });
    }
};
