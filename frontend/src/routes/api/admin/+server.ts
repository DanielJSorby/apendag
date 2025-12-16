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
    const [adminCheck] = await pool.query(
        'SELECT * FROM admin WHERE bruker_id = ?',
        [currentUserId]
    );
    
    if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
        return null;
    }
    
    return currentUserId;
}

// GET - Hent alle brukere
export const GET: RequestHandler = async ({ cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const [users] = await pool.query('SELECT * FROM bruker ORDER BY id DESC');
        return json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return json({ error: 'Kunne ikke hente brukere' }, { status: 500 });
    }
};

// Helper function to update available places in kurs table
async function updateKursPlasser(pool: any, kursId: number | null, tidspunkt: string | null, increment: number) {
    if (!kursId || !tidspunkt) return;
    
    // Whitelist of valid field names to prevent SQL injection
    const fieldMap: Record<string, string> = {
        '09:00-10:30': 'plasser_for',
        '11:00-12:30': 'plasser_etter',
        '13:00-14:30': 'plasser_siste'
    };
    
    const plassField = fieldMap[tidspunkt];
    if (!plassField) {
        return; // Unknown time slot
    }
    
    // Use separate queries for each field to avoid template literals in SQL
    if (plassField === 'plasser_for') {
        await pool.query('UPDATE kurs SET plasser_for = plasser_for + ? WHERE id = ?', [increment, kursId]);
    } else if (plassField === 'plasser_etter') {
        await pool.query('UPDATE kurs SET plasser_etter = plasser_etter + ? WHERE id = ?', [increment, kursId]);
    } else if (plassField === 'plasser_siste') {
        await pool.query('UPDATE kurs SET plasser_siste = plasser_siste + ? WHERE id = ?', [increment, kursId]);
    }
}

// POST - Opprett ny bruker
export const POST: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const data = await request.json();
        const { id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe, ungdomskole, telefon } = data;
        
        await pool.query(
            'INSERT INTO bruker (id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe, ungdomskole, telefon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe, ungdomskole || null, telefon || null]
        );
        
        // Decrease available places if user is enrolled in a course
        if (paameldt_kurs_id && paameldt_tidspunkt_tekst) {
            await updateKursPlasser(pool, paameldt_kurs_id, paameldt_tidspunkt_tekst, -1);
        }
        
        return json({ success: true, message: 'Bruker opprettet' });
    } catch (error) {
        console.error('Error creating user:', error);
        return json({ error: 'Kunne ikke opprette bruker' }, { status: 500 });
    }
};

// PUT - Oppdater bruker
export const PUT: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const data = await request.json();
        const { id, navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe, ungdomskole, telefon } = data;
        
        // Get old user data to update places correctly
        const [oldUserData] = await pool.query('SELECT paameldt_kurs_id, paameldt_tidspunkt_tekst FROM bruker WHERE id = ?', [id]);
        const oldUser = (oldUserData as any[])[0];
        
        // Update user
        await pool.query(
            'UPDATE bruker SET navn = ?, email = ?, paameldt_kurs_id = ?, paameldt_tidspunkt_tekst = ?, studiesuppe = ?, ungdomskole = ?, telefon = ? WHERE id = ?',
            [navn, email, paameldt_kurs_id, paameldt_tidspunkt_tekst, studiesuppe, ungdomskole || null, telefon || null, id]
        );
        
        // Update places: free up old slot and occupy new slot
        if (oldUser) {
            const oldKursId = oldUser.paameldt_kurs_id;
            const oldTidspunkt = oldUser.paameldt_tidspunkt_tekst;
            
            // Free up old place if it existed
            if (oldKursId && oldTidspunkt) {
                await updateKursPlasser(pool, oldKursId, oldTidspunkt, 1);
            }
            
            // Occupy new place if selected
            if (paameldt_kurs_id && paameldt_tidspunkt_tekst) {
                await updateKursPlasser(pool, paameldt_kurs_id, paameldt_tidspunkt_tekst, -1);
            }
        }
        
        return json({ success: true, message: 'Bruker oppdatert' });
    } catch (error) {
        console.error('Error updating user:', error);
        return json({ error: 'Kunne ikke oppdatere bruker' }, { status: 500 });
    }
};

// DELETE - Slett bruker
export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return json({ error: 'Ikke autorisert' }, { status: 403 });
        }
        
        const pool = await getDb();
        const { id } = await request.json();
        
        // Get user data to free up their course place
        const [userData] = await pool.query('SELECT paameldt_kurs_id, paameldt_tidspunkt_tekst FROM bruker WHERE id = ?', [id]);
        const user = (userData as any[])[0];
        
        // Slett først meldinger fra brukeren (hvis de eksisterer)
        await pool.query('DELETE FROM chat WHERE brukerID = ?', [id]);
        
        // Deretter slett brukeren
        await pool.query('DELETE FROM bruker WHERE id = ?', [id]);
        
        // Free up the course place if user was enrolled
        if (user && user.paameldt_kurs_id && user.paameldt_tidspunkt_tekst) {
            await updateKursPlasser(pool, user.paameldt_kurs_id, user.paameldt_tidspunkt_tekst, 1);
        }
        
        return json({ success: true, message: 'Bruker slettet' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return json({ error: 'Kunne ikke slette bruker' }, { status: 500 });
    }
};
