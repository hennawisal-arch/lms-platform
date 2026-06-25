const express = require('express');
const router = express.Router();
const { getProgress, updateLessonProgress } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:courseId', protect, getProgress);
router.put('/:courseId/lesson/:lessonId', protect, authorize('student'), updateLessonProgress);

module.exports = router;
