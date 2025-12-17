import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST - Sett brukerrolle
export const POST: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const pool = await getDb();
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
        
        if (!currentUserId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        // Hent current user sin rolle
        let currentUserRole = 'developer'; // localhost default
        if (!isLocalhost) {
            const [rolleCheck] = await pool.query(
                'SELECT rolle FROM roller WHERE bruker_id = ?',
                [currentUserId]
            );
            
            if (!Array.isArray(rolleCheck) || rolleCheck.length === 0) {
                return json({ error: 'Ikke autorisert' }, { status: 403 });
            }
            
            currentUserRole = (rolleCheck[0] as any).rolle;
            
            // Kun admin eller developer kan gi roller
            if (currentUserRole !== 'admin' && currentUserRole !== 'developer') {
                return json({ error: 'Ikke autorisert' }, { status: 403 });
            }
        }
        
        const { bruker_id, rolle } = await request.json();
        
        // Validere rolle-verdi
        if (!['ingen', 'admin', 'developer'].includes(rolle)) {
            return json({ error: 'Ugyldig rolle' }, { status: 400 });
        }
        
        // Rolle-hierarki: Kun developer kan gi developer-rolle
        if (rolle === 'developer' && currentUserRole !== 'developer') {
            return json({ error: 'Kun developers kan gi developer-rolle' }, { status: 403 });
        }
        
        // Sjekk at brukeren eksisterer
        const [userCheck] = await pool.query(
            'SELECT * FROM bruker WHERE id = ?',
            [bruker_id]
        );
        
        if (!Array.isArray(userCheck) || userCheck.length === 0) {
            return json({ error: 'Bruker finnes ikke' }, { status: 404 });
        }
        
        if (rolle === 'ingen') {
            // Fjern fra roller-tabell
            await pool.query(
                'DELETE FROM roller WHERE bruker_id = ?',
                [bruker_id]
            );
        } else {
            // Legg til eller oppdater rolle
            await pool.query(
                'INSERT INTO roller (bruker_id, rolle) VALUES (?, ?) ON DUPLICATE KEY UPDATE rolle = ?',
                [bruker_id, rolle, rolle]
            );
        }
        
        return json({ success: true, message: 'Rolle oppdatert' });
    } catch (error) {
        console.error('Error updating role:', error);
        return json({ error: 'Kunne ikke oppdatere rolle' }, { status: 500 });
    }
};

// DELETE - Fjern rolle (legacy endpoint - bruk POST med rolle='ingen')
export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const pool = await getDb();
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
        
        if (!currentUserId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        // Sjekk at forespørselen kommer fra en med rolle (hopp over for localhost)
        if (!isLocalhost) {
            const [rolleCheck] = await pool.query(
                'SELECT rolle FROM roller WHERE bruker_id = ?',
                [currentUserId]
            );
            
            if (!Array.isArray(rolleCheck) || rolleCheck.length === 0) {
                return json({ error: 'Ikke autorisert' }, { status: 403 });
            }
            
            const currentUserRole = (rolleCheck[0] as any).rolle;
            if (currentUserRole !== 'admin' && currentUserRole !== 'developer') {
                return json({ error: 'Ikke autorisert' }, { status: 403 });
            }
        }
        
        const { bruker_id } = await request.json();
        
        // Ikke la bruker fjerne seg selv
        if (bruker_id === currentUserId) {
            return json({ error: 'Du kan ikke fjerne din egen rolle' }, { status: 400 });
        }
        
        // Fjern rolle
        await pool.query(
            'DELETE FROM roller WHERE bruker_id = ?',
            [bruker_id]
        );
        
        return json({ success: true, message: 'Rolle fjernet' });
    } catch (error) {
        console.error('Error removing role:', error);
        return json({ error: 'Kunne ikke fjerne rolle' }, { status: 500 });
    }
};
