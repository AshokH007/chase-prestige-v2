const db = require('../db');

/**
 * Get spending by category for the authenticated user
 */
exports.getSpendingByCategory = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT category, SUM(amount) as total
            FROM (
                SELECT amount, 'Bills' as category FROM banking.bills WHERE user_id = $1 AND status = 'PAID'
                UNION ALL
                SELECT amount, 'Transfers' as category FROM banking.transactions WHERE sender_id = $1 AND type = 'TRANSFER'
                UNION ALL
                SELECT amount, 'Internal' as category FROM banking.transactions WHERE sender_id = $1 AND type = 'BILL_PAY'
            ) combined
            GROUP BY category
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch spending by category:', err.message);
        res.status(500).json({ message: 'Failed to fetch spending data' });
    }
};

/**
 * Get monthly balance trend
 */
exports.getBalanceTrend = async (req, res) => {
    try {
        // Simplified trend: Mocking some historical data if none exists
        // In a real app, this would use a daily_balances table or aggregate transactions
        const result = await db.pool.query(`
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', now()) - interval '5 months',
                    date_trunc('month', now()),
                    '1 month'::interval
                ) as month
            ),
            monthly_sums AS (
                SELECT 
                    m.month,
                    COALESCE(SUM(
                        CASE 
                            WHEN t.receiver_id = $1 THEN t.amount 
                            WHEN t.sender_id = $1 THEN -t.amount 
                            ELSE 0 
                        END
                    ), 0) as monthly_change
                FROM months m
                LEFT JOIN banking.transactions t ON date_trunc('month', t.created_at) = m.month 
                    AND (t.sender_id = $1 OR t.receiver_id = $1)
                GROUP BY m.month
            )
            SELECT 
                to_char(month, 'Mon') as label,
                SUM(monthly_change) OVER (ORDER BY month) + (
                    SELECT COALESCE(balance, 0) - (
                        SELECT COALESCE(SUM(
                            CASE 
                                WHEN receiver_id = $1 THEN amount 
                                WHEN sender_id = $1 THEN -amount 
                                ELSE 0 
                            END
                        ), 0)
                        FROM banking.transactions 
                        WHERE sender_id = $1 OR receiver_id = $1
                    )
                    FROM banking.users WHERE id = $1
                ) as value
            FROM monthly_sums
            ORDER BY month ASC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch balance trend:', err.message);
        res.status(500).json({ message: 'Failed to fetch trend data' });
    }
};

/**
 * Get global asset distribution (Cash vs Cards vs Invested - Mocked for simulation)
 */
exports.getAssetDistribution = async (req, res) => {
    try {
        const [userRes, assetsRes] = await Promise.all([
            db.pool.query('SELECT balance FROM banking.users WHERE id = $1', [req.user.id]),
            db.pool.query('SELECT type, SUM(quantity * avg_buy_price) as value FROM banking.assets WHERE user_id = $1 GROUP BY type', [req.user.id])
        ]);

        const balance = parseFloat(userRes.rows[0].balance);
        const assetDist = assetsRes.rows.map(a => ({
            name: a.type.charAt(0).toUpperCase() + a.type.slice(1),
            value: parseFloat(a.value)
        }));

        const distribution = [
            { name: 'Liquid Assets', value: balance },
            ...assetDist
        ];

        // Add a fallback if distribution is too small
        if (distribution.length < 3) {
            distribution.push({ name: 'Institutional Reserve', value: balance * 0.15 });
        }

        res.json(distribution);
    } catch (err) {
        console.error('Failed to fetch asset distribution:', err.message);
        res.status(500).json({ message: 'Failed to fetch asset data' });
    }
};
