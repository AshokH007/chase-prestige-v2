const db = require('../db');

/**
 * Get all loans for the authenticated user
 */
exports.getLoans = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT id, amount, apr, term_months, status, purpose, created_at
            FROM banking.loans
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch loans:', err.message);
        res.status(500).json({ message: 'Failed to fetch loans' });
    }
};

/**
 * Apply for a new loan
 */
exports.applyForLoan = async (req, res) => {
    const { amount, termMonths, purpose } = req.body;

    if (!amount || !termMonths || amount <= 0) {
        return res.status(400).json({ message: 'Invalid loan request details' });
    }

    try {
        // High-end simulation: Determine APR based on amount (Institutional logic)
        const apr = amount > 100000 ? 3.50 : 5.75;

        // Institutional EMI Calculation
        const monthlyRate = apr / 100 / 12;
        const monthlyEmi = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

        const result = await db.pool.query(`
            INSERT INTO banking.loans (user_id, amount, apr, term_months, monthly_emi, purpose, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
            RETURNING *
        `, [req.user.id, amount, apr, termMonths, monthlyEmi, purpose || 'General Capital Expansion']);

        res.status(201).json({
            message: 'Institutional loan application submitted for review',
            loan: result.rows[0]
        });
    } catch (err) {
        console.error('Loan application failed:', err.message);
        res.status(500).json({ message: 'Failed to submit loan application' });
    }
};

/**
 * Process loan payment (Simulation)
 */
exports.payLoanInstallment = async (req, res) => {
    const { loanId } = req.params;
    const { amount } = req.body;

    try {
        const loanRes = await db.pool.query(
            'SELECT * FROM banking.loans WHERE id = $1 AND user_id = $2',
            [loanId, req.user.id]
        );

        if (loanRes.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const loan = loanRes.rows[0];

        // 2. Check user balance
        const userRes = await db.pool.query('SELECT balance FROM banking.users WHERE id = $1', [req.user.id]);
        const balance = parseFloat(userRes.rows[0].balance);

        if (balance < amount) {
            return res.status(400).json({ message: 'Insufficient liquidity for loan settlement' });
        }

        // 3. Process Payment
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'UPDATE banking.users SET balance = balance - $1 WHERE id = $2',
                [amount, req.user.id]
            );

            // Log Transaction
            await client.query(`
                INSERT INTO banking.transactions (sender_id, amount, type, reference, status)
                VALUES ($1, $2, 'TRANSFER', $3, 'COMPLETED')
            `, [req.user.id, amount, `Institutional Loan Installment: ${loanId.slice(0, 8)}`]);

            await client.query('COMMIT');
            res.json({ message: 'Loan installment processed successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Loan payment failed:', err.message);
        res.status(500).json({ message: 'Failed to process loan payment' });
    }
};

/**
 * Request Loan Extension
 */
exports.requestExtension = async (req, res) => {
    const { loanId } = req.params;
    const { reason } = req.body;

    try {
        await db.pool.query(
            "UPDATE banking.loans SET status = 'EXTENSION_REQUESTED', purpose = purpose || ' [Extension Requested: ' || $1 || ']' WHERE id = $2 AND user_id = $3",
            [reason || 'No reason provided', loanId, req.user.id]
        );
        res.json({ message: 'Extension request submitted to credit committee' });
    } catch (err) {
        res.status(500).json({ message: 'Extension request failed' });
    }
};

/**
 * Get Client notifications
 */
exports.getNotifications = async (req, res) => {
    try {
        const result = await db.pool.query(
            "SELECT * FROM banking.notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Notification fetch failed' });
    }
};
