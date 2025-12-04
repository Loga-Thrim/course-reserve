const express = require('express');
const router = express.Router();
const professorAuth = require('../middleware/professorAuth');
const professorCourseRegistrationController = require('../controllers/professor/courseRegistrationController');

// All routes require professor authentication
router.use(professorAuth);

// Course Registration routes (professors can manage their own courses)
router.get('/course-registration/curriculums', professorCourseRegistrationController.getCurriculums);
router.get('/course-registration', professorCourseRegistrationController.getAllCourses);
router.post('/course-registration', professorCourseRegistrationController.createCourse);
router.put('/course-registration/:id', professorCourseRegistrationController.updateCourse);
router.delete('/course-registration/:id', professorCourseRegistrationController.deleteCourse);

module.exports = router;
