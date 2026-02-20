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
            return res.status(401).json({
                message: 'Invalid Strategic Authorization Key for this session',
                error: 'PIN_MISMATCH'
            });
        }

        // Create a short-lived token specifically for balance/sensitive data
        const balanceToken = jwt.sign(
            { id: userId, purpose: 'balance_reveal' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' } // Valid for 5 minutes
        );

        res.json({ balanceToken });
    } catch (err) {
        console.error('PIN verification error:', err.message);
        res.status(500).json({ message: 'Internal security error' });
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
