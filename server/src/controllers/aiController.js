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

    const MODEL_ID = process.env.AI_MODEL_ID || "HuggingFaceH4/zephyr-7b-beta";
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        return res.status(500).json({ error: 'Configuration Error', message: 'Hugging Face Token is missing.' });
    }

    try {
        // 2. CALL HUGGING FACE INFERENCE API
        const hfResponse = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                inputs: `<|system|>\nYou are the Chase Prestige Oracle, a world-class AI financial advisor. Your tone is sophisticated, intelligent, and extremely helpful. Talk like a human expert, not a robot. Provide clear, direct, and insightful answers.\n<|user|>\n${message.trim()}\n<|assistant|>\n`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    repetition_penalty: 1.1,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30s timeout for complex reasoning
            }
        );

        // Handle model loading state
        if (hfResponse.data.error && hfResponse.data.error.includes("loading")) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'The Oracle is currently synchronizing with global markets. Please retry in a moment.'
            });
        }

        let aiText = "";
        if (Array.isArray(hfResponse.data)) {
            aiText = hfResponse.data[0].generated_text;
        } else if (hfResponse.data.generated_text) {
            aiText = hfResponse.data.generated_text;
        } else {
            aiText = "I am currently analyzing your inquiry. Please allow me a moment to recalibrate.";
        }

        // 3. CLEAN RESPONSE
        const cleanReply = aiText.replace(/<\|.*?\|>/g, "").trim();

        res.json({ response: cleanReply });

    } catch (error) {
        console.error('[AI Controller Error]:', error.response?.data || error.message);

        // Return a slightly more natural fallback for common Hugging Face errors
        if (error.response?.status === 503 || error.response?.data?.error?.includes("loading")) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'The Oracle is currently deep in market analysis. Please try your inquiry again in 20-30 seconds.'
            });
        }

        res.status(500).json({
            error: 'Inference Error',
            message: 'My institutional relay is experiencing high latency. Please try again.'
        });
    }
};
