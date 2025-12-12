const express = require('express');
const courseBooksController = require('../controllers/courseBooksController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get curriculums with their courses (that have books)
router.get('/curriculums', authMiddleware, courseBooksController.getCurriculumsWithCourses);

// Get books by curriculum or course
router.get('/books', authMiddleware, courseBooksController.getBooks);

module.exports = router;
