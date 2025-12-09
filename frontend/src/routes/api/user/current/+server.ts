import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, url }) => {
    const userId = cookies.get('UserId');
    
    // Check if user is admin
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    if (!userId) {
        return json({ loggedIn: false, isAdmin: isLocalhost });
    }

    try {
        const [rows] = await db.query('SELECT id, navn, email FROM bruker WHERE id = ?', [userId]);
        const user = rows[0];

        if (!user) {
            // User ID in cookie but doesn't exist in database
            return json({ loggedIn: false, isAdmin: isLocalhost });
        }

        let isAdmin = isLocalhost;
        
        if (!isLocalhost) {
            const [adminRows] = await db.query('SELECT bruker_id FROM admin WHERE bruker_id = ?', [userId]);
            isAdmin = adminRows.length > 0;
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

