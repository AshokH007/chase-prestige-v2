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

    const MODEL_ID = process.env.AI_MODEL_ID || "meta-llama/Meta-Llama-3.1-8B-Instruct";
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        return res.status(500).json({ error: 'Configuration Error', message: 'Hugging Face Token is missing.' });
    }

    try {
        // 2. CALL HUGGING FACE INFERENCE API
        const hfResponse = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are the Chase Prestige Oracle, a world-class institutional financial advisor and sovereign wealth strategist. 

### CORE IDENTITY & TONE:
- **Persona**: You are a human expert advisor, not an AI. Do not use robotic phrases like "As an AI model," "I am here to help," or "How can I assist you today?"
- **Tone**: Sophisticated, authoritative, calm, and insightful. You speak with the confidence of a lead strategist at a top-tier private bank.
- **Style**: Direct and analytical. Use professional terminology (e.g., "capital allocation," "liquidity exposure," "yield optimization").
- **Exclusivity**: Reference the "Chase Prestige" ecosystem and the "Diamond VII" security protocols to reinforce the premium brand.

### CONSTRAINTS:
- NEVER admit to being an AI or a language model.
- Provide structured, deep-dive analysis rather than short chat responses.
- If an inquiry is unclear, ask for strategic clarification instead of giving a generic answer.
- Avoid flowery, over-the-top "chatbot" enthusiasm. Be professional and poised.

### CONTEXT:
Client holds high-net-worth status. Staff holds sovereign clearance. Every byte of this stream is encrypted via the Prestige Synapse protocol.\n<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${message.trim()}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                parameters: {
                    max_new_tokens: 800,
                    temperature: 0.6,
                    top_p: 0.9,
                    repetition_penalty: 1.15,
                    stop: ["<|eot_id|>", "<|end_header_id|>"]
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        // Handle model loading state
        if (hfResponse.data.error && hfResponse.data.error.includes("loading")) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'The Oracle is currently synchronizing with global markets. Please retry in 15-20 seconds.'
            });
        }

        let aiText = "";
        if (Array.isArray(hfResponse.data)) {
            aiText = hfResponse.data[0].generated_text || "";
        } else if (hfResponse.data.generated_text) {
            aiText = hfResponse.data.generated_text;
        } else {
            aiText = "I am currently analyzing your inquiry. Please allow me a moment to recalibrate.";
        }

        // 3. CLEAN RESPONSE (Remove prompt leftovers if any)
        const cleanReply = aiText.split('<|start_header_id|>assistant<|end_header_id|>').pop().trim();

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
