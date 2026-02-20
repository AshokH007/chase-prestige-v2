const { pool } = require('../db');

const getProfile = async (req, res, next) => {
    try {
        // req.user is set by auth middleware
        const result = await pool.query(
            'SELECT id, customer_id, account_number, full_name, email, status, created_at FROM banking.users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const getBalance = async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT account_number, balance FROM banking.users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, getBalance };
