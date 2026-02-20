const db = require('../db');

exports.transferMoney = async (req, res) => {
    const { receiverIdentifier, amount, reference } = req.body;
    const senderId = req.user.id;

    if (!receiverIdentifier || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transfer details' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Resolve Receiver (by Email, Customer ID, or Account Number)
        const receiverRes = await client.query(
            'SELECT id, balance FROM banking.users WHERE email = $1 OR customer_id = $1 OR account_number = $1',
            [receiverIdentifier]
        );

        if (receiverRes.rows.length === 0) {
            throw new Error('Receiver not found');
        }

        const receiverId = receiverRes.rows[0].id;
        if (receiverId === senderId) {
            throw new Error('Cannot transfer to yourself');
        }

        // 2. Verify Sender Balance
        const senderRes = await client.query('SELECT balance FROM banking.users WHERE id = $1 FOR UPDATE', [senderId]);
        const senderBalance = parseFloat(senderRes.rows[0].balance);

        if (senderBalance < amount) {
            throw new Error('Insufficient funds');
        }

        // 3. Execute Transfer
        await client.query('UPDATE banking.users SET balance = balance - $1 WHERE id = $2', [amount, senderId]);
        await client.query('UPDATE banking.users SET balance = balance + $1 WHERE id = $2', [amount, receiverId]);

        // 4. Record Transaction
        await client.query(`
            INSERT INTO banking.transactions (sender_id, receiver_id, amount, type, reference)
            VALUES ($1, $2, $3, 'TRANSFER', $4)
        `, [senderId, receiverId, amount, reference]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Transfer successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const history = await db.query(`
            SELECT 
                t.*,
                s.full_name as sender_name,
                r.full_name as receiver_name
            FROM banking.transactions t
            LEFT JOIN banking.users s ON t.sender_id = s.id
            LEFT JOIN banking.users r ON t.receiver_id = r.id
            WHERE t.sender_id = $1 OR t.receiver_id = $1
            ORDER BY t.created_at DESC
            LIMIT 20
        `, [req.user.id]);

        res.json(history.rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

exports.getStatements = async (req, res) => {
    try {
        const statements = await db.query(`
            SELECT 
                t.id,
                t.amount,
                t.type,
                t.status,
                t.reference,
                t.created_at,
                s.full_name as counterparty_name,
                CASE WHEN t.sender_id = $1 THEN 'DEBIT' ELSE 'CREDIT' END as flow
            FROM banking.transactions t
            LEFT JOIN banking.users s ON (t.sender_id = s.id AND t.sender_id != $1) OR (t.receiver_id = s.id AND t.receiver_id != $1)
            WHERE (t.sender_id = $1 OR t.receiver_id = $1)
            AND t.created_at > NOW() - INTERVAL '30 days'
            ORDER BY t.created_at DESC
        `, [req.user.id]);

        res.json(statements.rows);
    } catch (err) {
        console.error('Failed to fetch statements:', err.message);
        res.status(500).json({ message: 'Failed to fetch institutional statements' });
    }
};
