import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, url }) => {
    const isSecure = url.protocol === 'https:';
    cookies.delete('UserId', { 
        path: '/',
        secure: isSecure,
        sameSite: 'lax'
    });
    
    return json({ ok: true, message: 'Logged out successfully' });
};

