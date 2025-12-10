import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';
import { db } from '$lib/server/db';
import { sendMagicLinkEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request, url }) => {
    const { name, email, ungdomskole, telefon } = await request.json();

    if (!name || !email || !telefon) {
        return json({ ok: false, message: 'Navn, e-post og telefonnummer er påkrevd' }, { status: 400 });
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
    const params = new URLSearchParams({
        token,
        signup: 'true',
        name,
        email,
        telefon
    });
    if (ungdomskole) params.append('ungdomskole', ungdomskole);
    const magicLink = `${baseUrl}/magic-login?${params.toString()}`;

    // Send verification email
    let emailSent = false;
    let emailError: string | null = null;
    
    try {
        await sendMagicLinkEmail(email, magicLink, name);
        emailSent = true;
        console.log(`[SIGNUP] Verification email sent successfully to ${email}`);
    } catch (error: any) {
        emailError = error?.message || 'Failed to send email';
        console.error('[SIGNUP] Failed to send verification email:', error);
        
        // In production, return error if email fails
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (!isDevelopment) {
            // Clean up the magic link record since we failed to send email
            try {
                await db.query('DELETE FROM magic_link WHERE token = ?', [token]);
            } catch (cleanupError) {
                console.error('[SIGNUP] Failed to cleanup magic_link record:', cleanupError);
            }
            
            return json({ 
                ok: false, 
                message: 'Failed to send verification email. Please check your email configuration or try again later.',
                error: emailError
            }, { status: 500 });
        }
        // In development, continue (might want to log the link)
    }

    return json({ 
        ok: true, 
        message: emailSent 
            ? 'Verification link sent! Please check your email to complete signup.'
            : (process.env.NODE_ENV === 'development' 
                ? 'Verification link created, but email failed. Check server logs for the link.'
                : 'Verification link sent! Please check your email to complete signup.')
    });
};
