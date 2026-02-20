const db = require('../db');

/**
 * Get all investment assets for the authenticated user
 */
exports.getAssets = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT symbol, name, type, quantity, avg_buy_price, updated_at
            FROM banking.assets
            WHERE user_id = $1 AND quantity > 0
            ORDER BY type, symbol
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch assets:', err.message);
        res.status(500).json({ message: 'Failed to fetch investment portfolio' });
    }
};

/**
 * Execute a market order (Buy/Sell)
 * NOTE: This is a simulation engine. Prices are assumed to be validated by frontend or mocked here.
 */
exports.executeTrade = async (req, res) => {
    const { symbol, name, type, side, quantity, price } = req.body;

    if (!['BUY', 'SELL'].includes(side)) {
        return res.status(400).json({ message: 'Invalid trade side' });
    }
    if (quantity <= 0 || price <= 0) {
        return res.status(400).json({ message: 'Invalid trade parameters' });
    }

    const totalCost = parseFloat((quantity * price).toFixed(2));
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Validate User Balance (for BUY) or Asset Balance (for SELL)
        if (side === 'BUY') {
            const userRes = await client.query('SELECT balance FROM banking.users WHERE id = $1', [req.user.id]);
            if (userRes.rows[0].balance < totalCost) {
                throw new Error('Insufficient funds for trade execution');
            }

            // Deduct Funds
            await client.query('UPDATE banking.users SET balance = balance - $1 WHERE id = $2', [totalCost, req.user.id]);

            // Update Asset Holdings (Upsert)
            // For simplicity in simulation, we just average the buy price
            const assetRes = await client.query('SELECT quantity, avg_buy_price FROM banking.assets WHERE user_id = $1 AND symbol = $2', [req.user.id, symbol]);

            let newQuantity = quantity;
            let newAvgPrice = price;

            if (assetRes.rows.length > 0) {
                const currentQty = parseFloat(assetRes.rows[0].quantity);
                const currentAvg = parseFloat(assetRes.rows[0].avg_buy_price);
                const currentTotalVal = currentQty * currentAvg;

                newQuantity = currentQty + quantity;
                newAvgPrice = (currentTotalVal + totalCost) / newQuantity;
            }

            await client.query(`
                INSERT INTO banking.assets (user_id, symbol, name, type, quantity, avg_buy_price, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (user_id, symbol) 
                DO UPDATE SET quantity = $5, avg_buy_price = $6, updated_at = NOW()
            `, [req.user.id, symbol, name, type, newQuantity, newAvgPrice]);

        } else if (side === 'SELL') {
            const assetRes = await client.query('SELECT quantity FROM banking.assets WHERE user_id = $1 AND symbol = $2', [req.user.id, symbol]);

            if (assetRes.rows.length === 0 || parseFloat(assetRes.rows[0].quantity) < quantity) {
                throw new Error('Insufficient asset balance for sale');
            }

            // Credit Funds
            await client.query('UPDATE banking.users SET balance = balance + $1 WHERE id = $2', [totalCost, req.user.id]);

            // Update Asset Holdings
            const currentQty = parseFloat(assetRes.rows[0].quantity);
            const newQuantity = currentQty - quantity;

            await client.query('UPDATE banking.assets SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND symbol = $3', [newQuantity, req.user.id, symbol]);
        }

        // 2. Log Trade Transaction
        await client.query(`
            INSERT INTO banking.transactions (sender_id, amount, type, reference, status)
            VALUES ($1, $2, 'TRANSFER', $3, 'COMPLETED')
        `, [req.user.id, totalCost, `MARKET ${side} ${symbol} @ $${price}`]);

        await client.query('COMMIT');
        res.json({ message: 'Trade executed successfully', symbol, side, quantity, price });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Trade execution failed:', err.message);
        res.status(400).json({ message: err.message || 'Trade execution failed' });
    } finally {
        client.release();
    }
};
