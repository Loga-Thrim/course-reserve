const express = require('express');
const recommendationsController = require('../controllers/recommendationsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get personalized recommendations (requires authentication)
router.get('/', authMiddleware, recommendationsController.getRecommendations);

module.exports = router;
