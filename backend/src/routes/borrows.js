const express = require('express');
const { body } = require('express-validator');
const borrowsController = require('../controllers/borrowsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Borrow a book
router.post(
  '/',
  [body('bookId').isInt().withMessage('Book ID must be a number')],
  borrowsController.borrowBook
);

// Get user's borrowed books
router.get('/', borrowsController.getUserBorrows);

// Return a book
router.put('/:id/return', borrowsController.returnBook);

module.exports = router;
