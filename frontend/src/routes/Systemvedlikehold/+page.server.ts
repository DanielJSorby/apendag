import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
    try {
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
        
        const [maintenanceRows] = await db.query(
            'SELECT activated_at FROM maintenance_break LIMIT 1'
        );
        
        const activatedAt = Array.isArray(maintenanceRows) && maintenanceRows.length > 0
            ? maintenanceRows[0].activated_at
            : null;

        return {
            activatedAt: activatedAt ? new Date(activatedAt).toLocaleString('no-NO') : 'Ukjent tid'
        };
    } catch (error) {
        console.error('Error loading maintenance data:', error);
        return {
            activatedAt: 'Ukjent tid'
        };
    }
};
