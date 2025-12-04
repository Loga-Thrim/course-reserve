const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminUsersController = require('../controllers/admin/usersController');
const adminFacultiesController = require('../controllers/admin/facultiesController');
const adminBooksController = require('../controllers/admin/booksController');
const adminCurriculumsController = require('../controllers/admin/curriculumsController');
const adminCoursesController = require('../controllers/admin/coursesController');
const adminCourseReservesController = require('../controllers/admin/courseReservesController');

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

// Courses routes
router.get('/courses', adminCoursesController.getAllCourses);
router.post('/courses', adminCoursesController.createCourse);
router.put('/courses/:id', adminCoursesController.updateCourse);
router.delete('/courses/:id', adminCoursesController.deleteCourse);

// Course Reserves routes
router.get('/course-reserves', adminCourseReservesController.getAllReserves);
router.post('/course-reserves', adminCourseReservesController.createReserve);
router.delete('/course-reserves/:id', adminCourseReservesController.deleteReserve);

// Books routes
router.get('/books', adminBooksController.getAllBooks);
router.post('/books', adminBooksController.createBook);
router.put('/books/:id', adminBooksController.updateBook);
router.delete('/books/:id', adminBooksController.deleteBook);

module.exports = router;
