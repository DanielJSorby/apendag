import { db } from './db';

/**
 * Initialize required database tables
 * This ensures all necessary tables exist on application startup
 */
export async function initializeTables() {
    try {
        // Create maintenance_break table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS maintenance_break (
                id INT AUTO_INCREMENT PRIMARY KEY,
                is_active BOOLEAN DEFAULT FALSE,
                activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                activated_by VARCHAR(255),
                reason TEXT
            )
        `);

        // Ensure at least one row exists
        const [existing] = await db.query('SELECT COUNT(*) as count FROM maintenance_break');
        const count = Array.isArray(existing) ? (existing[0] as any).count : 0;
        
        if (count === 0) {
            await db.query(
                'INSERT INTO maintenance_break (is_active, activated_by) VALUES (?, ?)',
                [false, 'system']
            );
        }

        return true;
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
}
