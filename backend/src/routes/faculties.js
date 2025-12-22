const express = require('express');
const router = express.Router();
const facultiesController = require('../controllers/facultiesController');

router.get('/', facultiesController.getAllFaculties);

module.exports = router;
