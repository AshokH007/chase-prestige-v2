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
                inputs: `<|system|>\nYou are a helpful financial assistant.\n<|user|>\n${message.trim()}\n<|assistant|>\n`,
                parameters: {
                    max_new_tokens: 200,
                    temperature: 0.7,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000 // 20s timeout protection
            }
        );

        // Handle model loading state
        if (hfResponse.data.error && hfResponse.data.error.includes("loading")) {
            return res.status(503).json({ error: 'Service Unavailable', message: 'Model is currently loading. Please retry in 30 seconds.' });
        }

        let aiText = "";
        if (Array.isArray(hfResponse.data)) {
            aiText = hfResponse.data[0].generated_text;
        } else if (hfResponse.data.generated_text) {
            aiText = hfResponse.data.generated_text;
        } else {
            aiText = "I am currently unable to process your request.";
        }

        // 3. CLEAN RESPONSE
        const cleanReply = aiText.replace(/<\|.*?\|>/g, "").trim();

        res.json({ response: cleanReply });

    } catch (error) {
        console.error('[AI Controller Error]:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const msg = error.response?.data?.error || 'Failed to connect to AI engine.';
        res.status(status).json({ error: 'Inference Error', message: msg });
    }
};
