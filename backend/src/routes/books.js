const express = require('express');
const booksController = require('../controllers/booksController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all books (with optional search and filter)
router.get('/', authMiddleware, booksController.getAllBooks);

// Get single book
router.get('/:id', authMiddleware, booksController.getBookById);

module.exports = router;
