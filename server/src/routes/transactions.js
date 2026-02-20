const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/transfer', transactionController.transferMoney);
router.get('/history', transactionController.getTransactionHistory);
router.get('/statements', transactionController.getStatements);

module.exports = router;
