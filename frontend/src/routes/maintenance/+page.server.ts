import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = cookies.get('UserId');
    
    // Returner bruker ID slik at klienten kan vise hva som må gjøres
    return {
        userId,
        isDeveloper: true // Denne siden vises bare for developers
    };
};
