import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { title: 'On-demand video lessons', desc: 'Stream course videos with full seek and resume support.' },
    { title: 'Auto-graded quizzes', desc: 'Knowledge checks after every lesson and a final exam per course.' },
    { title: 'Progress tracking', desc: 'See exactly how far along you are in every course you take.' },
    { title: 'Auto-generated certificates', desc: 'A PDF certificate is issued the moment you finish a course.' },
    { title: 'Live classes', desc: 'Real-time video sessions between instructors and students over WebRTC.' },
    { title: 'Instructor tools', desc: 'Build courses, upload lessons, and write quizzes from one dashboard.' },
  ];

  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="badge mb-5">Full Learning Management System</span>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white max-w-3xl mx-auto leading-tight">
          Teach and learn, end to end — video, quizzes, progress, and certificates in one place.
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto mt-5">
          A full-stack learning platform built with React, Node.js, MongoDB, and WebRTC for live sessions.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
          {!user && <Link to="/register" className="btn-secondary">Get Started Free</Link>}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <h3 className="font-display font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-display font-bold text-white text-center mb-2">Join the Platform</h2>
          <p className="text-slate-400 text-center mb-10">Whether you're here to learn or to teach, sign up takes a minute.</p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="card p-7 flex flex-col">
              <span className="badge w-fit mb-4">For Students</span>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Join as a Student</h3>
              <p className="text-sm text-slate-400 mb-6 flex-1">
                Enroll in courses, learn at your own pace, take quizzes, and earn certificates when you finish.
              </p>
              <Link to="/register?role=student" className="btn-primary justify-center">Sign Up as a Student</Link>
            </div>

            <div className="card p-7 flex flex-col">
              <span className="badge bg-mint-500/15 text-mint-400 w-fit mb-4">For Instructors</span>
              <h3 className="text-xl font-display font-semibold text-white mb-2">Become an Instructor</h3>
              <p className="text-sm text-slate-400 mb-6 flex-1">
                Build courses, upload lessons, write quizzes, and track your students' progress and revenue.
              </p>
              <Link to="/register?role=instructor" className="btn-secondary justify-center">Sign Up as an Instructor</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
