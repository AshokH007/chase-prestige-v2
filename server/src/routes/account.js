const express = require('express');
const router = express.Router();
const { getProfile, getBalance } = require('../controllers/accountController');
const { verifyPinAndGetBalanceToken, verifyBalanceToken } = require('../controllers/securityController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, getProfile);
router.post('/verify-pin', authenticate, verifyPinAndGetBalanceToken);
router.get('/balance', authenticate, verifyBalanceToken, getBalance);

module.exports = router;
