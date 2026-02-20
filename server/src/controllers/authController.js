const { pool } = require('../db');
const { comparePassword, generateToken } = require('../utils/security');
const jwt = require('jsonwebtoken');

/**
 * PRINCIPAL AUTH CONTROLLER
 * Handles login via identifier (Email or Customer ID)
 */
const login = async (req, res, next) => {
    const { identifier, password } = req.body; // 'identifier' can be email or customer_id

    if (!identifier || !password) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Credentials are required'
        });
    }

    try {
        // Multi-table JOIN to retrieve user profile and sensitive credentials
        const userResult = await pool.query(
            `SELECT u.*, c.password_hash 
             FROM banking.users u 
             JOIN banking.user_credentials c ON u.id = c.user_id 
             WHERE (u.email = $1 OR u.customer_id = $1)`,
            [identifier]
        );
        const user = userResult.rows[0];

        if (!user) {
            console.group('🏦 Authentication Failure Diagnostic');
            console.error('Attempted login with identifier:', identifier);
            console.error('Reason: User not identified in registry');
            console.groupEnd();
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }

        if (user.status !== 'ACTIVE') {
            console.group('🏦 Authentication Failure Diagnostic');
            console.error('Attempted login for user:', user.email || user.customer_id);
            console.error('Reason: Account status restricted', user.status);
            console.groupEnd();
            return res.status(403).json({ error: 'Forbidden', message: 'Account access is restricted or frozen' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }

        // Generate Institutional JWT (30 minute strategic window)
        const token = jwt.sign(
            { id: user.id, email: user.email, customer_id: user.customer_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        const decoded = jwt.decode(token);

        // Stateful Session Persistence (Production Tracking)
        await pool.query(
            'INSERT INTO banking.auth_tokens (user_id, token, expires_at) VALUES ($1, $2, to_timestamp($3))',
            [user.id, token, decoded.exp]
        );

        res.json({
            token,
            user: {
                fullName: user.full_name,
                email: user.email,
                customerId: user.customer_id,
                accountNumber: user.account_number,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const token = req.token;
        // Stateful revocation
        await pool.query('UPDATE banking.auth_tokens SET revoked = true WHERE token = $1', [token]);
        res.json({ message: 'Session terminated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { login, logout };
