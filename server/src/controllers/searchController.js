const db = require('../db');

/**
 * Unified Search Engine
 * Queries transactions, assets, and provides navigation shortcuts.
 */
exports.unifiedSearch = async (req, res) => {
    const { q } = req.query;
    const userId = req.user.id;
    const isStaff = req.user.role === 'STAFF';

    if (!q || q.length < 2) {
        return res.json({ results: [] });
    }

    try {
        const query = `%${q}%`;

        // 1. Search Transactions (Reference or Counterparty)
        // If staff, search ALL transactions? For now, keep it to user's if not specified, 
        // but let's allow staff to search across CLient accounts too.

        let transactionQuery = "";
        let txParams = [];

        if (isStaff) {
            transactionQuery = `
                SELECT t.id, t.amount, t.type, t.reference, t.created_at, s.full_name as counterparty
                FROM banking.transactions t
                LEFT JOIN banking.users s ON (t.sender_id = s.id OR t.receiver_id = s.id)
                WHERE t.reference ILIKE $1 OR s.full_name ILIKE $1 OR t.id::text ILIKE $1
                ORDER BY t.created_at DESC LIMIT 5
            `;
            txParams = [query];
        } else {
            transactionQuery = `
                SELECT t.id, t.amount, t.type, t.reference, t.created_at, s.full_name as counterparty
                FROM banking.transactions t
                LEFT JOIN banking.users s ON (t.sender_id = s.id AND t.sender_id != $1) OR (t.receiver_id = s.id AND t.receiver_id != $1)
                WHERE (t.sender_id = $1 OR t.receiver_id = $1)
                AND (t.reference ILIKE $2 OR s.full_name ILIKE $2)
                ORDER BY t.created_at DESC LIMIT 5
            `;
            txParams = [userId, query];
        }
        const transactionPromise = db.pool.query(transactionQuery, txParams);

        // 2. Search Assets (Staff can search ALL client assets? No, keep it specific)
        const assetsPromise = isStaff
            ? db.pool.query('SELECT symbol, name, quantity FROM banking.assets WHERE symbol ILIKE $1 OR name ILIKE $1 LIMIT 5', [query])
            : db.pool.query('SELECT symbol, name, quantity FROM banking.assets WHERE user_id = $1 AND (symbol ILIKE $2 OR name ILIKE $2) LIMIT 5', [userId, query]);

        // 4. [STAFF ONLY] Search Clients
        let clientsPromise = Promise.resolve({ rows: [] });
        if (isStaff) {
            clientsPromise = db.pool.query(`
                SELECT id, full_name, account_number, customer_id, email, balance 
                FROM banking.users 
                WHERE role = 'CLIENT' 
                AND (full_name ILIKE $1 OR account_number ILIKE $1 OR email ILIKE $1)
                LIMIT 5
            `, [query]);
        }

        const [txResults, assetResults, clientResults] = await Promise.all([
            transactionPromise,
            assetsPromise,
            clientsPromise
        ]);

        // 3. Navigation Shortcuts
        const navigation = [];
        const navItems = [
            { label: 'AI Concierge', path: '/ai-concierge', keywords: ['ai', 'gpt', 'chat', 'help', 'concierge'] },
            { label: 'Transfer Funds', path: '/dashboard', action: 'transfer', keywords: ['send', 'transfer', 'pay', 'money', 'p2p'] },
            { label: 'View Statements', path: '/dashboard', action: 'statements', keywords: ['statements', 'history', 'report', 'ledger'] },
            { label: 'Analytics', path: '/analytics', keywords: ['stats', 'performance', 'charts', 'analytics'] }
        ];

        navItems.forEach(item => {
            if (item.label.toLowerCase().includes(q.toLowerCase()) ||
                item.keywords.some(k => k.includes(q.toLowerCase()))) {
                navigation.push({
                    type: 'NAV',
                    label: item.label,
                    path: item.path,
                    action: item.action
                });
            }
        });

        const results = [
            ...navigation,
            ...txResults.rows.map(t => ({
                type: 'TX',
                label: `Transaction: ${t.reference || t.type}`,
                sublabel: `${t.counterparty ? 'to/from ' + t.counterparty : t.type} • $${parseFloat(t.amount).toLocaleString()}`,
                id: t.id
            })),
            ...assetResults.rows.map(a => ({
                type: 'ASSET',
                label: `Asset: ${a.symbol}`,
                sublabel: `${a.name} • Holding: ${a.quantity}`,
                symbol: a.symbol
            })),
            ...clientResults.rows.map(c => ({
                type: 'CLIENT',
                label: `Client: ${c.full_name}`,
                sublabel: `${c.account_number} • $${parseFloat(c.balance).toLocaleString()}`,
                id: c.id,
                path: '/staff/directory' // Corrected Staff view
            }))
        ];

        res.json({ results });

    } catch (err) {
        console.error('Search Engine Error:', err.message);
        res.status(500).json({ message: 'Search temporarily unavailable' });
    }
};
