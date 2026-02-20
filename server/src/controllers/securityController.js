const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { derivePinFromToken } = require('../utils/security');

/**
 * Verify Transaction PIN (Session-Derived) and generate a temporary balance token
 */
exports.verifyPinAndGetBalanceToken = async (req, res) => {
    const { pin } = req.body;
    const userId = req.user.id;
    const token = req.token; // From auth middleware

    if (!pin) {
        return res.status(400).json({ message: 'Strategic Authorization Key is required' });
    }

    try {
        // Derive the expected PIN for this specific session token
        const expectedPin = derivePinFromToken(token);

        if (pin !== expectedPin) {
            console.error(`[PIN_MISMATCH] Expected: ${expectedPin} | Received: ${pin} | TokenLen: ${token.length}`);
            return res.status(401).json({
                message: `Identity Verification Failed: Strategic Key Mismatch. (Token Hash Audit: ${token.length}b)`,
                error: 'PIN_MISMATCH'
            });
        }

        // 3. SINGLE-PHASE REVEAL: Fetch balance immediately to avoid second trip
        const balanceResult = await db.query(
            'SELECT balance FROM banking.users WHERE id = $1',
            [userId]
        );

        if (balanceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Account context lost' });
        }

        const balance = balanceResult.rows[0].balance;

        // Create a short-lived token for any subsequent sensitive syncs
        const balanceToken = jwt.sign(
            { id: userId, purpose: 'balance_reveal' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        res.json({ balance, balanceToken });
    } catch (err) {
        console.error('PIN verification error:', err.message);
        res.status(500).json({ message: 'Internal security error - Vault offline' });
    }
};

/**
 * Middleware to verify a balance token
 */
exports.verifyBalanceToken = (req, res, next) => {
    const token = req.headers['x-balance-token'];

    if (!token) {
        return res.status(403).json({ message: 'Secure balance token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== req.user.id || decoded.purpose !== 'balance_reveal') {
            throw new Error('Invalid token scope');
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Secure session expired or invalid' });
    }
};
