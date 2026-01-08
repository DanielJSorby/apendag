import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
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
