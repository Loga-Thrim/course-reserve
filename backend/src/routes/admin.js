const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminUsersController = require('../controllers/admin/usersController');
const adminFacultiesController = require('../controllers/admin/facultiesController');
const adminCurriculumsController = require('../controllers/admin/curriculumsController');
const adminCourseBooksController = require('../controllers/admin/courseBooksController');

// All routes require admin authentication
router.use(adminAuth);

// Users routes
router.get('/users', adminUsersController.getAllUsers);
router.post('/users', adminUsersController.createUser);
router.put('/users/:id', adminUsersController.updateUser);
router.delete('/users/:id', adminUsersController.deleteUser);

// Faculties routes
router.get('/faculties', adminFacultiesController.getAllFaculties);
router.post('/faculties', adminFacultiesController.createFaculty);
router.put('/faculties/:id', adminFacultiesController.updateFaculty);
router.delete('/faculties/:id', adminFacultiesController.deleteFaculty);

// Curriculums routes
router.get('/curriculums', adminCurriculumsController.getAllCurriculums);
router.post('/curriculums', adminCurriculumsController.createCurriculum);
router.put('/curriculums/:id', adminCurriculumsController.updateCurriculum);
router.delete('/curriculums/:id', adminCurriculumsController.deleteCurriculum);

// Course Books routes (admin recommendations for professor courses)
router.get('/course-books/courses', adminCourseBooksController.getAllCourses);
router.get('/course-books/search', adminCourseBooksController.searchBooks);
router.get('/course-books/:courseId', adminCourseBooksController.getRecommendedBooks);
router.post('/course-books/:courseId', adminCourseBooksController.addRecommendedBook);
router.delete('/course-books/:courseId/:bookId', adminCourseBooksController.removeRecommendedBook);

module.exports = router;
