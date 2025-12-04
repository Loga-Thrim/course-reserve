const express = require('express');
const router = express.Router();
const facultiesController = require('../controllers/facultiesController');

// Get all faculties
router.get('/', facultiesController.getAllFaculties);

module.exports = router;
