import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function QuizPage() {
  const { id: quizId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> selectedOptionIndex
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/quizzes/${quizId}`)
      .then(({ data }) => setQuiz(data.quiz))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({ questionId, selectedOptionIndex })),
      };
      const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading quiz...</div>;
  if (error && !quiz) return <div className="px-6 py-16 text-center text-red-400">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {courseId && (
        <Link to={`/courses/${courseId}`} className="text-sm text-slate-400 hover:text-white">&larr; Back to course</Link>
      )}
      <h1 className="text-2xl font-display font-bold text-white mt-3 mb-1">{quiz.title}</h1>
      <p className="text-sm text-slate-400 mb-6">
        Passing score: {quiz.passingScorePercent}% &middot; {quiz.questions.length} question(s)
      </p>

      {result ? (
        <div className="card p-6">
          <div className={`text-center mb-6 ${result.passed ? 'text-mint-400' : 'text-red-400'}`}>
            <p className="text-3xl font-display font-bold">{result.scorePercent}%</p>
            <p className="font-semibold mt-1">{result.passed ? 'Passed!' : 'Not quite — try again'}</p>
            {result.certificateIssued && <p className="text-sm mt-2 text-mint-400">🎉 Certificate issued — check your Certificates page!</p>}
          </div>

          <div className="space-y-4">
            {result.reviewedQuestions.map((q, idx) => {
              const isCorrect = q.yourAnswer === q.correctOptionIndex;
              return (
                <div key={q._id} className="border-t border-ink-700 pt-4">
                  <p className="text-sm font-medium text-white mb-2">{idx + 1}. {q.questionText}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isYours = oi === q.yourAnswer;
                      const isRight = oi === q.correctOptionIndex;
                      let style = 'border-ink-700 text-slate-400';
                      if (isRight) style = 'border-mint-500 text-mint-400 bg-mint-500/10';
                      else if (isYours && !isCorrect) style = 'border-red-500 text-red-400 bg-red-500/10';
                      return (
                        <div key={oi} className={`text-sm rounded-lg border px-3 py-2 ${style}`}>
                          {opt} {isYours && <span className="text-xs opacity-70">(your answer)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }} className="btn-primary w-full mt-6">
              Try Again
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="card p-5">
              <p className="text-sm font-medium text-white mb-3">{idx + 1}. {q.questionText}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-3 text-sm rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                      answers[q._id] === oi ? 'border-accent-500 bg-accent-500/10 text-white' : 'border-ink-700 text-slate-300 hover:border-ink-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === oi}
                      onChange={() => selectAnswer(q._id, oi)}
                      className="accent-accent-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
            className="btn-primary w-full"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
