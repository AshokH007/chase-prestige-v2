const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate, staffOnly } = require('../middleware/auth');

// Apply both middlewares to all staff routes
router.use(authenticate, staffOnly);

router.post('/create-customer', staffController.createCustomer);
router.post('/deposit', staffController.depositFunds);
router.post('/admin-transfer', staffController.adminTransfer);
router.get('/users', staffController.getAllUsers);
router.get('/metrics', staffController.getStaffMetrics);
router.get('/logs', staffController.getOperationalLogs);
router.get('/risk-assessment', staffController.getRiskAssessment);
router.get('/compliance-report', staffController.getComplianceAudit);
router.post('/toggle-status/:userId', staffController.toggleUserStatus);
router.get('/export-ledger', staffController.exportLedger);

/**
 * Credit Authority
 */
router.get('/loans/queue', staffController.getPendingLoans);
router.post('/loans/:loanId/decision', staffController.processLoanDecision);

module.exports = router;
