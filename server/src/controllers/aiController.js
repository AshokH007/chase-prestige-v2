const db = require('../db');
const axios = require('axios');

/**
 * INSTITUTIONAL AI CORE (Powered by Hugging Face)
 * Integrates real-time portfolio context with Large Language Models.
 */
exports.chat = async (req, res, next) => {
    const { message } = req.body;
    const userId = req.user.id;
    const isStaff = req.user.role === 'STAFF';

    // Model selection: DeepSeek-R1 is excellent for reasoning
    const MODEL_ID = process.env.AI_MODEL_ID || "deepseek-ai/DeepSeek-R1-Distill-Llama-70B";
    const HF_TOKEN = process.env.HF_TOKEN;

    try {
        // 1. GATHER REAL-TIME PORTFOLIO CONTEXT
        const [userRes, assetsRes, loansRes, billsRes] = await Promise.all([
            db.pool.query('SELECT full_name, balance, customer_id, account_number, role FROM banking.users WHERE id = $1', [userId]),
            db.pool.query('SELECT symbol, quantity FROM banking.assets WHERE user_id = $1 AND quantity > 0', [userId]),
            db.pool.query('SELECT amount FROM banking.loans WHERE user_id = $1 AND status = $2', [userId, 'APPROVED']),
            db.pool.query('SELECT amount FROM banking.bills WHERE user_id = $1 AND status = $2', [userId, 'PENDING'])
        ]);

        const user = userRes.rows[0];
        const assets = assetsRes.rows.map(a => `${a.quantity} ${a.symbol}`).join(', ');
        const totalDebt = loansRes.rows.reduce((sum, l) => sum + parseFloat(l.amount), 0);
        const totalBills = billsRes.rows.reduce((sum, b) => sum + parseFloat(b.amount), 0);

        // 2. CONSTRUCT SYSTEM PERSONALITY
        let systemPrompt = "";
        if (isStaff) {
            systemPrompt = `You are the Chase Prestige Institutional Oracle. You provide elite analysis to Bank Officers. 
            CONTEXT: You are speaking to Officer ${user.full_name}. 
            SYSTEM METRICS: Total Debt in system is calculated via ledger. 
            TONE: Precise, cold, institutional, authoritative. 
            RULES: Do not use emojis. Focus on risk management and compliance. If asked about a user, focus on their 'customer_id' and exposure.`;
        } else {
            systemPrompt = `You are the Chase Prestige AI Concierge. You are a world-class financial advisor for ultra-high-net-worth individuals.
            USER CONTEXT: Name: ${user.full_name}, Balance: $${parseFloat(user.balance).toLocaleString()}, Assets: ${assets || 'None'}, Debt: $${totalDebt}, Pending Bills: $${totalBills}.
            TONE: Elegant, sophisticated, proactive, and secure. Use "we" and "our" to refer to the bank.
            RULES: Help the client optimize their wealth. If they have bills, suggest settling them. If they have high balance, suggest investments in BTC or SPY. Never give generic advice.`;
        }

        // 3. CALL HUGGING FACE INFERENCE API
        if (!HF_TOKEN) {
            // Fallback to simulation if no token provided yet
            return res.json({
                response: `[SIMULATION MODE] I have analyzed your portfolio, ${user.full_name.split(' ')[0]}. Currently, your liquidity is $${parseFloat(user.balance).toLocaleString()}. Please configure 'HF_TOKEN' in the environment to activate my advanced reasoning core.`,
                isSimulated: true
            });
        }

        const hfResponse = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                inputs: `<|system|>\n${systemPrompt}\n<|user|>\n${message}\n<|assistant|>\n`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30s timeout for larger models
            }
        );

        let aiText = "";
        if (Array.isArray(hfResponse.data)) {
            aiText = hfResponse.data[0].generated_text;
        } else if (hfResponse.data.generated_text) {
            aiText = hfResponse.data.generated_text;
        } else {
            aiText = JSON.stringify(hfResponse.data);
        }

        // Clean up the response (remove prompt leakage if any)
        aiText = aiText.replace(/<\|.*?\|>/g, "").trim();

        res.json({
            response: aiText,
            model: MODEL_ID,
            timestamp: new Date()
        });

    } catch (err) {
        console.error('AI Strategy Core Error:', err.response?.data || err.message);
        res.status(500).json({
            message: 'Our analytical core is momentarily saturated. Please re-issue your request.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

