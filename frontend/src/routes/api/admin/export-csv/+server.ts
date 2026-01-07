import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

// Helper function to check admin authorization
async function checkAdmin(cookies: any, url: URL): Promise<string | null> {
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const currentUserId = cookies.get('UserId') || (isLocalhost ? 'dev-admin-localhost' : null);
    
    if (!currentUserId) {
        return null;
    }
    
    if (isLocalhost) {
        return currentUserId;
    }
    
    const pool = await getDb();
    const [rolleCheck] = await pool.query(
        'SELECT rolle FROM roller WHERE bruker_id = ?',
        [currentUserId]
    );
    
    if (!Array.isArray(rolleCheck) || rolleCheck.length === 0) {
        return null;
    }
    
    const rolle = (rolleCheck[0] as any).rolle;
    if (rolle !== 'admin' && rolle !== 'developer') {
        return null;
    }
    
    return currentUserId;
}

// Escape CSV field
function escapeCsvField(field: string | null | undefined): string {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// POST - Export users to CSV
export const POST: RequestHandler = async ({ request, cookies, url }) => {
    try {
        const userId = await checkAdmin(cookies, url);
        if (!userId) {
            return new Response('Ikke autorisert', { status: 403 });
        }
        
        const pool = await getDb();
        const body = await request.json();
        const { selectedLines, selectedFields } = body;
        
        // Validate inputs
        if (!Array.isArray(selectedLines) || selectedLines.length === 0) {
            return new Response('Ingen linjer valgt', { status: 400 });
        }
        
        if (!Array.isArray(selectedFields) || selectedFields.length === 0) {
            return new Response('Ingen felter valgt', { status: 400 });
        }
        
        // Build SQL query to get users registered to courses from selected lines
        const placeholders = selectedLines.map(() => '?').join(',');
        const query = `
            SELECT 
                b.id,
                b.navn,
                b.email,
                b.telefon,
                b.ungdomskole,
                b.paameldt_kurs_id,
                b.paameldt_tidspunkt_tekst,
                b.studiesuppe,
                k.linje,
                k.navn as kurs_navn
            FROM bruker b
            INNER JOIN kurs k ON b.paameldt_kurs_id = k.id
            WHERE k.linje IN (${placeholders})
            AND b.paameldt_kurs_id IS NOT NULL
            ORDER BY k.linje, k.navn, b.navn
        `;
        
        const [users] = await pool.query(query, selectedLines);
        
        if (!Array.isArray(users) || users.length === 0) {
            return new Response('Ingen påmeldte funnet for valgte linjer', { status: 404 });
        }
        
        // Map field names to display names
        const fieldLabels: Record<string, string> = {
            id: 'ID',
            navn: 'Navn',
            email: 'E-post',
            telefon: 'Telefon',
            ungdomskole: 'Ungdomsskole',
            paameldt_kurs_id: 'Kurs ID',
            paameldt_tidspunkt_tekst: 'Tidspunkt',
            studiesuppe: 'Studiesuppe',
            linje: 'Linje',
            kurs_navn: 'Kursnavn'
        };
        
        // Build CSV header
        const headers = selectedFields.map(field => fieldLabels[field] || field);
        const csvRows = [headers.map(escapeCsvField).join(',')];
        
        // Build CSV rows
        for (const user of users as any[]) {
            const row = selectedFields.map(field => {
                // Handle kurs_navn separately
                if (field === 'kurs_navn') {
                    return escapeCsvField(user.kurs_navn);
                }
                return escapeCsvField(user[field]);
            });
            csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        
        // Return CSV file
        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="kurspaameldinger_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return new Response('Kunne ikke eksportere CSV', { status: 500 });
    }
};

