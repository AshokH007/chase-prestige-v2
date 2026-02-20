const db = require('../db');

/**
 * Get all cards for the authenticated user
 */
exports.getCards = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT id, card_number, card_holder_name, expiry_month, expiry_year, cvv, style, status, created_at
            FROM banking.cards
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Failed to fetch cards:', err.message);
        res.status(500).json({ message: 'Failed to fetch cards' });
    }
};

/**
 * Issue a new Virtual Metal Card
 */
exports.issueCard = async (req, res) => {
    const { style } = req.body; // METAL, GOLD, TITANIUM
    const validStyles = ['METAL', 'GOLD', 'TITANIUM'];
    const cardStyle = validStyles.includes(style) ? style : 'METAL';

    try {
        // Generate random card details
        const cardNumber = '4' + Math.floor(Math.random() * 10 ** 15).toString().padStart(15, '0');
        const cvv = Math.floor(Math.random() * 900 + 100).toString();

        const now = new Date();
        const expiryMonth = now.getMonth() + 1;
        const expiryYear = now.getFullYear() + 5; // Valid for 5 years

        const result = await db.pool.query(`
            INSERT INTO banking.cards (
                user_id, card_number, card_holder_name, expiry_month, expiry_year, cvv, style, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
            RETURNING id, card_number, card_holder_name, expiry_month, expiry_year, cvv, style, status
        `, [
            req.user.id,
            cardNumber,
            req.user.full_name,
            expiryMonth,
            expiryYear,
            cvv,
            cardStyle
        ]);

        res.status(201).json({
            message: 'Virtual card issued successfully',
            card: result.rows[0]
        });
    } catch (err) {
        console.error('Card issuance failed:', err.message);
        res.status(500).json({ message: 'Failed to issue card' });
    }
};

/**
 * Toggle card status (Freeze/Unfreeze)
 */
exports.updateCardStatus = async (req, res) => {
    const { cardId } = req.params;
    const { status } = req.body; // ACTIVE, FROZEN, CANCELLED

    if (!['ACTIVE', 'FROZEN', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const result = await db.pool.query(`
            UPDATE banking.cards
            SET status = $1
            WHERE id = $2 AND user_id = $3
            RETURNING id, status
        `, [status, cardId, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Card not found or unauthorized' });
        }

        res.json({
            message: `Card status updated to ${status}`,
            card: result.rows[0]
        });
    } catch (err) {
        console.error('Status update failed:', err.message);
        res.status(500).json({ message: 'Failed to update card status' });
    }
};
