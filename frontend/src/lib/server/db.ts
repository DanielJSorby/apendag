/**
 * Server-side database connection pool
 * 
 * This file provides low-level database connection pool management.
 * Use getDb() when you need direct access to the connection pool.
 * 
 * For convenient query wrapper and Sequelize models, use '$lib/db' instead.
 */
import { config } from "dotenv";
import * as mysql from "mysql2/promise";

config();

let dbPool: mysql.Pool | null = null;
let initializationPromise: Promise<mysql.Pool> | null = null;

export async function getDb(): Promise<mysql.Pool> {
    // If pool already exists, return it
    if (dbPool) {
        return dbPool;
    }
    
    // If initialization is in progress, wait for it
    if (initializationPromise) {
        return initializationPromise;
    }
    
    // Start initialization
    initializationPromise = (async () => {
        console.log('Creating new database pool...');
        try {
            const pool = await mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
            });
            
            // Test the connection to ensure it's working
            await pool.query('SELECT 1');
            console.log('Database pool created and tested successfully');
            
            dbPool = pool;
            return pool;
        } catch (error) {
            console.error('Error creating database pool:', error);
            // Reset promise so we can retry
            initializationPromise = null;
            throw error;
        }
    })();
    
    return initializationPromise;
}

// Note: For a convenient db.query() wrapper, use the 'db' export from '$lib/db.ts'
// This file only exports getDb() for direct pool access when needed
