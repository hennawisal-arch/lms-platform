const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoFilename: { type: String, default: '' }, // stored filename for streaming endpoint
  durationSeconds: { type: Number, default: 0 },
  order: { type: Number, required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    thumbnail: { type: String, default: '' },
    price: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    lessons: [lessonSchema],
    finalQuiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

courseSchema.virtual('totalLessons').get(function () {
  return this.lessons.length;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
