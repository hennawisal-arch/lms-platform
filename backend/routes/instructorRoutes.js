const express = require('express');
const router = express.Router();
const { getInstructors, getInstructorById } = require('../controllers/instructorController');

router.get('/', getInstructors);
router.get('/:id', getInstructorById);

module.exports = router;
