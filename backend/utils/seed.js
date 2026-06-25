require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const { Quiz } = require('../models/Quiz');

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Quiz.deleteMany({})]);

  const instructor = await User.create({
    name: 'Dr. Amara Khan',
    email: 'instructor@lms.test',
    password: 'password123',
    role: 'instructor',
    bio: 'Senior software engineer and educator with 10 years of teaching experience.',
  });

  const student = await User.create({
    name: 'Jordan Lee',
    email: 'student@lms.test',
    password: 'password123',
    role: 'student',
  });

  const course = await Course.create({
    title: 'Full-Stack Web Development Bootcamp',
    description:
      'Learn to build complete web applications from scratch using React, Node.js, Express, and MongoDB. This course covers everything from frontend UI to backend APIs and database design.',
    instructor: instructor._id,
    category: 'Web Development',
    level: 'beginner',
    price: 0,
    published: true,
    tags: ['React', 'Node.js', 'MongoDB'],
    lessons: [
      { title: 'Introduction to the Course', description: 'Overview of what you will build', order: 1, durationSeconds: 300 },
      { title: 'Setting Up Your Environment', description: 'Installing Node, npm, and MongoDB', order: 2, durationSeconds: 600 },
      { title: 'Building Your First React Component', description: 'JSX, props, and state basics', order: 3, durationSeconds: 900 },
    ],
  });

  const lessonQuiz = await Quiz.create({
    title: 'Lesson 1 Check',
    course: course._id,
    isFinalQuiz: false,
    passingScorePercent: 60,
    questions: [
      {
        questionText: 'What does npm stand for?',
        options: ['Node Package Manager', 'New Programming Module', 'Network Protocol Manager', 'None of the above'],
        correctOptionIndex: 0,
      },
      {
        questionText: 'Which company originally created React?',
        options: ['Google', 'Meta (Facebook)', 'Microsoft', 'Amazon'],
        correctOptionIndex: 1,
      },
    ],
  });
  course.lessons[0].quiz = lessonQuiz._id;

  const finalQuiz = await Quiz.create({
    title: 'Final Course Exam',
    course: course._id,
    isFinalQuiz: true,
    passingScorePercent: 70,
    questions: [
      {
        questionText: 'Which database used in this course is a NoSQL document store?',
        options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
        correctOptionIndex: 2,
      },
      {
        questionText: 'In Express, which middleware parses incoming JSON request bodies?',
        options: ['express.static', 'express.json', 'express.urlencoded', 'cors'],
        correctOptionIndex: 1,
      },
      {
        questionText: 'What hook is used to manage state in a React functional component?',
        options: ['useEffect', 'useRef', 'useState', 'useMemo'],
        correctOptionIndex: 2,
      },
    ],
  });
  course.finalQuiz = finalQuiz._id;
  await course.save();

  console.log('Seed complete!');
  console.log('Instructor login: instructor@lms.test / password123');
  console.log('Student login:    student@lms.test / password123');
  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
