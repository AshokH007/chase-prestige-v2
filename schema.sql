-- FinTech Banking Platform - Database Schema
-- Architecture: Isolated schema to support shared database infrastructure

CREATE SCHEMA IF NOT EXISTS banking;

-- 1. Users Table
-- Stores core customer identity and account state
CREATE TABLE IF NOT EXISTS banking.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(20) UNIQUE NOT NULL,      -- Bank-issued (e.g., CUST1001)
    account_number VARCHAR(20) UNIQUE NOT NULL,   -- Bank-issued (e.g., ACC890214)
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Auth Tokens Table
-- Manages session lifecycle and stateful revocation
CREATE TABLE IF NOT EXISTS banking.auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES banking.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    UNIQUE(token)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON banking.users(email);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON banking.users(customer_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON banking.auth_tokens(token);
