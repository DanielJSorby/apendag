import { getDb } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET - Hent alle linjer (public endpoint)
export const GET: RequestHandler = async () => {
    try {
        const pool = await getDb();
        const [linjer] = await pool.query('SELECT * FROM linjer ORDER BY id');
        
        // Convert to object format like the original JSON
        const linjerObj: Record<string, any> = {};
        (linjer as any[]).forEach((linje: any) => {
            linjerObj[linje.id] = {
                tittel: linje.tittel,
                beskrivelse: linje.beskrivelse,
                langBeskrivelse: linje.langBeskrivelse,
                bilde: linje.bilde,
                farge: linje.farge,
                lysfarge: linje.lysfarge,
                eksternLenke: linje.eksternLenke
            };
        });
        
        return json(linjerObj);
    } catch (error) {
        console.error('Error fetching linjer:', error);
        return json({ error: 'Kunne ikke hente linjer' }, { status: 500 });
    }
};

