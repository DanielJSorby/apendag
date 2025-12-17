import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { initDB, Message } from '$lib/server/db';

export const DELETE: RequestHandler = async ({ cookies, url }) => {
    const userId = cookies.get('UserId');
    
    if (!userId) {
        return json({ ok: false, error: 'Ikke innlogget' }, { status: 401 });
    }

    try {
        const pool = await getDb();
        
        // Start transaction-like operations (MySQL doesn't support transactions with mysql2 pool directly)
        // But we'll do all deletes in order and handle errors
        
        // 1. Delete user's messages (if using Sequelize)
        try {
            await initDB();
            await Message.destroy({ where: { brukerID: userId } });
        } catch (err) {
            console.warn('[DELETE_USER] Error deleting messages (might not exist):', err);
        }
        
        // 2. Delete magic links
        await pool.query('DELETE FROM magic_link WHERE bruker_id = ?', [userId]);
        
        // 3. Delete from venteliste (waitlist)
        await pool.query('DELETE FROM venteliste WHERE bruker_id = ?', [userId]);
        
        // 4. Delete from roller (roles)
        await pool.query('DELETE FROM roller WHERE bruker_id = ?', [userId]);
        
        // 5. Delete the user
        const [result] = await pool.query('DELETE FROM bruker WHERE id = ?', [userId]);
        
        const deleteResult = result as any;
        if (deleteResult.affectedRows === 0) {
            return json({ ok: false, error: 'Bruker ikke funnet' }, { status: 404 });
        }
        
        // 6. Clear the cookie
        const isSecure = url.protocol === 'https:';
        cookies.delete('UserId', { 
            path: '/',
            secure: isSecure,
            sameSite: 'lax'
        });
        
        console.log(`[DELETE_USER] User ${userId} deleted successfully`);
        
        return json({ ok: true, message: 'Bruker slettet' });
    } catch (error) {
        console.error('[DELETE_USER] Error deleting user:', error);
        return json({ ok: false, error: 'Kunne ikke slette bruker' }, { status: 500 });
    }
};

