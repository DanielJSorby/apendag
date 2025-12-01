export const load = async ({ params, fetch }) => {
    try {
        const linjeParam = params.linje;
        console.log('Loading linje:', linjeParam);
        
        const response = await fetch("/aktiviteter.json");
        
        if (!response.ok) {
            console.error('Failed to load aktiviteter.json:', response.status, response.statusText);
            throw new Error(`Failed to load aktiviteter.json: ${response.status}`);
        }
        
        const aktiviteterData = await response.json();
        
        // Find the linje (kurs) by matching the "linje" field in aktiviteter.json
        let linje = null;
        for (const dag of aktiviteterData.dager || []) {
            if (dag.kurs) {
                const match = dag.kurs.find((k: any) => k.linje === linjeParam);
                if (match) {
                    linje = match;
                    break;
                }
            }
        }
        
        if (!linje) {
            console.error('Linje not found:', linjeParam);
            throw new Error(`Linje not found: ${linjeParam}`);
        }
        
        console.log('Linje found:', linje);
        return { linje };
    } catch (error) {
        console.error('Error in load function:', error);
        throw error;
    }
};