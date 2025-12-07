const express = require('express');
const router = express.Router();
const professorAuth = require('../middleware/professorAuth');
const professorCourseRegistrationController = require('../controllers/professor/courseRegistrationController');
const courseBooksController = require('../controllers/professor/courseBooksController');

// All routes require professor authentication
router.use(professorAuth);

// Course Registration routes (professors can manage their own courses)
router.get('/course-registration/curriculums', professorCourseRegistrationController.getCurriculums);
router.get('/course-registration', professorCourseRegistrationController.getAllCourses);
router.post('/course-registration', professorCourseRegistrationController.createCourse);
router.put('/course-registration/:id', professorCourseRegistrationController.updateCourse);
router.delete('/course-registration/:id', professorCourseRegistrationController.deleteCourse);

// Course Books routes (book suggestions and management)
router.get('/course-books/my-courses', courseBooksController.getMyCourses);
router.get('/course-books/search', courseBooksController.searchBooks);
router.get('/course-books/:courseId/suggestions', courseBooksController.getBookSuggestions);
router.post('/course-books/:courseId/refresh', courseBooksController.refreshBookSuggestions);
router.get('/course-books/:courseId', courseBooksController.getCourseBooks);
router.post('/course-books/:courseId', courseBooksController.addBookToCourse);
router.delete('/course-books/:courseId/:bookId', courseBooksController.removeBookFromCourse);

module.exports = router;
