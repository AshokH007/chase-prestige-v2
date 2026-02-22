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

    // OPTIMIZATION: Using Llama-3.2-3B-Instruct for maximum stability and speed on the router.
    const MODEL_ID = process.env.AI_MODEL_ID || "meta-llama/Llama-3.2-3B-Instruct";
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        console.error('❌ HF_TOKEN is missing in environment variables');
        return res.status(500).json({ error: 'Configuration Error', message: 'Hugging Face Token is missing on backend.' });
    }

    try {
        console.log(`🤖 AI Request: Model=${MODEL_ID}, Message="${message.trim().substring(0, 50)}..."`);

        // 2. CALL HUGGING FACE ROUTER API (OpenAI-compatible)
        const hfResponse = await axios.post(
            `https://router.huggingface.co/v1/chat/completions`,
            {
                model: MODEL_ID,
                messages: [
                    { role: "system", content: "You are the Chase Prestige Oracle, an elite institutional banking assistant. Be highly professional, direct, and structured. 1. Use clear line breaks between different sections. 2. Use bullet points (-) or numbered lists for multiple items. 3. DO NOT use bold text (avoid double asterisks **). 4. Ensure the output is clean and easy to scan." },
                    { role: "user", content: message.trim() }
                ],
                max_tokens: 2048,
                temperature: 0.5,
                top_p: 0.9,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log(`✅ HF Router Response Received: Status=${hfResponse.status}`);

        // 3. PARSE RESPONSE
        if (hfResponse.data?.choices?.[0]?.message?.content) {
            let aiReply = hfResponse.data.choices[0].message.content.trim();

            console.log(`📝 Raw AI Response (Length: ${aiReply.length})`);

            // STRIP INTERNAL THINKING BLOCKS SAFELY
            // 1. Remove closed blocks
            aiReply = aiReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
            // 2. Remove trailing unclosed tags (occurs if response is truncated or ongoing)
            aiReply = aiReply.replace(/<think>[\s\S]*$/gi, "").trim();

            if (!aiReply) {
                console.warn('⚠️ Cleaned AI reply is empty after stripping <think> tags.');
                aiReply = "The Institutional Oracle is finalizing its analysis. Please rephrase for a more specific focus.";
            }

            console.log(`✅ AI Success (Cleaned): ${aiReply.substring(0, 50)}...`);
            res.json({ response: aiReply });
        } else {
            console.error('❌ Unexpected Router Response Format:', hfResponse.data);
            return res.status(502).json({ error: 'Inference Failure', message: 'The AI model responded but in an invalid format.' });
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
