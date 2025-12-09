import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
    try {
        const pool = await getDb();
        
        // Automatisk admin på localhost for utvikling
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        
        let userId = cookies.get('UserId');
        let isDevelopmentAdmin = false;
        
        if (isLocalhost && !userId) {
            // På localhost uten innlogging, bruk dev admin ID
            userId = 'dev-admin-localhost';
            isDevelopmentAdmin = true;
        } else if (!userId) {
            throw redirect(303, '/login');
        }
        
        // Sjekk om bruker er admin (hopp over for localhost dev admin)
        if (!isDevelopmentAdmin) {
            const [adminCheck] = await pool.query(
                'SELECT * FROM admin WHERE bruker_id = ?',
                [userId]
            );
            
            if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
                // Bruker er ikke admin
                throw redirect(303, '/');
            }
        }
        
        // Hent alle brukere
        const [users] = await pool.query('SELECT * FROM bruker ORDER BY navn');
        
        // Hent admin-liste
        const [admins] = await pool.query('SELECT bruker_id FROM admin');
        const adminIds = new Set((admins as any[]).map(a => a.bruker_id));
        
        // Tell antall påmeldinger per kurs
        const [courseStats] = await pool.query(`
            SELECT 
                paameldt_kurs_id,
                COUNT(*) as antall
            FROM bruker
            WHERE paameldt_kurs_id IS NOT NULL
            GROUP BY paameldt_kurs_id
        `);
        
        return {
            users: users || [],
            courseStats: courseStats || [],
            adminIds: Array.from(adminIds),
            currentUserId: userId,
            isDevelopmentMode: isDevelopmentAdmin
        };
    } catch (error) {
        // Hvis det er en redirect, kast den videre
        if (error instanceof Response) {
            throw error;
        }
        
        console.error('Error loading admin data:', error);
        throw redirect(303, '/');
    }
};
