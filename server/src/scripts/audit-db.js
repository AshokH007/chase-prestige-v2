const { Pool } = require('pg');
require('dotenv').config();

async function auditDatabase() {
    console.log('🔍 Auditing live database schema...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''),
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Check if schema exists
        const schemaResult = await pool.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'banking'");
        if (schemaResult.rows.length === 0) {
            console.error('❌ Schema "banking" DOES NOT EXIST.');
        } else {
            console.log('✅ Schema "banking" exists.');

            // 2. Check if users table exists
            const tableResult = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'banking' AND table_name = 'users'");
            if (tableResult.rows.length === 0) {
                console.error('❌ Table "banking.users" DOES NOT EXIST.');
            } else {
                const userCount = await pool.query('SELECT COUNT(*) FROM banking.users');
                console.log(`✅ Table "banking.users" exists with ${userCount.rows[0].count} users.`);
            }
        }
    } catch (err) {
        console.error('❌ Database Audit Failed:', err.message);
    } finally {
        await pool.end();
    }
}

auditDatabase();
