const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
});

async function checkBalance() {
    try {
        const result = await pool.query('SELECT email, full_name, balance FROM banking.users WHERE email = $1', ['john@bank.com']);
        console.log('--- INSTITUTIONAL LIQUIDITY AUDIT ---');
        console.table(result.rows);
    } catch (err) {
        console.error('Audit Failure:', err.message);
    } finally {
        await pool.end();
    }
}

checkBalance();
