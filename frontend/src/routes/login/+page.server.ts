import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = cookies.get('UserId');
    
    // Hvis bruker er allerede logget inn, redirect til forsiden
    if (userId) {
        throw redirect(303, '/');
    }
    
    return {};
};
