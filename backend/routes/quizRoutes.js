const express = require('express');
const router = express.Router();
const { createQuiz, getQuiz, submitQuiz, getMyAttempts } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.get('/:id', protect, getQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.get('/:id/attempts/my', protect, getMyAttempts);

module.exports = router;
