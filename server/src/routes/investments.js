const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const investmentsController = require('../controllers/investmentsController');

// All routes are protected
router.use(authenticate);

// Get Investment Portfolio
router.get('/', investmentsController.getAssets);

// Execute Trade (Buy/Sell)
router.post('/trade', investmentsController.executeTrade);

module.exports = router;
