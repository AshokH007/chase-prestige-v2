const db = require('../db');

/**
 * Get all bills for the authenticated user
 */
exports.getBills = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT id, biller_name, amount, due_date, status, category, created_at
            FROM banking.bills
            WHERE user_id = $1
            ORDER BY due_date ASC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch bills:', err.message);
        res.status(500).json({ message: 'Failed to fetch bills' });
    }
};

/**
 * Pay a specific bill
 */
exports.payBill = async (req, res) => {
    const { billId } = req.params;

    try {
        // 1. Check if bill exists and is UNPAID
        const billRes = await db.pool.query(
            'SELECT * FROM banking.bills WHERE id = $1 AND user_id = $2',
            [billId, req.user.id]
        );

        if (billRes.rows.length === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const bill = billRes.rows[0];
        if (bill.status === 'PAID') {
            return res.status(400).json({ message: 'Bill is already paid' });
        }

        // 2. Check user balance
        const userRes = await db.pool.query('SELECT balance FROM banking.users WHERE id = $1', [req.user.id]);
        const balance = parseFloat(userRes.rows[0].balance);

        if (balance < parseFloat(bill.amount)) {
            return res.status(400).json({ message: 'Insufficient liquidity for payment' });
        }

        // 3. Process Payment (Atomic Transaction)
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Deduct from balance
            await client.query(
                'UPDATE banking.users SET balance = balance - $1 WHERE id = $2',
                [bill.amount, req.user.id]
            );

            // Update bill status
            await client.query(
                'UPDATE banking.bills SET status = $1 WHERE id = $2',
                ['PAID', billId]
            );

            // Log Transaction
            await client.query(`
                INSERT INTO banking.transactions (sender_id, amount, type, reference, status)
                VALUES ($1, $2, 'BILL_PAY', $3, 'COMPLETED')
            `, [req.user.id, bill.amount, `Institutional Payment: ${bill.biller_name}`]);

            await client.query('COMMIT');
            res.json({ message: 'Institutional payment processed successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Bill payment failed:', err.message);
        res.status(500).json({ message: 'Payment processing failed' });
    }
};

/**
 * Create a new bill (Simulation / Automated Biller Sync)
 */
exports.createBill = async (req, res) => {
    const { billerName, amount, dueDate, category } = req.body;

    try {
        const result = await db.pool.query(`
            INSERT INTO banking.bills (user_id, biller_name, amount, due_date, category, status)
            VALUES ($1, $2, $3, $4, $5, 'UNPAID')
            RETURNING *
        `, [req.user.id, billerName, amount, dueDate, category || 'Miscellaneous']);

        res.status(201).json({
            message: 'Institutional bill registered',
            bill: result.rows[0]
        });
    } catch (err) {
        console.error('Bill creation failed:', err.message);
        res.status(500).json({ message: 'Failed to register bill' });
    }
};
