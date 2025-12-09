import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    // Check if user is already logged in
    const userId = cookies.get('UserId');
    if (userId) {
        throw redirect(302, '/');
    }
    
    // Return empty data if not logged in (page will render normally)
    return {};
};