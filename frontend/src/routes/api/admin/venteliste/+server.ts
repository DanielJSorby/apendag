import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Helper function to check admin/developer authorization
async function checkAdminOrDeveloper(cookies: any, url: URL): Promise<string | null> {
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

// GET - Hent alle venteliste-oppføringer med brukerinformasjon
export const GET: RequestHandler = async ({ cookies, url }) => {
    try {
        const userId = await checkAdminOrDeveloper(cookies, url);
        if (!userId) {
            console.error('Venteliste: Not authorized');
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        console.log('Venteliste: User authorized:', userId);
        
        const pool = await getDb();
        console.log('Venteliste: Database pool obtained');
        
        // Først hent alle venteliste-data
        console.log('Venteliste: Executing query...');
        const [rows] = await pool.query(`
            SELECT 
                v.id,
                v.bruker_id,
                v.kurs_id,
                v.tidspunkt_tekst,
                v.studiesuppe,
                v.created_at,
                b.navn as bruker_navn,
                b.email as bruker_email
            FROM venteliste v
            JOIN bruker b ON v.bruker_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
            ORDER BY v.kurs_id, v.tidspunkt_tekst, v.created_at
        `);
        
        console.log('Venteliste: Query returned', (rows as any[]).length, 'rows');
        
        // Beregn position i JavaScript
        const ventelisteData = rows as any[];
        const grouped: Record<string, any[]> = {};
        
        // Grupper etter kurs_id og tidspunkt_tekst
        ventelisteData.forEach(entry => {
            const key = `${entry.kurs_id}-${entry.tidspunkt_tekst}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(entry);
        });
        
        console.log('Venteliste: Grouped into', Object.keys(grouped).length, 'groups');
        
        // Legg til position for hver gruppe
        const result: any[] = [];
        Object.values(grouped).forEach(group => {
            group.forEach((entry, index) => {
                result.push({
                    ...entry,
                    position: index + 1
                });
            });
        });
        
        console.log('Venteliste: Returning', result.length, 'entries');
        return json({ venteliste: result });
    } catch (error) {
        console.error('Error fetching venteliste - DETAILED:', error);
        console.error('Error stack:', (error as Error).stack);
        return json({ error: 'Kunne ikke hente venteliste', details: String(error) }, { status: 500 });
    }
};

// DELETE - Fjern fra venteliste
export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdminOrDeveloper(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const { id } = await request.json();
        
        await pool.query('DELETE FROM venteliste WHERE id = ?', [id]);
        
        return json({ success: true, message: 'Fjernet fra venteliste' });
    } catch (error) {
        console.error('Error removing from venteliste:', error);
        return json({ error: 'Kunne ikke fjerne fra venteliste' }, { status: 500 });
    }
};
