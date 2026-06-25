import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, BookOpen, TrendingUp, Eye, Settings2, Plus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'student') return <StudentDashboard />;
  return <InstructorDashboard />;
}

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrollments/my').then(({ data }) => setEnrollments(data.enrollments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-display font-bold text-white mb-1">My Learning</h1>
      <p className="text-sm text-slate-400 mb-8">Pick up where you left off.</p>

      {enrollments.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-300 mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((en) => (
            <div key={en._id} className="card p-4">
              <h3 className="font-display font-semibold text-white mb-1 line-clamp-1">{en.course?.title}</h3>
              <p className="text-xs text-slate-500 mb-3">Instructor: {en.course?.instructor?.name}</p>
              <ProgressBar percent={en.overallProgressPercent} />
              <div className="flex items-center justify-between mt-4">
                {en.completed ? (
                  <span className="badge bg-mint-500/15 text-mint-400">Completed</span>
                ) : (
                  <span className="text-xs text-slate-500">In progress</span>
                )}
                <Link to={`/courses/${en.course?._id}`} className="btn-secondary text-xs px-3 py-2">
                  Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, tint }) {
  const tints = {
    sky: 'bg-sky-500/15 text-sky-400',
    mint: 'bg-mint-500/15 text-mint-400',
    accent: 'bg-accent-500/15 text-accent-400',
    amber: 'bg-amber-500/15 text-amber-400',
  };
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</p>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tints[tint]}`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

function InstructorDashboard() {
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/courses/instructor/stats')
      .then(({ data }) => {
        setSummary(data.summary);
        setCourses(data.courses);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Instructor Dashboard</h1>
          <p className="text-sm text-slate-400">An overview of how your courses are performing.</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary">
          <Plus size={16} /> New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-300 mb-4">You haven't created any courses yet.</p>
          <Link to="/instructor/courses/new" className="btn-primary">Create your first course</Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={summary.totalStudents}
              sublabel="unique enrollments across all courses"
              tint="sky"
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${summary.totalRevenue.toLocaleString()}`}
              sublabel="lifetime, from current enrollments"
              tint="mint"
            />
            <StatCard
              icon={BookOpen}
              label="Courses"
              value={`${summary.publishedCourses}/${summary.totalCourses}`}
              sublabel="published / total"
              tint="accent"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg. Completion Rate"
              value={`${summary.avgCompletionRate}%`}
              sublabel="across courses with students"
              tint="amber"
            />
          </div>

          <h2 className="text-lg font-display font-semibold text-white mb-3">Your Courses</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Course</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Students</th>
                  <th className="px-5 py-3 font-semibold">Completion</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                  <th className="px-5 py-3 font-semibold">Lessons</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id} className="border-b border-ink-800 last:border-0 hover:bg-ink-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white line-clamp-1 max-w-xs">{c.title}</p>
                      <span className="badge mt-1">{c.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      {c.published ? (
                        <span className="badge bg-mint-500/15 text-mint-400">Published</span>
                      ) : (
                        <span className="badge bg-slate-500/15 text-slate-400">Draft</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{c.totalStudents}</td>
                    <td className="px-5 py-4 min-w-[140px]">
                      <ProgressBar percent={c.completionRate} showLabel={false} />
                      <p className="text-xs text-slate-500 mt-1">
                        {c.completionRate}% &middot; {c.completedCount}/{c.totalStudents || 0} finished
                      </p>
                    </td>
                    <td className="px-5 py-4 text-mint-400 font-medium">
                      {c.price > 0 ? `$${c.revenue.toLocaleString()}` : 'Free'}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{c.lessonsCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/courses/${c._id}`} className="btn-secondary text-xs px-3 py-2" title="View course">
                          <Eye size={14} />
                        </Link>
                        <Link
                          to={`/instructor/courses/${c._id}/manage`}
                          className="btn-primary text-xs px-3 py-2"
                          title="Manage course"
                        >
                          <Settings2 size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
