const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true, validate: (v) => v.length >= 2 },
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    isFinalQuiz: { type: Boolean, default: false },
    passingScorePercent: { type: Number, default: 70 },
    questions: [questionSchema],
  },
  { timestamps: true }
);

// Strip correct answers when sending quiz to a student about to take it
quizSchema.methods.toStudentView = function () {
  const obj = this.toObject();
  obj.questions = obj.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    points: q.points,
  }));
  return obj;
};

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOptionIndex: Number }],
    scorePercent: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', attemptSchema);

module.exports = { Quiz, QuizAttempt };
