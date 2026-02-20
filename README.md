# B2C Digital Banking Platform Simulation

## Overview
A production-hardened B2C consumer banking web platform simulation designed for security, auditability, and data isolation. This project demonstrates high-fidelity Fintech engineering standards, utilizing a shared database infrastructure with strict schema isolation.

## Core Principles
- **No Self-Registration**: Customer onboarding is a controlled internal process. No public signup interfaces are exposed to the internet.
- **Identity Isolation**: All sensitive data is derived exclusively from cryptographic JWT claims.
- **Stateful Session Control**: JWTs are short-lived (30 minutes) and backed by a database revocation layer for immediate session termination.

## System Architecture

### 1. Database & Schema
The platform operates on a dedicated `banking` schema within a shared PostgreSQL database.
- **Schema**: `banking`
- **Isolation**: Strictly isolated from other system tables.
- **Security**: Enforced SSL and parameterized queries.

### 2. Onboarding Workflow
New customers are provisioned via internal security tools.
- **Bank-Issued Identifiers**: Immutable `customer_id` and `account_number` are generated upon provisioning.
- **Credential Storage**: Bcrypt (rounds: 12) hashing for data-at-rest protection.

### 3. Authentication Protocol
- **Method**: Bearer JWT.
- **Revocation Model**: Stateful tracking in `banking.auth_tokens`.
- **Validation Pipeline**:
  1. Header Parsing
  2. Signature Verification
  3. Database Revocation Status Check
  4. Expiry Validation

## API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Authenticate via email/customer_id |
| POST | `/api/auth/logout` | Terminate session and revoke token |
| GET | `/api/account/profile` | Retrieve authenticated identity |
| GET | `/api/account/balance` | Retrieve real-time account ledger |

## Deployment & Setup

### 1. Database Infrastructure
- Provision Managed PostgreSQL (e.g., Aiven).
- Apply `schema.sql` to initialize the `banking` namespace.

### 2. Backend Deployment (Render.com)
1. **Connect Repository**: Point Render to your GitHub repo.
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL`: Connection string.
   - `JWT_SECRET`: Random 256-bit key.
   - `FRONTEND_URL`: URL of your deployed frontend.

### 3. Frontend Deployment (Vercel/Netlify)
1. **Root Directory**: `client`
2. **Build Command**: `npm run build`
3. **Environment Variables**:
   - `VITE_API_URL`: The URL of your live Render backend.

---
© 2026 FinTech Solutions Corp. Professional Internal Build.
