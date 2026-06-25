import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user && course && (user._id === course.instructor?._id || user.role === 'admin');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);

      if (user?.role === 'student') {
        try {
          const prog = await api.get(`/progress/${id}`);
          setEnrollment(prog.data.enrollment);
        } catch {
          setEnrollment(null); // not enrolled
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data } = await api.post(`/courses/${id}/enroll`);
      setEnrollment(data.enrollment);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const lessonStatus = (lessonId) => enrollment?.lessonProgress.find((lp) => lp.lesson === lessonId);

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading course...</div>;
  if (error && !course) return <div className="px-6 py-16 text-center text-red-400">{error}</div>;
  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="badge">{course.category}</span>
        <span className="text-xs text-slate-500 capitalize">{course.level}</span>
        {!course.published && <span className="badge bg-amber-500/15 text-amber-400">Draft</span>}
      </div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">{course.title}</h1>
      <p className="text-slate-400 mb-1">By {course.instructor?.name}</p>
      <p className="text-slate-300 mt-4 max-w-3xl">{course.description}</p>

      <div className="flex items-center gap-3 mt-6">
        {!user && (
          <>
            <Link to={`/register?role=student&redirect=${encodeURIComponent(`/courses/${id}`)}`} className="btn-primary">
              Sign up to Enroll
            </Link>
            <Link to={`/login?redirect=${encodeURIComponent(`/courses/${id}`)}`} className="btn-secondary">
              Log in
            </Link>
          </>
        )}
        {user?.role === 'student' && !enrollment && (
          <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">
            {enrolling ? 'Enrolling...' : course.price > 0 ? `Enroll — $${course.price}` : 'Enroll for Free'}
          </button>
        )}
        {enrollment && (
          <Link to={`/courses/${id}/live`} className="btn-secondary">Join Live Class</Link>
        )}
        {isOwner && (
          <>
            <Link to={`/instructor/courses/${id}/manage`} className="btn-primary">Manage Course</Link>
            <Link to={`/courses/${id}/live`} className="btn-secondary">Host Live Class</Link>
          </>
        )}
      </div>

      {enrollment && (
        <div className="card p-4 mt-6 max-w-sm">
          <ProgressBar percent={enrollment.overallProgressPercent} />
          {enrollment.completed && <p className="text-mint-400 text-sm mt-2">Course completed! Check your certificates.</p>}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <h2 className="text-xl font-display font-semibold text-white mt-10 mb-4">Lessons</h2>
      <div className="space-y-2">
        {course.lessons.map((lesson, idx) => {
          const status = lessonStatus(lesson._id);
          const canAccess = enrollment || isOwner;
          const content = (
            <div className="flex items-center justify-between card p-4 hover:border-accent-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-sm text-slate-300">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{lesson.title}</p>
                  {lesson.description && <p className="text-xs text-slate-500">{lesson.description}</p>}
                </div>
              </div>
              {status?.completed && <span className="badge bg-mint-500/15 text-mint-400">Done</span>}
            </div>
          );
          return canAccess ? (
            <Link key={lesson._id} to={`/courses/${id}/lessons/${lesson._id}`}>
              {content}
            </Link>
          ) : (
            <div key={lesson._id} className="opacity-60 cursor-not-allowed">{content}</div>
          );
        })}
        {course.lessons.length === 0 && <p className="text-slate-500 text-sm">No lessons published yet.</p>}
      </div>

      {course.finalQuiz && (enrollment || isOwner) && (
        <div className="card p-5 mt-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Final Course Exam</p>
            <p className="text-sm text-slate-400">Pass this to earn your certificate of completion.</p>
          </div>
          <Link to={`/quizzes/${course.finalQuiz}?courseId=${id}`} className="btn-primary">
            {enrollment?.finalQuizPassed ? 'Retake Exam' : 'Take Exam'}
          </Link>
        </div>
      )}
    </div>
  );
}
