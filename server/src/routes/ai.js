const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// All AI interactions are premium/protected
router.use(authenticate);

// AI Chat/Insights Endpoint
router.post('/chat', aiController.chat);

module.exports = router;
