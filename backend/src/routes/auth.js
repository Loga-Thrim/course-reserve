const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// PSRU External Authentication - Student Login
router.post('/psru/student', authController.psruStudentLogin);

// PSRU External Authentication - Professor Login
router.post('/psru/professor', authController.psruProfessorLogin);

module.exports = router;
