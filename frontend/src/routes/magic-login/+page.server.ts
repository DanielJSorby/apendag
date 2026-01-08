import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';

export const load: PageServerLoad = async ({ url, cookies }) => {
    const token = url.searchParams.get('token');
    if (!token) throw error(400, 'No token provided');

    // Query for the token
    let link;
    try {
        const [rows] = await db.query(
            'SELECT * FROM magic_link WHERE token = ?',
            [token]
        );
        link = rows[0];
        
        if (!link) {
            console.log('[MAGIC_LOGIN] Token not found:', token);
            throw error(400, 'Invalid or used token');
        }
        
        if (new Date(link.expires_at) < new Date()) {
            console.log('[MAGIC_LOGIN] Token expired:', token, 'expires_at:', link.expires_at);
            throw error(400, 'Token expired');
        }
        
        // Check if token has been used (backward compatibility)
        // If use_count exists, allow up to 2 uses
        // If use_count doesn't exist but used=TRUE, allow one more use (Microsoft may have scanned it)
        const hasUseCount = link.use_count !== undefined && link.use_count !== null;
        
        console.log('[MAGIC_LOGIN] Token found:', {
            token: token.substring(0, 8) + '...',
            used: link.used,
            use_count: link.use_count,
            hasUseCount
        });
        
        if (hasUseCount) {
            // New way: check use_count (allow up to 2 uses)
            if (link.use_count >= 2) {
                console.log('[MAGIC_LOGIN] Token already used 2+ times:', link.use_count);
                throw error(400, 'Token has already been used');
            }
        } else {
            // Old way: if used=TRUE, this might be Microsoft's scan - allow user to use it once
            // We'll mark it as used again after this use, but allow this one attempt
            // This handles the case where Microsoft scanned before migration
            if (link.used) {
                console.log('[MAGIC_LOGIN] Token marked as used (old system), allowing one more use');
            }
        }
    } catch (err: any) {
        // If error is about column not found, it's likely a migration issue
        // But SELECT * won't fail if column doesn't exist, so this is unlikely
        console.error('[MAGIC_LOGIN] Error querying token:', err);
        throw err;
    }

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
                const updates: string[] = [];
                const values: any[] = [];
                
                if (ungdomskole) {
                    updates.push('ungdomskole = ?');
                    values.push(decodeURIComponent(ungdomskole));
                }
                if (telefon) {
                    const normalizedTelefon = decodeURIComponent(telefon).trim();
                    // Check if phone number is already in use by another user
                    const [existingPhoneRows] = await db.query('SELECT id FROM bruker WHERE telefon = ? AND id != ?', [normalizedTelefon, userId]);
                    if (existingPhoneRows.length > 0) {
                        throw error(409, 'Telefonnummer er allerede i bruk av en annen bruker.');
                    }
                    updates.push('telefon = ?');
                    values.push(normalizedTelefon);
                }
                
                if (updates.length > 0) {
                    values.push(userId);
                    // Use whitelisted field names only - safe from SQL injection
                    await db.query(
                        `UPDATE bruker SET ${updates.join(', ')} WHERE id = ?`,
                        values
                    );
                }
            }
        } else {
            // Create new user
            // Double-check phone number isn't already in use (race condition protection)
            if (telefon) {
                const normalizedTelefon = decodeURIComponent(telefon).trim();
                const [existingPhoneRows] = await db.query('SELECT id FROM bruker WHERE telefon = ?', [normalizedTelefon]);
                if (existingPhoneRows.length > 0) {
                    throw error(409, 'Telefonnummer er allerede i bruk. Vennligst logg inn i stedet.');
                }
            }
            
            userId = uuidv4();
            
            // Få nåværende tid i +1 GMT (CET/CEST)
            const now = new Date();
            const cetTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3600000)); // +1 time
            const når_laget = cetTime.toISOString().slice(0, 19).replace('T', ' ');
            
            await db.query(
                'INSERT INTO bruker (id, navn, email, ungdomskole, telefon, når_laget) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    userId,
                    decodeURIComponent(name),
                    decodeURIComponent(email),
                    ungdomskole ? decodeURIComponent(ungdomskole) : null,
                    telefon ? decodeURIComponent(telefon).trim() : null,
                    når_laget
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

    // Update token usage (allow up to 2 uses: one for email scanner, one for user)
    const hasUseCount = link.use_count !== undefined && link.use_count !== null;
    
    try {
        if (hasUseCount) {
            // New way: increment use_count
            await db.query(
                'UPDATE magic_link SET use_count = ?, used = TRUE WHERE id = ?',
                [link.use_count + 1, link.id]
            );
        } else {
            // Old way: just mark as used (fallback for backward compatibility)
            // Note: Microsoft may have already set used=TRUE, but that's OK
            await db.query(
                'UPDATE magic_link SET used = TRUE WHERE id = ?',
                [link.id]
            );
        }
    } catch (updateErr: any) {
        // If updating use_count fails (column doesn't exist), fall back to old method
        if (updateErr?.message?.includes('use_count') || updateErr?.code === 'ER_BAD_FIELD_ERROR') {
            console.warn('[MAGIC_LOGIN] use_count column not found during update. Using fallback.');
            await db.query(
                'UPDATE magic_link SET used = TRUE WHERE id = ?',
                [link.id]
            );
        } else {
            throw updateErr;
        }
    }

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