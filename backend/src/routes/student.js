const express = require('express');
const router = express.Router();
const studentCoursesController = require('../controllers/studentCoursesController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all available courses (for browsing)
router.get('/courses', studentCoursesController.getAllCourses);

// Get faculties for filter
router.get('/faculties', studentCoursesController.getFaculties);

// Get curriculums for filter
router.get('/curriculums', studentCoursesController.getCurriculums);

// Get student's selected courses
router.get('/my-courses', studentCoursesController.getMyCourses);

// Add course to student's list
router.post('/my-courses/:courseId', studentCoursesController.addCourse);

// Remove course from student's list
router.delete('/my-courses/:courseId', studentCoursesController.removeCourse);

// Get course detail with books
router.get('/courses/:courseId', studentCoursesController.getCourseDetail);

module.exports = router;
