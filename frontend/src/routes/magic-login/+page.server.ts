import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
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
        const ungdomskole = url.searchParams.get('ungdomskole');
        const telefon = url.searchParams.get('telefon');

        if (!name || !email) {
            throw error(400, 'Signup data missing');
        }

        // Check if user already exists (someone might have signed up between request and click)
        const [existingRows] = await db.query('SELECT id FROM bruker WHERE email = ?', [email]);
        if (existingRows.length > 0) {
            // User already exists, just log them in
            userId = existingRows[0].id;
            // Update user info if provided
            if (ungdomskole || telefon) {
                const updateFields = [];
                const updateValues = [];
                if (ungdomskole) {
                    updateFields.push('ungdomskole = ?');
                    updateValues.push(decodeURIComponent(ungdomskole));
                }
                if (telefon) {
                    updateFields.push('telefon = ?');
                    updateValues.push(decodeURIComponent(telefon));
                }
                if (updateFields.length > 0) {
                    updateValues.push(userId);
                    await db.query(
                        `UPDATE bruker SET ${updateFields.join(', ')} WHERE id = ?`,
                        updateValues
                    );
                }
            }
        } else {
            // Create new user
            userId = uuidv4();
            await db.query(
                'INSERT INTO bruker (id, navn, email, ungdomskole, telefon) VALUES (?, ?, ?, ?, ?)',
                [
                    userId,
                    decodeURIComponent(name),
                    decodeURIComponent(email),
                    ungdomskole ? decodeURIComponent(ungdomskole) : null,
                    telefon ? decodeURIComponent(telefon) : null
                ]
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

    const isSecure = url.protocol === 'https:';
    cookies.set('UserId', userId, { 
        path: '/', 
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    throw redirect(302, '/');
};