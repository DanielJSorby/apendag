import { getDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, request }) => {
    try {
        const pool = await getDb();
        const userId = cookies.get('UserId');

        // Sjekk om bruker er developer eller admin
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [roleCheck] = await pool.query(
            'SELECT rolle FROM roller WHERE bruker_id = ? AND (rolle = ? OR rolle = ?)',
            [userId, 'developer', 'admin']
        );

        if (!Array.isArray(roleCheck) || roleCheck.length === 0) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }

        // Hent maintenance status
        const [rows] = await pool.query(
            'SELECT is_active, activated_at FROM maintenance_break LIMIT 1'
        );

        const status = Array.isArray(rows) && rows.length > 0 
            ? (rows[0] as any)
            : { is_active: false, activated_at: null };

        return json(status);
    } catch (error) {
        console.error('Error getting maintenance status:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ cookies, request }) => {
    try {
        const pool = await getDb();
        const userId = cookies.get('UserId');

        // Sjekk om bruker er developer eller admin
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [roleCheck] = await pool.query(
            'SELECT rolle FROM roller WHERE bruker_id = ? AND (rolle = ? OR rolle = ?)',
            [userId, 'developer', 'admin']
        );

        if (!Array.isArray(roleCheck) || roleCheck.length === 0) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { is_active } = body;

        // Sjekk om tabellen finnes, hvis ikke, opprett den
        await pool.query(`
            CREATE TABLE IF NOT EXISTS maintenance_break (
                id INT AUTO_INCREMENT PRIMARY KEY,
                is_active BOOLEAN DEFAULT FALSE,
                activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                activated_by VARCHAR(255),
                reason TEXT
            )
        `);

        // Sjekk hvis det allerede finnes en rad
        const [existing] = await pool.query(
            'SELECT id FROM maintenance_break LIMIT 1'
        );

        if (Array.isArray(existing) && existing.length > 0) {
            // Oppdater eksisterende rad
            await pool.query(
                'UPDATE maintenance_break SET is_active = ?, activated_at = CURRENT_TIMESTAMP, activated_by = ? WHERE id = 1',
                [is_active, userId]
            );
        } else {
            // Opprett ny rad
            await pool.query(
                'INSERT INTO maintenance_break (is_active, activated_by) VALUES (?, ?)',
                [is_active, userId]
            );
        }

        return json({ success: true, is_active });
    } catch (error) {
        console.error('Error updating maintenance status:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
