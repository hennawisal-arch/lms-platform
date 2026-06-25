import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function QuizBuilder({ courseId, lessonId, isFinalQuiz, onDone, onCancel }) {
  const [title, setTitle] = useState(isFinalQuiz ? 'Final Exam' : 'Lesson Quiz');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', ''], correctOptionIndex: 0 },
  ]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateQuestion = (qi, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  };
  const updateOption = (qi, oi, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q))
    );
  };
  const addQuestion = () => setQuestions((prev) => [...prev, { questionText: '', options: ['', ''], correctOptionIndex: 0 }]);
  const removeQuestion = (qi) => setQuestions((prev) => prev.filter((_, i) => i !== qi));
  const addOption = (qi) => updateQuestion(qi, { options: [...questions[qi].options, ''] });
  const removeOption = (qi, oi) => {
    const q = questions[qi];
    if (q.options.length <= 2) return;
    updateQuestion(qi, { options: q.options.filter((_, j) => j !== oi) });
  };

  const handleSave = async () => {
    setError('');
    for (const q of questions) {
      if (!q.questionText.trim() || q.options.some((o) => !o.trim())) {
        setError('Every question needs text and all options filled in.');
        return;
      }
    }
    setSaving(true);
    try {
      await api.post('/quizzes', {
        courseId,
        lessonId: isFinalQuiz ? undefined : lessonId,
        title,
        isFinalQuiz,
        passingScorePercent: Number(passingScore),
        questions,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 mt-3 border-accent-500/40">
      <h4 className="font-semibold text-white mb-3">{isFinalQuiz ? 'Build Final Exam' : 'Build Lesson Quiz'}</h4>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="label">Quiz title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Passing score (%)</label>
          <input type="number" min="0" max="100" className="input" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="border border-ink-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Question {qi + 1}</label>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} className="text-xs text-red-400 hover:underline">Remove</button>
              )}
            </div>
            <input
              className="input mb-3"
              placeholder="Question text"
              value={q.questionText}
              onChange={(e) => updateQuestion(qi, { questionText: e.target.value })}
            />
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctOptionIndex === oi}
                    onChange={() => updateQuestion(qi, { correctOptionIndex: oi })}
                    title="Mark as correct answer"
                  />
                  <input
                    className="input flex-1"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qi, oi)} className="text-xs text-slate-500 hover:text-red-400">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => addOption(qi)} className="text-xs text-accent-400 hover:underline mt-2">+ Add option</button>
          </div>
        ))}
      </div>

      <button onClick={addQuestion} className="btn-secondary text-xs mt-4">+ Add Question</button>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <div className="flex gap-2 mt-5">
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Quiz'}</button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  );
}

function AddLessonForm({ courseId, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Lesson title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('durationSeconds', durationSeconds);
      if (video) fd.append('video', video);
      await api.post(`/courses/${courseId}/lessons`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 mt-3 border-accent-500/40 space-y-3">
      <h4 className="font-semibold text-white">Add Lesson</h4>
      <input className="input" placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="input" rows={2} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div>
        <label className="label">Duration (seconds, optional)</label>
        <input type="number" min="0" className="input" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} />
      </div>
      <div>
        <label className="label">Video file</label>
        <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} className="text-sm text-slate-300" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Uploading...' : 'Save Lesson'}</button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  );
}

function EditCourseForm({ course, onDone, onCancel }) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    category: course.category || 'General',
    level: course.level || 'beginner',
    price: course.price || 0,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      await api.put(`/courses/${course._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 mt-4 border-accent-500/40 space-y-4">
      <h4 className="font-semibold text-white">Edit Course Details</h4>

      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          rows={4}
          className="input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="label">Level</label>
          <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Price (USD, 0 for free)</label>
        <input
          type="number"
          min="0"
          className="input"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Replace thumbnail (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} className="text-sm text-slate-300" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  );
}

export default function ManageCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [quizTargetLesson, setQuizTargetLesson] = useState(null); // lessonId or 'final' or null
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/courses/${id}`);
    setCourse(data.course);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const togglePublish = async () => {
    const { data } = await api.put(`/courses/${id}`, { published: !course.published });
    setCourse(data.course);
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    const { data } = await api.delete(`/courses/${id}/lessons/${lessonId}`);
    setCourse(data.course);
  };

  const deleteCourse = async () => {
    if (!confirm(`Delete "${course.title}" permanently? This removes all lessons, quizzes, and enrolled students' progress. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
      setDeleting(false);
    }
  };

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading...</div>;
  if (!course) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to={`/courses/${id}`} className="text-sm text-slate-400 hover:text-white">&larr; Back to course page</Link>

      <div className="flex items-center justify-between mt-3 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{course.title}</h1>
          <p className="text-sm text-slate-400">Manage lessons, quizzes, and publishing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditCourse((s) => !s)} className="btn-secondary">Edit Course</button>
          <button onClick={togglePublish} className={course.published ? 'btn-secondary' : 'btn-primary'}>
            {course.published ? 'Unpublish' : 'Publish Course'}
          </button>
          <button onClick={deleteCourse} disabled={deleting} className="btn bg-red-500/15 text-red-400 hover:bg-red-500/25">
            {deleting ? 'Deleting...' : 'Delete Course'}
          </button>
        </div>
      </div>

      {showEditCourse && (
        <EditCourseForm
          course={course}
          onDone={() => { setShowEditCourse(false); load(); }}
          onCancel={() => setShowEditCourse(false)}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-display font-semibold text-white">Lessons</h2>
        <button onClick={() => setShowAddLesson((s) => !s)} className="btn-secondary text-sm">+ Add Lesson</button>
      </div>

      {showAddLesson && (
        <AddLessonForm courseId={id} onDone={() => { setShowAddLesson(false); load(); }} onCancel={() => setShowAddLesson(false)} />
      )}

      <div className="space-y-3 mt-4">
        {course.lessons.map((lesson, idx) => (
          <div key={lesson._id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-sm text-slate-300">{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{lesson.title}</p>
                  <p className="text-xs text-slate-500">{lesson.videoFilename ? 'Video uploaded' : 'No video yet'} {lesson.quiz && '· Has quiz'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!lesson.quiz && (
                  <button onClick={() => setQuizTargetLesson(lesson._id)} className="text-xs text-accent-400 hover:underline">
                    + Add Quiz
                  </button>
                )}
                <button onClick={() => deleteLesson(lesson._id)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </div>
            {quizTargetLesson === lesson._id && (
              <QuizBuilder
                courseId={id}
                lessonId={lesson._id}
                isFinalQuiz={false}
                onDone={() => { setQuizTargetLesson(null); load(); }}
                onCancel={() => setQuizTargetLesson(null)}
              />
            )}
          </div>
        ))}
        {course.lessons.length === 0 && <p className="text-slate-500 text-sm">No lessons yet — add your first one above.</p>}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-white">Final Exam</h2>
          {!course.finalQuiz && (
            <button onClick={() => setQuizTargetLesson('final')} className="btn-secondary text-sm">+ Build Final Exam</button>
          )}
        </div>
        {course.finalQuiz ? (
          <p className="text-sm text-mint-400">A final exam is configured for this course.</p>
        ) : (
          <p className="text-sm text-slate-500">No final exam yet. Students will receive a certificate after completing all lessons{course.finalQuiz ? ' and passing the exam' : ''}.</p>
        )}
        {quizTargetLesson === 'final' && (
          <QuizBuilder
            courseId={id}
            isFinalQuiz={true}
            onDone={() => { setQuizTargetLesson(null); load(); }}
            onCancel={() => setQuizTargetLesson(null)}
          />
        )}
      </div>
    </div>
  );
}
