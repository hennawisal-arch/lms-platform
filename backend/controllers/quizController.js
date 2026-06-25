const asyncHandler = require('express-async-handler');
const { Quiz, QuizAttempt } = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { maybeIssueCertificate } = require('./certificateController');

// @route POST /api/quizzes  (instructor) body: { courseId, lessonId?, title, isFinalQuiz, passingScorePercent, questions }
const createQuiz = asyncHandler(async (req, res) => {
  const { courseId, lessonId, title, isFinalQuiz, passingScorePercent, questions } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add a quiz to this course');
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    res.status(400);
    throw new Error('At least one question is required');
  }
  for (const q of questions) {
    if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || q.correctOptionIndex === undefined) {
      res.status(400);
      throw new Error('Each question needs text, at least 2 options, and a correctOptionIndex');
    }
  }

  const quiz = await Quiz.create({
    title: title || 'Quiz',
    course: course._id,
    isFinalQuiz: !!isFinalQuiz,
    passingScorePercent: passingScorePercent || 70,
    questions,
  });

  if (isFinalQuiz) {
    course.finalQuiz = quiz._id;
  } else if (lessonId) {
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }
    lesson.quiz = quiz._id;
  }
  await course.save();

  res.status(201).json({ quiz });
});

// @route GET /api/quizzes/:id  (student view - no correct answers revealed)
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Instructors/admins viewing their own quiz get full detail (for editing)
  const course = await Course.findById(quiz.course);
  const isOwner = course && (String(course.instructor) === String(req.user._id) || req.user.role === 'admin');

  res.json({ quiz: isOwner ? quiz : quiz.toStudentView() });
});

// @route POST /api/quizzes/:id/submit  body: { answers: [{ questionId, selectedOptionIndex }] }
const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    res.status(400);
    throw new Error('answers array is required');
  }

  // Auto-grade
  let totalPoints = 0;
  let earnedPoints = 0;
  quiz.questions.forEach((q) => {
    totalPoints += q.points || 1;
    const given = answers.find((a) => String(a.questionId) === String(q._id));
    if (given && given.selectedOptionIndex === q.correctOptionIndex) {
      earnedPoints += q.points || 1;
    }
  });

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= quiz.passingScorePercent;

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    course: quiz.course,
    answers,
    scorePercent,
    passed,
  });

  // If this was the course's final quiz and the student passed, mark it on their enrollment
  let certificate = null;
  if (passed && quiz.isFinalQuiz) {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: quiz.course });
    if (enrollment) {
      enrollment.finalQuizPassed = true;
      await enrollment.save();
      certificate = await maybeIssueCertificate(enrollment._id);
    }
  }

  // Return correct answers + explanations now that the attempt is submitted
  const reviewedQuestions = quiz.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    yourAnswer: (answers.find((a) => String(a.questionId) === String(q._id)) || {}).selectedOptionIndex,
  }));

  res.json({ attempt, scorePercent, passed, reviewedQuestions, certificateIssued: !!certificate });
});

// @route GET /api/quizzes/:id/attempts/my
const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ quiz: req.params.id, user: req.user._id }).sort('-createdAt');
  res.json({ attempts });
});

module.exports = { createQuiz, getQuiz, submitQuiz, getMyAttempts };
