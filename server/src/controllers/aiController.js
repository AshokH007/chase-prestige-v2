const db = require('../db');

/**
 * AI Chat Endpoint (Simulated Oracle)
 * Provides context-aware financial advice based on user's portfolio.
 */
exports.chat = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    try {
        // 1. Gather User Context for "Intelligence"
        const [balanceRes, assetsRes, loansRes, billsRes] = await Promise.all([
            db.pool.query('SELECT full_name, balance FROM banking.users WHERE id = $1', [userId]),
            db.pool.query('SELECT symbol, quantity, avg_buy_price FROM banking.assets WHERE user_id = $1 AND quantity > 0', [userId]),
            db.pool.query('SELECT amount, status FROM banking.loans WHERE user_id = $1 AND status = $2', [userId, 'APPROVED']),
            db.pool.query('SELECT amount, due_date FROM banking.bills WHERE user_id = $1 AND status = $2', [userId, 'PENDING'])
        ]);

        const userRecord = balanceRes.rows[0];
        const fullName = userRecord?.full_name || 'Valued Client';
        const balance = parseFloat(userRecord?.balance || 0);
        const assets = assetsRes.rows;
        const activeLoans = loansRes.rows;
        const pendingBills = billsRes.rows;

        const totalDebt = activeLoans.reduce((sum, l) => sum + parseFloat(l.amount), 0);
        const totalBills = pendingBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);

        // 2. Simple Heuristic-Based Logic (Prestige GPT Simulation)
        let response = "";
        const input = message.toLowerCase();

        if (input.includes('status') || input.includes('overview') || input.includes('portfolio')) {
            response = `Your current liquidity is $${balance.toLocaleString()}. You hold ${assets.length} institutional assets. `;
            if (totalBills > 0) {
                response += `I notice you have $${totalBills.toLocaleString()} in pending liabilities. I recommend settling these while your liquidity is high.`;
            } else {
                response += `Your financial standing is exceptional. I see no immediate liabilities needing attention.`;
            }
        }
        else if (input.includes('invest') || input.includes('market') || input.includes('buying')) {
            response = `Based on your SPY and exposure to digital assets, you have a balanced risk profile. With $${balance.toLocaleString()} in cash, you have the capital to expand your BTC position, which is currently trending positively.`;
        }
        else if (input.includes('debt') || input.includes('loan') || input.includes('repayment')) {
            if (totalDebt > 0) {
                response = `You have $${totalDebt.toLocaleString()} in active credit facilities. Given your cash flow, I suggest maintaining the current repayment schedule to optimize your internal liquidity metrics.`;
            } else {
                response = `You currently have no active debt. Your balance sheet is clean, making you an ideal candidate for our high-capital loan facilities if needed for strategic expansion.`;
            }
        }
        else if (input.includes('risk') || input.includes('security')) {
            response = `Chase Prestige security protocols are fully active. Your Crypto Vault is managed under multi-sig custody. Your exposure is diversified across equities and digital assets, putting you in the top 5% of risk-adjusted portfolios.`;
        }
        else {
            response = `Welcome, ${fullName}. I am the Prestige AI Concierge. I have analyzed your portfolio: you have $${balance.toLocaleString()} in cash and exposure to ${assets.length > 0 ? assets[0].symbol : 'global'} markets. How can I assist with your strategic capital today?`;
        }

        // Simulate network delay for "AI thinking"
        setTimeout(() => {
            res.json({
                user: fullName,
                response: response,
                timestamp: new Date()
            });
        }, 800);

    } catch (err) {
        console.error('AI Insights Engine Error:', err.message);
        res.status(500).json({ message: 'AI Engine is temporarily optimizing. Please wait.' });
    }
};
