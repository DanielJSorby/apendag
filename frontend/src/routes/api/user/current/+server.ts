import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ cookies }) => {
    const userId = cookies.get('UserId');
    
    if (!userId) {
        return json({ loggedIn: false });
    }

    try {
        const [rows] = await db.query('SELECT id, navn, email FROM bruker WHERE id = ?', [userId]);
        const user = rows[0];

        if (!user) {
            // User ID in cookie but doesn't exist in database
            return json({ loggedIn: false });
        }

        return json({
            loggedIn: true,
            user: {
                id: user.id,
                name: user.navn,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return json({ loggedIn: false });
    }
};

