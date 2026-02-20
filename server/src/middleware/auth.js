const { verifyToken } = require('../utils/security');
const { pool } = require('../db');

/**
 * PRINCIPAL AUTH MIDDLEWARE
 * Purpose: Enforces JWT integrity and stateful revocation status.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
        }

        // Stateful Revocation Check
        const tokenCheck = await pool.query(
            'SELECT revoked FROM banking.auth_tokens WHERE token = $1',
            [token]
        );

        if (tokenCheck.rows.length === 0 || tokenCheck.rows[0].revoked) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Token has been revoked or session expired' });
        }

        req.user = decoded;
        req.token = token; // Store for logout
        next();
    } catch (err) {
        console.error('[Auth Middleware Error]:', err.message);
        res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
    }
};

const staffOnly = (req, res, next) => {
    if (req.user && req.user.role === 'STAFF') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden', message: 'Staff access required' });
    }
};

module.exports = { authenticate, staffOnly };
