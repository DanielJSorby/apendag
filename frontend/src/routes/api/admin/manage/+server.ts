import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST - Legg til admin
export const POST: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const pool = await getDb();
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
        
        if (!currentUserId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        // Sjekk at forespørselen kommer fra en admin (hopp over for localhost)
        if (!isLocalhost) {
            const [adminCheck] = await pool.query(
                'SELECT * FROM admin WHERE bruker_id = ?',
                [currentUserId]
            );
            
            if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
                return json({ error: 'Ikke autorisert' }, { status: 403 });
            }
        }
        
        const { bruker_id } = await request.json();
        
        // Sjekk at brukeren eksisterer
        const [userCheck] = await pool.query(
            'SELECT * FROM bruker WHERE id = ?',
            [bruker_id]
        );
        
        if (!Array.isArray(userCheck) || userCheck.length === 0) {
            return json({ error: 'Bruker finnes ikke' }, { status: 404 });
        }
        
        // Legg til admin
        await pool.query(
            'INSERT IGNORE INTO admin (bruker_id) VALUES (?)',
            [bruker_id]
        );
        
        return json({ success: true, message: 'Admin-rettigheter gitt' });
    } catch (error) {
        console.error('Error adding admin:', error);
        return json({ error: 'Kunne ikke legge til admin' }, { status: 500 });
    }
};

// DELETE - Fjern admin
export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const pool = await getDb();
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
        
        if (!currentUserId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        // Sjekk at forespørselen kommer fra en admin (hopp over for localhost)
        if (!isLocalhost) {
            const [adminCheck] = await pool.query(
                'SELECT * FROM admin WHERE bruker_id = ?',
                [currentUserId]
            );
            
            if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
                return json({ error: 'Ikke autorisert' }, { status: 403 });
            }
        }
        
        const { bruker_id } = await request.json();
        
        // Ikke la bruker fjerne seg selv som admin
        if (bruker_id === currentUserId) {
            return json({ error: 'Du kan ikke fjerne dine egne admin-rettigheter' }, { status: 400 });
        }
        
        // Fjern admin
        await pool.query(
            'DELETE FROM admin WHERE bruker_id = ?',
            [bruker_id]
        );
        
        return json({ success: true, message: 'Admin-rettigheter fjernet' });
    } catch (error) {
        console.error('Error removing admin:', error);
        return json({ error: 'Kunne ikke fjerne admin' }, { status: 500 });
    }
};
