const { Pool } = require('pg');
const { hashPassword } = require('./src/utils/security');
require('dotenv').config();

async function seedProduction() {
    console.log('🚀 Starting Production Database Seeding...');

    // Normalize connection string (remove sslmode for the Pool config, it's handled via the ssl object)
    const connectionString = process.env.DATABASE_URL.replace('?sslmode=require', '');

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('📦 Creating Schema and Tables...');

        // 1. Create Schema
        await pool.query('CREATE SCHEMA IF NOT EXISTS banking');

        // 2. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS banking.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id VARCHAR(20) UNIQUE NOT NULL,
                account_number VARCHAR(20) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
                status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Create Auth Tokens Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS banking.auth_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES banking.users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                revoked BOOLEAN DEFAULT FALSE,
                UNIQUE(token)
            )
        `);

        // 4. Create Indices
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON banking.users(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_customer_id ON banking.users(customer_id)');

        console.log('👤 Creating Production User...');

        const passwordHash = await hashPassword('SecurePass123');

        await pool.query(`
            INSERT INTO banking.users (customer_id, account_number, full_name, email, password_hash, balance)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO NOTHING
        `, [
            'CUST7742',
            'ACC-921-008',
            'John Doe',
            'john@bank.com',
            passwordHash,
            25400.50
        ]);

        console.log('✅ Production Seeding Completed Successfully!');

    } catch (err) {
        console.error('❌ Seeding Failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedProduction();
