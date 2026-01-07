import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    const userId = cookies.get('UserId');
    const pathname = url.pathname;

    // Unntatt maintenance siden, login, og API calls fra sjekking
    if (pathname !== '/maintenance' && !pathname.startsWith('/api/') && pathname !== '/login' && pathname !== '/logout') {
        try {
            const [maintenanceRows] = await db.query('SELECT is_active FROM maintenance_break LIMIT 1');
            const isMaintenance = Array.isArray(maintenanceRows) && maintenanceRows.length > 0
                ? Boolean(maintenanceRows[0].is_active)
                : false;

            if (isMaintenance) {
                // Sjekk om bruker er developer eller admin
                let isDeveloper = false;
                if (userId) {
                    const [roleCheck] = await db.query(
                        'SELECT rolle FROM roller WHERE bruker_id = ? AND (rolle = ? OR rolle = ?)',
                        [userId, 'developer', 'admin']
                    );
                    isDeveloper = Array.isArray(roleCheck) && roleCheck.length > 0;
                }

                // Hvis ikke developer, redirect til maintenance siden
                if (!isDeveloper) {
                    console.log(`[Layout Load] Redirecting to maintenance page`);
                    throw redirect(303, '/maintenance');
                }
            }
        } catch (error) {
            // Hvis det er en redirect, kast den videre
            if (error instanceof Response) {
                throw error;
            }
            console.error('Error checking maintenance status in layout:', error);
        }
    }

    return {
        url: url.pathname
    };
};
