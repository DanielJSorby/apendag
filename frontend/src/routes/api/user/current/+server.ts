import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, url }) => {
    const userId = cookies.get('UserId');
    
    // Check if user is admin
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    if (!userId) {
        return json({ loggedIn: false, isAdmin: isLocalhost });
    }

    try {
        const pool = await getDb();
        const [rows] = await pool.query('SELECT id, navn, email FROM bruker WHERE id = ?', [userId]);
        const users = rows as any[];
        const user = users.length > 0 ? users[0] : null;

        if (!user) {
            // User ID in cookie but doesn't exist in database
            return json({ loggedIn: false, isAdmin: isLocalhost });
        }

        let isAdmin = isLocalhost;
        
        if (!isLocalhost) {
            const [adminRows] = await pool.query('SELECT bruker_id FROM admin WHERE bruker_id = ?', [userId]);
            const admins = adminRows as any[];
            isAdmin = admins.length > 0;
        }

        return json({
            loggedIn: true,
            isAdmin,
            user: {
                id: user.id,
                name: user.navn,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return json({ loggedIn: false, isAdmin: isLocalhost });
    }
};

