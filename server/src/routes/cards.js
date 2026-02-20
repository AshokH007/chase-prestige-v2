const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');
const { authenticate } = require('../middleware/auth');

// All card routes require authentication
router.use(authenticate);

/**
 * @route GET /api/cards
 * @desc Get all user cards
 */
router.get('/', cardsController.getCards);

/**
 * @route POST /api/cards/issue
 * @desc Issue a new virtual card
 */
router.post('/issue', cardsController.issueCard);

/**
 * @route PATCH /api/cards/:cardId/status
 * @desc Update card status (Freeze/Unfreeze)
 */
router.patch('/:cardId/status', cardsController.updateCardStatus);

module.exports = router;
