import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';
import { db } from '$lib/db';
import { sendMagicLinkEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request, url }) => {
    const { email } = await request.json();

    const [rows] = await db.query('SELECT * FROM bruker WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return json({ ok: false, message: 'User not found' }, { status: 404 });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await db.query(
        'INSERT INTO magic_link (id, bruker_id, token, expires_at) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), user.id, token, expiresAt]
    );

    // Generate the magic link URL using the request origin
    const baseUrl = url.origin;
    const magicLink = `${baseUrl}/magic-login?token=${token}`;

    // Try to send email
    try {
        await sendMagicLinkEmail(email, magicLink, user.navn || undefined);
    } catch (error) {
        console.error('Failed to send email (continuing anyway):', error);
        // In development, we'll still return the link even if email fails
    }

    // In development mode, also return the link for easy testing
    // In production, only show success message (link sent via email)
    const isDevelopment = process.env.NODE_ENV === 'development';

    return json({ 
        ok: true, 
        message: isDevelopment 
            ? 'Magic link created! Check email or use link below.' 
            : 'Check your email for the magic link!',
        // Only return link in development mode for testing
        magicLink: isDevelopment ? magicLink : undefined
    });
};