const { pool } = require('./src/db');

async function debug() {
    try {
        console.log('--- DB DIAGNOSTIC ---');
        const users = await pool.query("SELECT count(*) FROM banking.users WHERE role = 'CLIENT'");
        console.log('Total Clients:', users.rows[0].count);

        const txs = await pool.query("SELECT count(*) FROM banking.transactions");
        console.log('Total Transactions:', txs.rows[0].count);

        const roles = await pool.query("SELECT DISTINCT role FROM banking.users");
        console.log('Distinct Roles:', roles.rows.map(r => r.role));

        const sampleUser = await pool.query("SELECT full_name, role FROM banking.users LIMIT 1");
        console.log('Sample User:', sampleUser.rows[0]);

        console.log('--- DATA CHECK COMPLETE ---');
    } catch (err) {
        console.error('DIAGNOSTIC FAILED:', err.message);
    } finally {
        process.exit();
    }
}

debug();
