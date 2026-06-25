import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-white">
          <span className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center text-sm">LM</span>
          LMS Platform
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/courses" className="btn-ghost">Browse Courses</Link>
          <Link to="/instructors" className="btn-ghost">Instructors</Link>
          {user && <Link to="/dashboard" className="btn-ghost">Dashboard</Link>}
          {user && <Link to="/certificates" className="btn-ghost">Certificates</Link>}
          {user?.role === 'instructor' && <Link to="/instructor/courses/new" className="btn-ghost">Create Course</Link>}
          <Link to="/contact" className="btn-ghost">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-400">
                {user.name} <span className="badge ml-1">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
