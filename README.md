# Chase Prestige: Advanced Banking Ecosystem V2

## Overview
A high-fidelity, production-hardened Fintech ecosystem designed for institutional-grade security and performance. This V2 release features the **Institutional Oracle** (Staff AI) and a **De-coupled Auth Architecture** for maximum horizontal scalability and data protection.

## Core Pillars
- **Zero-Trust Onboarding**: Controlled internal provisioning of identities.
- **Tiered Credential Silos**: Passwords and PINs are segregated from profile data in dedicated, hardened tables.
- **Institutional AI**: Sovereign analytical core for staff oversight and client concierge services.
- **Stateful JWT Enforcement**: 30-minute session windows with real-time database-backed revocation.

## Deployment & Production Setup

### 1. Strategic Infrastructure
- Managed PostgreSQL (e.g., Aiven) with `banking` schema isolation.
- Global CDN for frontend delivery.

### 2. Zero-Touch Deployment (Render Blueprints)
This project includes a `render.yaml` Blueprint. To deploy both the API and UI in one click:
1. Connect this repository to **Render.com**.
2. Render will automatically detect the Blueprint and provision the **Chase Prestige API V2** and **Chase Prestige Interface V2**.

### 3. Environment Variables
Ensure the following variables are configured for the respective services:

#### API Service (Backend)
- `DATABASE_URL`: Aiven PostgreSQL URI.
- `JWT_SECRET`: High-entropy cryptographic key.
- `FRONTEND_URL`: URL of the deployed UI (e.g., `https://chase-prestige-ui-v2.onrender.com`).
- `NODE_ENV`: `production`

#### Interface Service (Frontend)
- `VITE_API_URL`: URL of the deployed API (e.g., `https://chase-prestige-api-v2.onrender.com`).

---
© 2026 Chase Prestige Institutional Builds.
