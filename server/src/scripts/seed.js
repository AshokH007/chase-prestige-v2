const { pool } = require('../db');
const { hashPassword } = require('../utils/security');
const fs = require('fs');
const path = require('path');

const seed = async () => {
    try {
        console.log('Seeding database...');

        // 1. Run Schema (Creates banking schema and tables)
        const schemaPath = path.join(__dirname, '../../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('Schema applied.');

        // 2. Check if user exists in banking schema
        const checkUser = await pool.query("SELECT * FROM banking.users WHERE email = 'demo@example.com'");
        if (checkUser.rows.length > 0) {
            console.log('Demo user already exists.');
            return;
        }

        // 3. Create Demo User
        const passwordHash = await hashPassword('password123');
        await pool.query(
            `INSERT INTO banking.users (customer_id, account_number, full_name, email, password_hash, balance)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            ['CUST1001', 'ACC9876543210', 'John Doe', 'demo@example.com', passwordHash, 5000.00]
        );

        console.log('Demo user created: demo@example.com / password123');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        pool.end();
    }
};

seed();
