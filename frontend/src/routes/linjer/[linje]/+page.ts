import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
    try {
        const linjeParam = params.linje;
        
        const response = await fetch("/linjer.json");
        
        if (!response.ok) {
            throw new Error(`Failed to load linjer.json: ${response.status}`);
        }
        
        const linjerData = await response.json();
        const linje = linjerData[linjeParam];
        
        if (!linje) {
            throw new Error(`Linje not found: ${linjeParam}`);
        }
        
        return { linje };
    } catch (error) {
        console.error('Error in load function:', error);
        throw error;
    }
};