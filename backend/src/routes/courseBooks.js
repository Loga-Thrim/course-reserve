const express = require('express');
const courseBooksController = require('../controllers/courseBooksController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/curriculums', authMiddleware, courseBooksController.getCurriculumsWithCourses);

router.get('/books', authMiddleware, courseBooksController.getBooks);

router.get('/files/:courseId', authMiddleware, courseBooksController.getCourseFiles);

module.exports = router;
