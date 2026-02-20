const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Verify Transaction PIN and generate a temporary balance token
 */
exports.verifyPinAndGetBalanceToken = async (req, res) => {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin) {
        return res.status(400).json({ message: 'Transaction PIN is required' });
    }

    try {
        // Query segregated credentials for transaction authorization
        const result = await db.pool.query('SELECT transaction_pin FROM banking.user_credentials WHERE user_id = $1', [userId]);
        const user = result.rows[0];

        if (!user || !user.transaction_pin) {
            return res.status(400).json({ message: 'Institutional PIN not initialized for this account' });
        }

        const isValid = await bcrypt.compare(pin, user.transaction_pin);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid Transaction Authorization' });
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
