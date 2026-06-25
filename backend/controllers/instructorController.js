const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @route GET /api/instructors  (public directory of all instructors)
const getInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: 'instructor' }).select('name email avatar bio createdAt');

  const results = await Promise.all(
    instructors.map(async (instructor) => {
      const courses = await Course.find({ instructor: instructor._id, published: true }).select('_id title category');
      const courseIds = courses.map((c) => c._id);
      const enrollments = await Enrollment.find({ course: { $in: courseIds } });
      const uniqueStudents = new Set(enrollments.map((e) => String(e.user)));

      return {
        _id: instructor._id,
        name: instructor.name,
        bio: instructor.bio,
        avatar: instructor.avatar,
        memberSince: instructor.createdAt,
        publishedCourseCount: courses.length,
        totalStudents: uniqueStudents.size,
        courses: courses.map((c) => ({ _id: c._id, title: c.title, category: c.category })),
      };
    })
  );

  res.json({ instructors: results });
});

// @route GET /api/instructors/:id  (public profile + their published courses)
const getInstructorById = asyncHandler(async (req, res) => {
  const instructor = await User.findOne({ _id: req.params.id, role: 'instructor' }).select('name email avatar bio createdAt');
  if (!instructor) {
    res.status(404);
    throw new Error('Instructor not found');
  }
  const courses = await Course.find({ instructor: instructor._id, published: true });
  res.json({ instructor, courses });
});

module.exports = { getInstructors, getInstructorById };
