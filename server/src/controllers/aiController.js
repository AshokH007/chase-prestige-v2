const axios = require('axios');

/**
 * ZEPHYR LLM CORE (Hugging Face Inference API)
 * High-performance text generation optimized for Render Free Tier.
 */
exports.chat = async (req, res, next) => {
    const { message } = req.body;

    // 1. INPUT VALIDATION
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Bad Request', message: 'Message content is required.' });
    }

    // OPTIMIZATION: Reverting to Zephyr for backend reliability.
    const MODEL_ID = process.env.AI_MODEL_ID || "HuggingFaceH4/zephyr-7b-beta";
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        console.error('❌ HF_TOKEN is missing in environment variables');
        return res.status(500).json({ error: 'Configuration Error', message: 'Hugging Face Token is missing on backend.' });
    }

    // DEBUG: Verify token prefix safely
    console.log(`🔑 Token Check: ${HF_TOKEN.substring(0, 4)}... (Length: ${HF_TOKEN.length})`);

    try {
        console.log(`🤖 AI Request: Model=${MODEL_ID}, Message="${message.trim().substring(0, 50)}..."`);

        // 2. CALL HUGGING FACE ROUTER API (OpenAI-compatible)
        const hfResponse = await axios.post(
            `https://router.huggingface.co/v1/chat/completions`,
            {
                model: MODEL_ID,
                messages: [
                    { role: "system", content: "You are the Chase Prestige Oracle, a premium banking assistant. Respond intelligently and professionally. Keep responses concise but complete. Do not include internal thought blocks in your final output." },
                    { role: "user", content: message.trim() }
                ],
                max_tokens: 500,
                temperature: 0.7,
                top_p: 0.95,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30s strict timeout
            }
        );

        console.log(`✅ HF Router Response Received: Status=${hfResponse.status}`);

        // 3. PARSE & CLEAN OPENAI-STYLE RESPONSE
        if (hfResponse.data && hfResponse.data.choices && hfResponse.data.choices.length > 0) {
            let aiReply = hfResponse.data.choices[0].message.content;

            console.log(`📝 Raw AI Response (Length: ${aiReply.length})`);

            // STRIP INTERNAL THINKING BLOCKS SAFELY
            // 1. Remove closed blocks
            aiReply = aiReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
            // 2. Remove trailing unclosed tags (occurs if response is truncated)
            aiReply = aiReply.replace(/<think>[\s\S]*$/gi, "").trim();

            if (!aiReply) {
                console.warn('⚠️ Cleaned AI reply is empty after stripping <think> tags.');
                aiReply = "The Institutional Oracle is processing complex data but produced no public output. Please rephrase or try again.";
            }

            res.json({ response: aiReply });
        } else {
            console.error('❌ Unexpected Router Response Format:', hfResponse.data);
            return res.status(502).json({ error: 'Inference Failure', message: 'The model failed to produce a valid response via the router.' });
        }

    } catch (error) {
        console.error('❌ [AI Controller Error]:', error.response?.data || error.message);

        // RETURN REAL ERROR MESSAGE
        const status = error.response?.status || 500;
        const msg = error.response?.data?.error || error.response?.data?.message || error.message || "Internal server error during AI inference.";

        res.status(status).json({
            error: 'Inference Error',
            message: msg
        });
    }
};
