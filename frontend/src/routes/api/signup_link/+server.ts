import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';
import { db } from '$lib/db';
import { sendMagicLinkEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request, url }) => {
    const { name, email } = await request.json();

    if (!name || !email) {
        return json({ ok: false, message: 'Name and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const [existingRows] = await db.query('SELECT id FROM bruker WHERE email = ?', [email]);
    if (existingRows.length > 0) {
        return json({ ok: false, message: 'Email already in use. Please log in instead.' }, { status: 409 });
    }

    // Generate token for signup verification
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Store signup token (bruker_id is null since user doesn't exist yet)
    await db.query(
        'INSERT INTO magic_link (id, bruker_id, token, expires_at) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), null, token, expiresAt]
    );

    // Generate the magic link URL with signup data
    const baseUrl = url.origin;
    const magicLink = `${baseUrl}/magic-login?token=${token}&signup=true&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;

    // Send verification email
    try {
        await sendMagicLinkEmail(email, magicLink, name);
    } catch (error) {
        console.error('Failed to send email (continuing anyway):', error);
    }

    return json({ 
        ok: true, 
        message: 'Verification link sent! Please check your email to complete signup.'
    });
};
