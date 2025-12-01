import { config } from "dotenv";
import mysql from "mysql2/promise";

config();

let dbPool: mysql.Pool | null = null;
let isInitializing = false;

export async function getDb() {
    console.log('getDb called, pool exists:', !!dbPool, 'isInitializing:', isInitializing);
    
    if (!dbPool && !isInitializing) {
        isInitializing = true;
        console.log('Creating new database pool...');
        try {
            dbPool = await mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
            });
            
            // Test the connection to ensure it's working
            await dbPool.query('SELECT 1');
            console.log('Database pool created and tested successfully');
            isInitializing = false;
        } catch (error) {
            console.error('Error creating database pool:', error);
            isInitializing = false;
            throw error;
        }
    } else if (isInitializing) {
        // Wait for initialization to complete
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    return dbPool;
}

// For backward compatibility
export const db = {
    query: async (...args: any[]) => {
        const pool = await getDb();
        // @ts-ignore
        return pool.query(...args);
    }
};