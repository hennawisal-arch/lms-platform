const asyncHandler = require('express-async-handler');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { generateCertificatePdf, certDir } = require('../utils/certificateGenerator');

/**
 * Checks whether an enrollment has met completion criteria
 * (all lessons watched, and final quiz passed if one exists), and if so,
 * issues a certificate (idempotent — will not duplicate). Called from
 * the progress controller after a lesson is marked complete, and from
 * the quiz controller after a final quiz is passed.
 */
const maybeIssueCertificate = async (enrollmentId) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment || enrollment.completed) return null;

  const course = await Course.findById(enrollment.course);
  if (!course) return null;

  const allLessonsComplete =
    enrollment.lessonProgress.length === course.lessons.length &&
    enrollment.lessonProgress.every((lp) => lp.completed);

  const finalQuizOk = !course.finalQuiz || enrollment.finalQuizPassed;

  if (!allLessonsComplete || !finalQuizOk) return null;

  enrollment.completed = true;
  enrollment.completedAt = new Date();
  enrollment.overallProgressPercent = 100;
  await enrollment.save();

  const existing = await Certificate.findOne({ user: enrollment.user, course: enrollment.course });
  if (existing) return existing;

  const student = await User.findById(enrollment.user);
  const instructor = await User.findById(course.instructor);
  const certificateCode = `LMS-${uuidv4().split('-')[0].toUpperCase()}`;

  const fileName = await generateCertificatePdf({
    certificateCode,
    studentName: student.name,
    courseName: course.title,
    instructorName: instructor ? instructor.name : 'LMS Faculty',
    issuedAt: new Date(),
  });

  const certificate = await Certificate.create({
    certificateCode,
    user: student._id,
    course: course._id,
    studentName: student.name,
    courseName: course.title,
    instructorName: instructor ? instructor.name : 'LMS Faculty',
    fileName,
  });

  return certificate;
};

// @route GET /api/certificates/my
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id }).sort('-issuedAt');
  res.json({ certificates });
});

// @route GET /api/certificates/:id/download
const downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  if (String(certificate.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this certificate');
  }
  const filePath = path.join(certDir, certificate.fileName);
  res.download(filePath, `${certificate.courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
});

// @route GET /api/certificates/verify/:code  (public)
const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateCode: req.params.code });
  if (!certificate) {
    res.status(404);
    throw new Error('No certificate found with this code');
  }
  res.json({
    valid: true,
    studentName: certificate.studentName,
    courseName: certificate.courseName,
    issuedAt: certificate.issuedAt,
  });
});

module.exports = { maybeIssueCertificate, getMyCertificates, downloadCertificate, verifyCertificate };
