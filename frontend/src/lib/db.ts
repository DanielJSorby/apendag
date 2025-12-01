import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Set up Sequelize connection
export const sequelize = new Sequelize(
	process.env.DB_NAME || '',
	process.env.DB_USER || '',
	process.env.DB_PASSWORD || '',
	{
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT || '3306'),
		dialect: 'mariadb',
		logging: false
	}
);

// User Model (bruker table)
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
		kursfor: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		kursetter: {
			type: DataTypes.STRING(255),
			allowNull: true
		}
	},
	{
		tableName: 'bruker',
		timestamps: false
	}
);

// Message Model (chat table)
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

// Define relationships
Message.belongsTo(User, { foreignKey: 'brukerID', targetKey: 'id' });
User.hasMany(Message, { foreignKey: 'brukerID', sourceKey: 'id' });

// Initialize database connection
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
