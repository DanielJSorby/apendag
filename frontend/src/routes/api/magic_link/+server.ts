import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';
import { db } from '$lib/server/db';
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
    let emailSent = false;
    let emailError: string | null = null;
    
    try {
        await sendMagicLinkEmail(email, magicLink, user.navn || undefined);
        emailSent = true;
        console.log(`[LOGIN] Magic link email sent successfully to ${email}`);
    } catch (error: any) {
        emailError = error?.message || 'Failed to send email';
        console.error('[LOGIN] Failed to send magic link email:', error);
        
        // In production, return error if email fails
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (!isDevelopment) {
            return json({ 
                ok: false, 
                message: 'Failed to send email. Please check your email configuration or try again later.',
                error: emailError
            }, { status: 500 });
        }
        // In development, continue and return the link
    }

    // In development mode, also return the link for easy testing
    // In production, only show success message (link sent via email)
    const isDevelopment = process.env.NODE_ENV === 'development';

    return json({ 
        ok: true, 
        message: isDevelopment 
            ? (emailSent 
                ? 'Magic link created! Check email or use link below.' 
                : 'Magic link created! Email failed, but here is the link:')
            : 'Check your email for the magic link!',
        // Only return link in development mode for testing
        magicLink: isDevelopment ? magicLink : undefined
    });
};