const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
  enrollInCourse,
  getMyEnrollments,
  getInstructorStats,
} = require('../controllers/courseController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public-ish (req.user is attached if logged in, but not required)
router.get('/', optionalAuth, getCourses);
router.get('/enrollments/my', protect, getMyEnrollments);
router.get('/instructor/stats', protect, authorize('instructor', 'admin'), getInstructorStats);
router.get('/:id', optionalAuth, getCourseById);

// Instructor/admin only
router.post('/', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

router.post('/:id/lessons', protect, authorize('instructor', 'admin'), upload.single('video'), addLesson);
router.delete('/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), deleteLesson);

// Students
router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);

module.exports = router;
