const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// Institutional Rate Limiting
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: { error: 'Too many requests', message: 'Rate limit exceeded. Please wait a minute.' }
});

// All AI interactions are premium/protected
router.use(authenticate);

// AI Chat/Insights Endpoint with Rate Limiting
router.post('/chat', aiLimiter, aiController.chat);

module.exports = router;
