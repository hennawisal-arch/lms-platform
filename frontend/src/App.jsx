import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import QuizPage from './pages/QuizPage';
import CreateCourse from './pages/CreateCourse';
import ManageCourse from './pages/ManageCourse';
import Certificates from './pages/Certificates';
import LiveClass from './pages/LiveClass';
import Instructors from './pages/Instructors';
import ContactUs from './pages/ContactUs';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/courses/:id/lessons/:lessonId" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />
          <Route path="/courses/:id/live" element={<ProtectedRoute><LiveClass /></ProtectedRoute>} />
          <Route path="/quizzes/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route
            path="/instructor/courses/new"
            element={<ProtectedRoute roles={['instructor', 'admin']}><CreateCourse /></ProtectedRoute>}
          />
          <Route
            path="/instructor/courses/:id/manage"
            element={<ProtectedRoute roles={['instructor', 'admin']}><ManageCourse /></ProtectedRoute>}
          />
          <Route path="*" element={<div className="px-6 py-20 text-center text-slate-400">Page not found.</div>} />
        </Routes>
      </main>
    </div>
  );
}
