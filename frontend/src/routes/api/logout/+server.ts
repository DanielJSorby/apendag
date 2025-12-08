import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // Clear the httpOnly cookie
    cookies.delete('UserId', { path: '/' });
    
    return json({ ok: true, message: 'Logged out successfully' });
};

