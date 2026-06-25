import React from 'react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course, footer }) {
  return (
    <div className="card overflow-hidden flex flex-col hover:border-accent-500/50 transition-colors">
      <div className="h-36 bg-ink-800 flex items-center justify-center overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-display font-bold text-ink-600">{course.title?.[0] || 'C'}</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge">{course.category || 'General'}</span>
          <span className="text-xs text-slate-500 capitalize">{course.level}</span>
        </div>
        <h3 className="font-display font-semibold text-white leading-snug mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
        <p className="text-xs text-slate-500 mb-4">
          By {course.instructor?.name || 'Unknown'} &middot; {course.lessons?.length ?? course.totalLessons ?? 0} lessons
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-mint-400">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
          <Link to={`/courses/${course._id}`} className="btn-secondary text-xs px-3 py-2">View Course</Link>
        </div>
        {footer}
      </div>
    </div>
  );
}
