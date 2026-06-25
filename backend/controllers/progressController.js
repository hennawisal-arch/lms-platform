const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { maybeIssueCertificate } = require('./certificateController');

// @route GET /api/progress/:courseId
const getProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('You are not enrolled in this course');
  }
  res.json({ enrollment });
});

// @route PUT /api/progress/:courseId/lesson/:lessonId
// body: { watchedSeconds, completed }
const updateLessonProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { watchedSeconds, completed } = req.body;

  const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('You are not enrolled in this course');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  let lp = enrollment.lessonProgress.find((p) => String(p.lesson) === String(lessonId));
  if (!lp) {
    // Lesson may have been added after enrollment - create a tracking entry
    enrollment.lessonProgress.push({ lesson: lessonId });
    lp = enrollment.lessonProgress[enrollment.lessonProgress.length - 1];
  }

  if (watchedSeconds !== undefined) lp.watchedSeconds = Math.max(lp.watchedSeconds, watchedSeconds);
  if (completed) {
    lp.completed = true;
    lp.completedAt = new Date();
  }

  // Recompute overall percent
  const totalLessons = course.lessons.length || 1;
  const completedCount = enrollment.lessonProgress.filter((p) => p.completed).length;
  enrollment.overallProgressPercent = Math.round((completedCount / totalLessons) * 100);

  await enrollment.save();

  const certificate = await maybeIssueCertificate(enrollment._id);

  res.json({ enrollment, certificateIssued: !!certificate });
});

module.exports = { getProgress, updateLessonProgress };
