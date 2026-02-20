const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loansController');
const { authenticate } = require('../middleware/auth');

// All loan routes require authentication
router.use(authenticate);

/**
 * @route GET /api/loans
 * @desc Get all institutional loans
 */
router.get('/', loansController.getLoans);

/**
 * @route POST /api/loans/apply
 * @desc Apply for a new loan
 */
router.post('/apply', loansController.applyForLoan);

/**
 * @route POST /api/loans/:loanId/pay
 * @desc Process loan installment
 */
router.post('/:loanId/pay', loansController.payLoanInstallment);

/**
 * @route POST /api/loans/:loanId/extend
 */
router.post('/:loanId/extend', loansController.requestExtension);

/**
 * @route GET /api/loans/notifications
 */
router.get('/notifications', loansController.getNotifications);

module.exports = router;
