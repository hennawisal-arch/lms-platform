const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false },
  watchedSeconds: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
});

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonProgress: [lessonProgressSchema],
    overallProgressPercent: { type: Number, default: 0 },
    finalQuizPassed: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
