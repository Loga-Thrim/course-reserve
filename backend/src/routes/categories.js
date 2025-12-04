const express = require('express');
const booksController = require('../controllers/booksController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, booksController.getCategories);

module.exports = router;
