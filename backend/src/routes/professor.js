const express = require('express');
const router = express.Router();
const professorAuth = require('../middleware/professorAuth');
const professorCourseRegistrationController = require('../controllers/professor/courseRegistrationController');
const courseBooksController = require('../controllers/professor/courseBooksController');
const upload = require('../middleware/fileUpload');

// All routes require professor authentication
router.use(professorAuth);

// Dashboard stats
router.get('/dashboard/stats', professorCourseRegistrationController.getDashboardStats);

// Course Registration routes (professors can manage their own courses)
router.get('/course-registration/faculties', professorCourseRegistrationController.getFaculties);
router.get('/course-registration/curriculums', professorCourseRegistrationController.getCurriculums);
router.get('/course-registration', professorCourseRegistrationController.getAllCourses);
router.post('/course-registration', professorCourseRegistrationController.createCourse);
router.put('/course-registration/:id', professorCourseRegistrationController.updateCourse);
router.delete('/course-registration/:id', professorCourseRegistrationController.deleteCourse);

// Course Files routes
router.get('/course-registration/:id/files', professorCourseRegistrationController.getCourseFiles);
router.post('/course-registration/:id/files', upload.single('file'), professorCourseRegistrationController.uploadCourseFile);
router.delete('/course-registration/:id/files/:fileId', professorCourseRegistrationController.deleteCourseFile);

// Course Books routes (book suggestions and management)
router.get('/course-books/my-courses', courseBooksController.getMyCourses);
router.get('/course-books/search', courseBooksController.searchBooks);
router.get('/course-books/:courseId/suggestions', courseBooksController.getBookSuggestions);
router.post('/course-books/:courseId/refresh', courseBooksController.refreshBookSuggestions);
router.get('/course-books/:courseId', courseBooksController.getCourseBooks);
router.post('/course-books/:courseId', courseBooksController.addBookToCourse);
router.delete('/course-books/:courseId/:bookId', courseBooksController.removeBookFromCourse);

module.exports = router;
