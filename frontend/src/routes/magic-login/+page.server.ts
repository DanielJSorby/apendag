import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { v4 as uuidv4 } from 'uuid';

export const load: PageServerLoad = async ({ url, cookies }) => {
    const token = url.searchParams.get('token');
    if (!token) throw error(400, 'No token provided');

    const [rows] = await db.query(
        'SELECT * FROM magic_link WHERE token = ? AND used = FALSE',
        [token]
    );
    const link = rows[0];

    if (!link) throw error(400, 'Invalid or used token');
    if (new Date(link.expires_at) < new Date()) throw error(400, 'Token expired');

    // Check if this is a signup (bruker_id is null)
    const isSignup = url.searchParams.get('signup') === 'true' || link.bruker_id === null;
    
    let userId: string;

    if (isSignup) {
        // Handle signup: create user account
        const name = url.searchParams.get('name');
        const email = url.searchParams.get('email');

        if (!name || !email) {
            throw error(400, 'Signup data missing');
        }

        // Check if user already exists (someone might have signed up between request and click)
        const [existingRows] = await db.query('SELECT id FROM bruker WHERE email = ?', [email]);
        if (existingRows.length > 0) {
            // User already exists, just log them in
            userId = existingRows[0].id;
        } else {
            // Create new user
            userId = uuidv4();
            await db.query(
                'INSERT INTO bruker (id, navn, email) VALUES (?, ?, ?)',
                [userId, decodeURIComponent(name), decodeURIComponent(email)]
            );
        }

        // Update magic_link to link to the user
        await db.query('UPDATE magic_link SET bruker_id = ? WHERE id = ?', [userId, link.id]);
    } else {
        // Regular login: use existing user
        if (!link.bruker_id) {
            throw error(400, 'Invalid login token');
        }
        userId = link.bruker_id;
    }

    // Mark token as used
    await db.query('UPDATE magic_link SET used = TRUE WHERE id = ?', [link.id]);

    // Set cookie and redirect
    cookies.set('UserId', userId, { path: '/', httpOnly: true });

    throw redirect(302, '/');
};