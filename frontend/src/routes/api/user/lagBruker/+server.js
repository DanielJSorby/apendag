import { getDb } from "$lib/server/db";
import { json } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
export async function POST({ request }) {
    try {
        const { name, email} = await request.json();

        if (!name || !email){
            return json({ status: 400, error: "Name, email, and password are required" });
        }

        const db = await getDb();
// @ts-ignore
        const [ existingUsers ] = await db.query(`
            SELECT id FROM bruker WHERE email = ?
        `, [ email ]);
// @ts-ignore
        if (existingUsers.length > 0) {
            return json({ status: 409, error: "Email already in use" });
        }

        const userId = uuidv4();
// @ts-ignore
        const [ result ] = await db.query(`
            INSERT INTO bruker (id, navn, email)
            VALUES (?, ?, ?)
        `, [ userId, name, email]);

        return json({ status: 200, userId: userId, message: "User created successfully" });
    } catch (err) {
        // @ts-ignore
        return json({ status: 500, error: err.message });
    }
}