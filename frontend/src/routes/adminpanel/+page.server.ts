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
        
        // Sjekk om bruker har rolle (hopp over for localhost dev admin)
        let userRole = 'developer'; // Default for localhost (høyeste rolle)
        if (!isDevelopmentAdmin) {
            const [rolleCheck] = await pool.query(
                'SELECT bruker_id, rolle FROM roller WHERE bruker_id = ?',
                [userId]
            );
            
            if (!Array.isArray(rolleCheck) || rolleCheck.length === 0) {
                // Bruker har ingen rolle
                throw redirect(303, '/');
            }
            
            userRole = (rolleCheck[0] as any).rolle || 'ingen';
            
            // Kun admin og developer har tilgang
            if (userRole === 'ingen') {
                throw redirect(303, '/');
            }
        }
        
        // Hent alle brukere
        const [users] = await pool.query('SELECT * FROM bruker ORDER BY navn');
        
        // Hent alle brukere med roller
        const [rolleRows] = await pool.query('SELECT bruker_id, rolle FROM roller');
        const adminIds = new Set((rolleRows as any[]).filter(r => r.rolle === 'admin' || r.rolle === 'developer').map(r => r.bruker_id));
        const adminRoles = new Map((rolleRows as any[]).map(r => [r.bruker_id, r.rolle || 'ingen']));
        
        // Tell antall påmeldinger per kurs
        const [courseStats] = await pool.query(`
            SELECT 
                paameldt_kurs_id,
                COUNT(*) as antall
            FROM bruker
            WHERE paameldt_kurs_id IS NOT NULL
            GROUP BY paameldt_kurs_id
        `);
        
        // Hent alle kurs fra databasen
        const [kursListe] = await pool.query('SELECT * FROM kurs ORDER BY id');
        
        // Hent systemvedlikehold status
        const [maintenanceRows] = await pool.query('SELECT activated_at FROM maintenance_break LIMIT 1');
        const activatedAt = Array.isArray(maintenanceRows) && maintenanceRows.length > 0
            ? maintenanceRows[0].activated_at
            : null;
        
        return {
            users: users || [],
            courseStats: courseStats || [],
            adminIds: Array.from(adminIds),
            userRoles: Object.fromEntries(adminRoles),
            currentUserId: userId,
            currentUserRole: userRole,
            isDevelopmentMode: isDevelopmentAdmin,
            kursListe: kursListe || [],
            maintenanceActivatedAt: activatedAt ? new Date(activatedAt).toLocaleString('no-NO') : 'Ukjent tid'
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
