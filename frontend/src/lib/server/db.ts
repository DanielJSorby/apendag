/**
 * Server-side database connection and ORM setup
 * 
 * This file provides database connection pooling using mysql2,
 * and sets up Sequelize ORM with models and relationships.
 * 
 * For direct database queries, use the 'db' export.
 * For Sequelize operations, use the 'sequelize' export and the defined models.
 */
import { config } from "dotenv";
import * as mysql from "mysql2/promise";
import { Sequelize, DataTypes } from 'sequelize';

config();

// --- mysql2 connection pool ---
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

// --- db.query wrapper ---
export const db = {
    query: async (sql: string, params?: any): Promise<any> => {
        const pool = await getDb();
        return pool.query(sql, params);
    }
};

// --- Sequelize setup ---
export const sequelize = new Sequelize(
	process.env.DB_NAME || '',
	process.env.DB_USER || '',
	process.env.DB_PASSWORD || '',
	{
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT || '3306'),
		dialect: 'mysql',
		dialectModule: mysql.createConnection, // Use mysql2 promise-based connection for Sequelize
		logging: false
	}
);

// --- Sequelize Models ---
export const User = sequelize.define(
	'User',
	{
		id: {
			type: DataTypes.STRING(255),
			primaryKey: true,
			allowNull: false
		},
		navn: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		paameldt_kurs_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		paameldt_tidspunkt_tekst: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		studiesuppe: {
			type: DataTypes.STRING(255),
			allowNull: true
		}
	},
	{
		tableName: 'bruker',
		timestamps: false
	}
);

export const Message = sequelize.define(
	'Message',
	{
		id: {
			type: DataTypes.STRING(255),
			primaryKey: true,
			allowNull: false
		},
		brukerID: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		melding: {
			type: DataTypes.STRING(255),
			allowNull: true
		}
	},
	{
		tableName: 'chat',
		timestamps: false
	}
);

// --- Relationships ---
Message.belongsTo(User, { foreignKey: 'brukerID', targetKey: 'id' });
User.hasMany(Message, { foreignKey: 'brukerID', sourceKey: 'id' });

// --- Database Initialization Function ---
export async function initDB() {
	try {
		await sequelize.authenticate();
		console.log('Database connection established');
		return true;
	} catch (error) {
		console.error('Unable to connect to database:', error);
		return false;
	}
}
