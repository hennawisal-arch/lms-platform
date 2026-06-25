import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/instructors').then(({ data }) => setInstructors(data.instructors)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="px-6 py-16 text-center text-slate-400">Loading instructors...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Meet Our Instructors</h1>
      <p className="text-sm text-slate-400 mb-8">The people teaching on this platform.</p>

      {instructors.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">No instructors have joined yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {instructors.map((inst) => (
            <div key={inst._id} className="card p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center font-display font-bold text-lg overflow-hidden">
                  {inst.avatar ? <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover" /> : inst.name[0]}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">{inst.name}</h3>
                  <p className="text-xs text-slate-500">
                    {inst.publishedCourseCount} course{inst.publishedCourseCount !== 1 ? 's' : ''} &middot; {inst.totalStudents} student
                    {inst.totalStudents !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {inst.bio && <p className="text-sm text-slate-400 line-clamp-3 mb-4">{inst.bio}</p>}

              {inst.courses.length > 0 && (
                <div className="mt-auto space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Courses</p>
                  {inst.courses.slice(0, 3).map((c) => (
                    <Link
                      key={c._id}
                      to={`/courses/${c._id}`}
                      className="block text-sm text-accent-400 hover:underline line-clamp-1"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
