const express = require('express');
const router = express.Router();
const billsController = require('../controllers/billsController');
const { authenticate } = require('../middleware/auth');

// All bill routes require authentication
router.use(authenticate);

/**
 * @route GET /api/bills
 * @desc Get all institutional bills
 */
router.get('/', billsController.getBills);

/**
 * @route POST /api/bills
 * @desc Register a new bill (Mocker/Sync)
 */
router.post('/', billsController.createBill);

/**
 * @route POST /api/bills/:billId/pay
 * @desc Process payment for a bill
 */
router.post('/:billId/pay', billsController.payBill);

module.exports = router;
