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
        console.error('❌ HF_TOKEN is missing in environment variables');
        return res.status(500).json({ error: 'Configuration Error', message: 'Hugging Face Token is missing on backend.' });
    }

    try {
        console.log(`🤖 AI Request: Model=${MODEL_ID}, Message="${message.trim().substring(0, 50)}..."`);

        // 2. CALL HUGGING FACE INFERENCE API
        const hfResponse = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`,
            {
                inputs: `<|system|>\nYou are the Chase Prestige Oracle. Respond professionally and concisely. Avoid robotic AI archetypes.\n<|user|>\n${message.trim()}\n<|assistant|>\n`,
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
                timeout: 30000 // 30s strict timeout
            }
        );

        console.log(`✅ HF Response Received: Status=${hfResponse.status}`);

        // Handle model loading state
        if (hfResponse.data.error && hfResponse.data.error.includes("loading")) {
            console.warn('⚠️ Model is still loading on HF side');
            return res.status(503).json({
                error: 'Service Unavailable',
                message: hfResponse.data.error
            });
        }

        let aiText = "";
        if (Array.isArray(hfResponse.data)) {
            aiText = hfResponse.data[0].generated_text || "";
        } else if (hfResponse.data.generated_text) {
            aiText = hfResponse.data.generated_text;
        } else {
            // IF NO DATA, RETURN ACTUAL ERROR BUT NOT THE FAKE LATENCY MESSAGE
            console.error('❌ No generated text in HF response:', hfResponse.data);
            return res.status(502).json({ error: 'Inference Failure', message: 'The model failed to produce a response. Check HF logs.' });
        }

        // 3. CLEAN RESPONSE
        const cleanReply = aiText.replace(/<\|.*?\|>/g, "").trim();
        res.json({ response: cleanReply });

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
