const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminUsersController = require('../controllers/admin/usersController');
const adminFacultiesController = require('../controllers/admin/facultiesController');
const adminCurriculumsController = require('../controllers/admin/curriculumsController');
const adminCourseBooksController = require('../controllers/admin/courseBooksController');
const reportController = require('../controllers/admin/reportController');
const activityLogController = require('../controllers/admin/activityLogController');
const studentReportController = require('../controllers/admin/studentReportController');

router.use(adminAuth);

router.get('/users', adminUsersController.getAllUsers);
router.post('/users', adminUsersController.createUser);
router.put('/users/:id', adminUsersController.updateUser);
router.delete('/users/:id', adminUsersController.deleteUser);

router.get('/faculties', adminFacultiesController.getAllFaculties);
router.post('/faculties', adminFacultiesController.createFaculty);
router.put('/faculties/:id', adminFacultiesController.updateFaculty);
router.delete('/faculties/:id', adminFacultiesController.deleteFaculty);

router.get('/curriculums', adminCurriculumsController.getAllCurriculums);
router.post('/curriculums', adminCurriculumsController.createCurriculum);
router.put('/curriculums/:id', adminCurriculumsController.updateCurriculum);
router.delete('/curriculums/:id', adminCurriculumsController.deleteCurriculum);

router.get('/course-books/courses', adminCourseBooksController.getAllCourses);
router.get('/course-books/search', adminCourseBooksController.searchBooks);
router.get('/course-books/:courseId', adminCourseBooksController.getRecommendedBooks);
router.post('/course-books/:courseId', adminCourseBooksController.addRecommendedBook);
router.delete('/course-books/:courseId/:bookId', adminCourseBooksController.removeRecommendedBook);

router.get('/reports/overview', reportController.getOverviewStats);
router.get('/reports/faculty', reportController.getReportByFaculty);
router.get('/reports/curriculum', reportController.getReportByCurriculum);
router.get('/reports/courses', reportController.getCourseReport);
router.get('/reports/books', reportController.getBookReport);
router.get('/reports/export', reportController.getExportData);

router.get('/activity-logs', activityLogController.getLogs);
router.get('/activity-logs/stats', activityLogController.getStats);
router.get('/activity-logs/filters', activityLogController.getFilterOptions);
router.get('/activity-logs/export', activityLogController.exportLogs);
router.get('/activity-logs/student-report', activityLogController.getStudentReport);
router.get('/activity-logs/professor-report', activityLogController.getProfessorReport);

// Student enrollment reports
router.get('/student-reports/overview', studentReportController.getOverview);
router.get('/student-reports/enrollments', studentReportController.getEnrollments);
router.get('/student-reports/popular-courses', studentReportController.getPopularCourses);
router.get('/student-reports/active-students', studentReportController.getActiveStudents);
router.get('/student-reports/by-faculty', studentReportController.getEnrollmentByFaculty);
router.get('/student-reports/courses-without-students', studentReportController.getCoursesWithoutStudents);
router.get('/student-reports/export', studentReportController.exportEnrollments);

module.exports = router;
