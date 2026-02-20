const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticate);

/**
 * @route GET /api/analytics/spending
 * @desc Get spending by category
 */
router.get('/spending', analyticsController.getSpendingByCategory);

/**
 * @route GET /api/analytics/trend
 * @desc Get monthly balance trend
 */
router.get('/trend', analyticsController.getBalanceTrend);

/**
 * @route GET /api/analytics/distribution
 * @desc Get asset distribution
 */
router.get('/distribution', analyticsController.getAssetDistribution);

module.exports = router;
