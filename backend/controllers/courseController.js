const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { Quiz } = require('../models/Quiz');

// @route GET /api/courses  (public catalog - published courses only, with search/filter)
const getCourses = asyncHandler(async (req, res) => {
  const { search, category, level, mine } = req.query;
  const filter = {};

  if (mine === 'true' && req.user) {
    filter.instructor = req.user._id; // instructor viewing their own (incl. unpublished)
  } else {
    filter.published = true;
  }

  if (search) filter.title = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  if (level) filter.level = level;

  const courses = await Course.find(filter)
    .populate('instructor', 'name email avatar')
    .sort('-createdAt');

  res.json({ courses });
});

// @route GET /api/courses/instructor/stats  (instructor's analytics: revenue, enrollment, completion per course)
const getInstructorStats = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
  const courseIds = courses.map((c) => c._id);

  const enrollments = await Enrollment.find({ course: { $in: courseIds } });

  const courseStats = courses.map((course) => {
    const courseEnrollments = enrollments.filter((e) => String(e.course) === String(course._id));
    const totalStudents = courseEnrollments.length;
    const completedCount = courseEnrollments.filter((e) => e.completed).length;
    const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
    const avgProgress =
      totalStudents > 0
        ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.overallProgressPercent, 0) / totalStudents)
        : 0;
    const revenue = (course.price || 0) * totalStudents;

    return {
      _id: course._id,
      title: course.title,
      category: course.category,
      level: course.level,
      published: course.published,
      price: course.price || 0,
      lessonsCount: course.lessons.length,
      totalStudents,
      completedCount,
      completionRate,
      avgProgress,
      revenue,
    };
  });

  const uniqueStudentIds = new Set(enrollments.map((e) => String(e.user)));
  const totalRevenue = courseStats.reduce((sum, c) => sum + c.revenue, 0);
  const coursesWithStudents = courseStats.filter((c) => c.totalStudents > 0);
  const avgCompletionRate =
    coursesWithStudents.length > 0
      ? Math.round(coursesWithStudents.reduce((sum, c) => sum + c.completionRate, 0) / coursesWithStudents.length)
      : 0;

  res.json({
    summary: {
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.published).length,
      totalStudents: uniqueStudentIds.size,
      totalRevenue,
      avgCompletionRate,
    },
    courses: courseStats,
  });
});

// @route GET /api/courses/:id
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email avatar bio');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ course });
});

// @route POST /api/courses  (instructor)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, level, price, tags } = req.body;
  if (!title || !description) {
    res.status(400);
    throw new Error('Title and description are required');
  }

  const course = await Course.create({
    title,
    description,
    category,
    level,
    price: price || 0,
    tags: tags || [],
    instructor: req.user._id,
    thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : '',
  });

  res.status(201).json({ course });
});

// @route PUT /api/courses/:id  (owning instructor or admin)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this course');
  }

  const fields = ['title', 'description', 'category', 'level', 'price', 'published', 'tags'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  if (req.file) course.thumbnail = `/uploads/thumbnails/${req.file.filename}`;

  await course.save();
  res.json({ course });
});

// @route DELETE /api/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }
  await course.deleteOne();
  await Enrollment.deleteMany({ course: course._id });
  res.json({ message: 'Course deleted' });
});

// @route POST /api/courses/:id/lessons  (instructor, multipart with 'video' field)
const addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this course');
  }

  const { title, description, durationSeconds } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Lesson title is required');
  }

  course.lessons.push({
    title,
    description: description || '',
    videoFilename: req.file ? req.file.filename : '',
    durationSeconds: durationSeconds || 0,
    order: course.lessons.length + 1,
  });

  await course.save();
  res.status(201).json({ course });
});

// @route DELETE /api/courses/:id/lessons/:lessonId
const deleteLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this course');
  }
  course.lessons = course.lessons.filter((l) => String(l._id) !== req.params.lessonId);
  // re-number order
  course.lessons.forEach((l, idx) => (l.order = idx + 1));
  await course.save();
  res.json({ course });
});

// @route POST /api/courses/:id/enroll  (student)
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
  if (existing) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  const enrollment = await Enrollment.create({
    user: req.user._id,
    course: course._id,
    lessonProgress: course.lessons.map((l) => ({ lesson: l._id })),
  });

  res.status(201).json({ enrollment });
});

// @route GET /api/courses/enrollments/my  (student's enrollments with course populated)
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id })
    .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
    .sort('-createdAt');
  res.json({ enrollments });
});

module.exports = {
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
};
