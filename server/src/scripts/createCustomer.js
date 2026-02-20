const { pool } = require('../db');
const { hashPassword } = require('../utils/security');
const { v4: uuidv4 } = require('uuid');

/**
 * INTERNAL PROVISIONING TOOL
 * Usage: node src/scripts/createCustomer.js <name> <email> <password>
 */

const createCustomer = async (name, email, password) => {
    if (!name || !email || !password) {
        console.error('Usage: node createCustomer.js <name> <email> <password>');
        process.exit(1);
    }

    try {
        console.log(`\n🏦 Banking Provisioning: Starting for ${email}...`);

        // Check for existing
        const existing = await pool.query('SELECT id FROM banking.users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw new Error(`Customer with email ${email} already exists.`);
        }

        // Generate Immutable Bank Identifiers
        const timestamp = Date.now().toString().slice(-6);
        const customerId = `CID-${Math.floor(1000 + Math.random() * 9000)}-${timestamp}`;
        const accountNumber = `BNK-${Math.floor(100000 + Math.random() * 900000)}-${timestamp}`;

        const passwordHash = await hashPassword(password);

        const result = await pool.query(
            `INSERT INTO banking.users 
            (full_name, email, password_hash, customer_id, account_number, balance, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, customer_id, account_number`,
            [name, email, passwordHash, customerId, accountNumber, 0.00, 'ACTIVE']
        );

        const user = result.rows[0];
        console.log('✅ Customer Provisioned Successfully');
        console.log('-----------------------------------');
        console.log(`FULL NAME:      ${name}`);
        console.log(`EMAIL:          ${email}`);
        console.log(`CUSTOMER ID:    ${user.customer_id}`);
        console.log(`ACCOUNT NUMBER: ${user.account_number}`);
        console.log('-----------------------------------');
        console.log('IMPORTANT: Share these credentials via secure channel only.');

    } catch (error) {
        console.error('❌ Provisioning Failed:', error.message);
    } finally {
        pool.end();
    }
};

const args = process.argv.slice(2);
createCustomer(args[0], args[1], args[2]);
