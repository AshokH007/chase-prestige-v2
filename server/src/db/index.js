const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString ? connectionString.replace('?sslmode=require', '') : connectionString,
  ssl: isProduction ? {
    rejectUnauthorized: false,
  } : {
    rejectUnauthorized: false
  }
});

// Production Auto-Initialization
async function initializeDatabase() {
  console.log('📦 Initializing Production Database...');
  try {
    // 1. Extensions
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // 2. Schema
    await pool.query('CREATE SCHEMA IF NOT EXISTS banking');

    // 3. Users Table (Profile & Meta-data)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id VARCHAR(20) UNIQUE NOT NULL,
        account_number VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'STAFF')),
        balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED', 'FROZEN')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3.1 Credentials Table (Sensitive Auth Material)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.user_credentials (
        user_id UUID PRIMARY KEY REFERENCES banking.users(id) ON DELETE CASCADE,
        password_hash VARCHAR(255) NOT NULL,
        transaction_pin VARCHAR(255),
        last_changed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if role column exists (for migration of existing production DB)
    const roleColCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'banking' AND table_name = 'users' AND column_name = 'role'
    `);

    if (roleColCheck.rows.length === 0) {
      console.log('🔄 Migrating database: Adding role column...');
      await pool.query("ALTER TABLE banking.users ADD COLUMN role VARCHAR(20) DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'STAFF'))");
    }

    // Check if transaction_pin column exists (for migration of existing production DB)
    const pinColCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'banking' AND table_name = 'users' AND column_name = 'transaction_pin'
    `);

    if (pinColCheck.rows.length === 0) {
      console.log('🔄 Migrating database: Adding transaction_pin column...');
      await pool.query("ALTER TABLE banking.users ADD COLUMN transaction_pin VARCHAR(255)");

      // Auto-hash and seed '1234' for existing users during migration
      const bcrypt = require('bcryptjs');
      const defaultPinHash = await bcrypt.hash('1234', 12);
      await pool.query('UPDATE banking.users SET transaction_pin = $1 WHERE transaction_pin IS NULL', [defaultPinHash]);
    }

    // 4. Auth Tokens Table (Stateful Session Tracking)
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

    // --- DATA MIGRATION: Users -> Credentials ---
    console.log('🔄 Checking for legacy credential migration...');
    const legacyCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'banking' AND table_name = 'users' AND column_name = 'password_hash'
    `);

    if (legacyCheck.rows.length > 0) {
      console.log('🚀 Executing Credential Migration...');
      // Copy data to new table if not already present
      await pool.query(`
        INSERT INTO banking.user_credentials (user_id, password_hash, transaction_pin)
        SELECT id, password_hash, transaction_pin 
        FROM banking.users
        ON CONFLICT (user_id) DO NOTHING
      `);
      console.log('✅ Credentials migrated to banking.user_credentials');

      // Decommission legacy columns
      console.log('🚮 Decommissioning legacy auth columns...');
      await pool.query('ALTER TABLE banking.users DROP COLUMN IF EXISTS password_hash');
      await pool.query('ALTER TABLE banking.users DROP COLUMN IF EXISTS transaction_pin');
      console.log('✅ Hardened Tiered Auth Architecture Active');
    }

    // 5. Transactions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES banking.users(id),
        receiver_id UUID REFERENCES banking.users(id),
        amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        type VARCHAR(20) NOT NULL CHECK (type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BILL_PAY')),
        status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
        reference TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if BILL_PAY type exists in constraints
    try {
      await pool.query(`
        ALTER TABLE banking.transactions 
        DROP CONSTRAINT IF EXISTS transactions_type_check,
        ADD CONSTRAINT transactions_type_check CHECK (type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BILL_PAY'))
      `);
    } catch (e) {
      console.log('⚠️ Migration note: Transactions constraint update skipped or already applied.');
    }

    // 6. Loans Table (Enhanced with Institutional features)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES banking.users(id),
        amount NUMERIC(12, 2) NOT NULL,
        apr NUMERIC(5, 2) DEFAULT 5.50,
        term_months INTEGER NOT NULL,
        monthly_emi NUMERIC(12, 2),
        status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'EXTENSION_REQUESTED', 'REPAYMENT')),
        purpose TEXT,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add monthly_emi and approved_at if they don't exist
    const loanCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'banking' AND table_name = 'loans'
    `);
    const existingCols = loanCols.rows.map(c => c.column_name);

    if (!existingCols.includes('monthly_emi')) {
      console.log('🔄 Migrating Loans: Adding monthly_emi column...');
      await pool.query('ALTER TABLE banking.loans ADD COLUMN monthly_emi NUMERIC(12, 2)');
    }
    if (!existingCols.includes('approved_at')) {
      await pool.query('ALTER TABLE banking.loans ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE');
    }

    // Update Status constraint to include EXTENSION_REQUESTED and REPAYMENT
    try {
      await pool.query(`
        ALTER TABLE banking.loans 
        DROP CONSTRAINT IF EXISTS loans_status_check,
        ADD CONSTRAINT loans_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'EXTENSION_REQUESTED', 'REPAYMENT'))
      `);
    } catch (e) {
      console.log('⚠️ Migration note: Loans status constraint update skipped.');
    }

    // 7. Bills Table (Pre-seeded utilities)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES banking.users(id),
        biller_name VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID')),
        category VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Notifications Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES banking.users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Cards Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES banking.users(id) ON DELETE CASCADE,
        card_number VARCHAR(20) UNIQUE NOT NULL,
        card_holder_name VARCHAR(100) NOT NULL,
        expiry_month INTEGER NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
        expiry_year INTEGER NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        style VARCHAR(20) DEFAULT 'METAL' CHECK (style IN ('METAL', 'GOLD', 'TITANIUM')),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'CANCELLED')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Assets Table (Investments)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banking.assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES banking.users(id) ON DELETE CASCADE,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('CRYPTO', 'STOCK', 'ETF')),
        quantity NUMERIC(18, 8) DEFAULT 0 CHECK (quantity >= 0),
        avg_buy_price NUMERIC(12, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, symbol)
      )
    `);

    // 9. Indices
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON banking.users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_customer_id ON banking.users(customer_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_sender ON banking.transactions(sender_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON banking.transactions(receiver_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_loans_user ON banking.loans(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bills_user ON banking.bills(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_cards_user ON banking.cards(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_cards_number ON banking.cards(card_number)');

    // 6. Seed Default Users (Upsert pattern for reliable role provisioning)
    console.log('👤 Synchronizing production identities...');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('SecurePass123', 12);
    const pinHash = await bcrypt.hash('1234', 12);

    // Ensure Client exists
    await pool.query(`
      INSERT INTO banking.users (customer_id, account_number, full_name, email, password_hash, transaction_pin, balance, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET 
        role = EXCLUDED.role,
        transaction_pin = COALESCE(banking.users.transaction_pin, EXCLUDED.transaction_pin)
    `, ['CUST7742', 'ACC-921-008', 'John Doe', 'john@bank.com', hash, pinHash, 25400.50, 'CLIENT']);

    // Ensure Staff exists
    await pool.query(`
      INSERT INTO banking.users (customer_id, account_number, full_name, email, password_hash, role, transaction_pin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET 
        role = EXCLUDED.role,
        transaction_pin = COALESCE(banking.users.transaction_pin, EXCLUDED.transaction_pin)
    `, ['EMP-101', 'OFFICE-MAIN', 'Bank Admin', 'admin@bank.com', hash, 'STAFF', pinHash]);

    console.log('✅ Database Initialization & Role Sync Complete.');

    console.log('✅ Database Initialization Complete.');
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err.message);
  }
}

// Trigger initialization (Always runs to ensure schema/PIN sync)
initializeDatabase();

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    if (!isProduction) {
      console.log('Database connected successfully:', res.rows[0].now);
    }
  }
});

module.exports = {
  query: (text, params) => {
    if (!isProduction) {
      // Simple logging for dev
      console.log(`[DB] Executing: ${text}`, params);
    }
    return pool.query(text, params);
  },
  pool,
};
