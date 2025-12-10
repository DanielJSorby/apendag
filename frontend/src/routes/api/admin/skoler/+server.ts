import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET - Hent alle skoler (alfabetisk sortert)
export const GET: RequestHandler = async ({ url }) => {
    try {
        const pool = await getDb();
        const includeInactive = url.searchParams.get('includeInactive') === 'true';
        const query = includeInactive 
            ? 'SELECT * FROM ungdomsskoler ORDER BY aktiv DESC, navn ASC'
            : 'SELECT * FROM ungdomsskoler WHERE aktiv = TRUE ORDER BY navn ASC';
        const [schools] = await pool.query(query);
        return json(schools || []);
    } catch (error) {
        console.error('Error fetching schools:', error);
        return json({ error: 'Kunne ikke hente skoler' }, { status: 500 });
    }
};

// POST - Opprett ny skole
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
        
        const { navn } = await request.json();
        
        if (!navn || navn.trim() === '') {
            return json({ error: 'Skolenavn er påkrevd' }, { status: 400 });
        }
        
        // Sjekk om skolen allerede eksisterer
        const [existing] = await pool.query(
            'SELECT * FROM ungdomsskoler WHERE navn = ?',
            [navn.trim()]
        );
        
        if (Array.isArray(existing) && existing.length > 0) {
            const existingSchool = existing[0];
            // Hvis skolen eksisterer men er deaktivert, aktiver den
            if (!existingSchool.aktiv) {
                await pool.query(
                    'UPDATE ungdomsskoler SET aktiv = TRUE WHERE id = ?',
                    [existingSchool.id]
                );
                return json({ success: true, message: 'Skole aktivert', id: existingSchool.id });
            }
            // Hvis skolen allerede er aktiv, returner feil
            return json({ error: 'Skolen eksisterer allerede' }, { status: 409 });
        }
        
        // Opprett ny skole
        const id = crypto.randomUUID();
        await pool.query(
            'INSERT INTO ungdomsskoler (id, navn, aktiv) VALUES (?, ?, TRUE)',
            [id, navn.trim()]
        );
        
        return json({ success: true, message: 'Skole opprettet', id });
    } catch (error) {
        console.error('Error creating school:', error);
        return json({ error: 'Kunne ikke opprette skole' }, { status: 500 });
    }
};

// DELETE - Deaktiver skole (soft delete)
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
        
        const { id } = await request.json();
        
        if (!id) {
            return json({ error: 'Skole-ID er påkrevd' }, { status: 400 });
        }
        
        // Deaktiver skolen (soft delete)
        await pool.query(
            'UPDATE ungdomsskoler SET aktiv = FALSE WHERE id = ?',
            [id]
        );
        
        return json({ success: true, message: 'Skole deaktivert' });
    } catch (error) {
        console.error('Error deleting school:', error);
        return json({ error: 'Kunne ikke slette skole' }, { status: 500 });
    }
};

// PUT - Aktiver skole igjen eller oppdater navn
export const PUT: RequestHandler = async ({ request, cookies, url }) => {
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
        
        const { id, navn, aktiv } = await request.json();
        
        if (!id) {
            return json({ error: 'Skole-ID er påkrevd' }, { status: 400 });
        }
        
        if (navn !== undefined) {
            await pool.query(
                'UPDATE ungdomsskoler SET navn = ? WHERE id = ?',
                [navn.trim(), id]
            );
        }
        
        if (aktiv !== undefined) {
            await pool.query(
                'UPDATE ungdomsskoler SET aktiv = ? WHERE id = ?',
                [aktiv, id]
            );
        }
        
        return json({ success: true, message: 'Skole oppdatert' });
    } catch (error) {
        console.error('Error updating school:', error);
        return json({ error: 'Kunne ikke oppdatere skole' }, { status: 500 });
    }
};

