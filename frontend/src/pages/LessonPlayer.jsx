import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import VideoPlayer from '../components/VideoPlayer';

export default function LessonPlayer() {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [certMsg, setCertMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/courses/${courseId}`);
        setCourse(data.course);
        const found = data.course.lessons.find((l) => l._id === lessonId);
        setLesson(found);

        try {
          const prog = await api.get(`/progress/${courseId}`);
          const lp = prog.data.enrollment.lessonProgress.find((p) => p.lesson === lessonId);
          setCompleted(!!lp?.completed);
        } catch {
          /* not enrolled — instructor preview */
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, lessonId]);

  const reportProgress = async (seconds, markComplete) => {
    try {
      const { data } = await api.put(`/progress/${courseId}/lesson/${lessonId}`, {
        watchedSeconds: seconds,
        completed: markComplete,
      });
      if (markComplete) setCompleted(true);
      if (data.certificateIssued) setCertMsg('🎉 Course complete! Your certificate has been issued.');
    } catch {
      /* student may not be enrolled (instructor preview) - ignore */
    }
  };

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading lesson...</div>;
  if (!lesson) return <div className="px-6 py-16 text-center text-red-400">Lesson not found.</div>;

  const currentIndex = course.lessons.findIndex((l) => l._id === lessonId);
  const nextLesson = course.lessons[currentIndex + 1];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to={`/courses/${courseId}`} className="text-sm text-slate-400 hover:text-white">&larr; Back to course</Link>

      <h1 className="text-2xl font-display font-bold text-white mt-3 mb-1">{lesson.title}</h1>
      <p className="text-sm text-slate-400 mb-5">{lesson.description}</p>

      <VideoPlayer
        filename={lesson.videoFilename}
        onTimeUpdate={(sec) => reportProgress(sec, false)}
        onEnded={() => reportProgress(lesson.durationSeconds || 0, true)}
      />

      {certMsg && (
        <div className="mt-4 bg-mint-500/10 border border-mint-500/30 text-mint-400 text-sm rounded-lg px-4 py-3">
          {certMsg} <Link to="/certificates" className="underline">View certificates</Link>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => reportProgress(lesson.durationSeconds || 0, true)}
          disabled={completed}
          className="btn-secondary"
        >
          {completed ? '✓ Marked complete' : 'Mark as complete'}
        </button>

        <div className="flex gap-2">
          {lesson.quiz && (
            <Link to={`/quizzes/${lesson.quiz}?courseId=${courseId}`} className="btn-secondary">
              Take Lesson Quiz
            </Link>
          )}
          {nextLesson && (
            <button onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson._id}`)} className="btn-primary">
              Next Lesson &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
