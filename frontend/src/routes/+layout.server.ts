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
                        'SELECT rolle FROM roller WHERE bruker_id = ? AND rolle = ?',
                        [userId, 'developer']
                    );
                    isDeveloper = Array.isArray(roleCheck) && roleCheck.length > 0;
                }

                // Hvis ikke developer, redirect til maintenance siden
                if (!isDeveloper) {
                    throw redirect(303, '/maintenance');
                }
            }
        } catch (error) {
            // Hvis det er en redirect error, re-throw den
            if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
                throw error;
            }
            console.error('Error checking maintenance status in layout:', error);
        }
    }

    return {
        url: url.pathname
    };
};
