const { pool } = require('./src/db');

async function checkBalance() {
    try {
        const result = await pool.query('SELECT email, full_name, balance FROM banking.users WHERE email = $1', ['john@bank.com']);
        console.log('--- INSTITUTIONAL LIQUIDITY AUDIT ---');
        console.table(result.rows);
        process.exit(0);
    } catch (err) {
        console.error('Audit Failure:', err.message);
        process.exit(1);
    }
}

checkBalance();
