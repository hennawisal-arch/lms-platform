// import React, { useState } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const redirectTo = searchParams.get('redirect') || '/dashboard';

//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await login(form.email, form.password);
//       navigate(redirectTo);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto px-6 py-16">
//       <div className="card p-8">
//         <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
//         <p className="text-sm text-slate-400 mb-6">Log in to continue learning.</p>

//         {error && <div className="mb-4 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="label">Email</label>
//             <input
//               type="email"
//               required
//               className="input"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               placeholder="you@example.com"
//             />
//           </div>
//           <div>
//             <label className="label">Password</label>
//             <input
//               type="password"
//               required
//               className="input"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               placeholder="••••••••"
//             />
//           </div>
//           <button type="submit" disabled={loading} className="btn-primary w-full">
//             {loading ? 'Logging in...' : 'Log in'}
//           </button>
//         </form>

//         <p className="text-sm text-slate-400 mt-6 text-center">
//           Don't have an account?{' '}
//           <Link to={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-accent-400 hover:underline">
//             Sign up
//           </Link>
//         </p>
//         <p className="text-xs text-slate-500 mt-4 text-center">
//           Demo: instructor@lms.test / student@lms.test &middot; password123
//         </p>
//       </div>
//     </div>
//   );
// }








import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Demo accounts for visitors to explore the platform without signing up.
// These must already exist in the database (created via the seed script).
const DEMO_INSTRUCTOR = { email: 'instructor@lms.test', password: 'password123' };
const DEMO_STUDENT = { email: 'student@lms.test', password: 'password123' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null); // 'instructor' | 'student' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setDemoLoading(role);
    const creds = role === 'instructor' ? DEMO_INSTRUCTOR : DEMO_STUDENT;
    try {
      await login(creds.email, creds.password);
      navigate(redirectTo);
    } catch (err) {
      setError('Demo account unavailable right now — please use your own account, or sign up.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-slate-400 mb-6">Log in to continue learning.</p>

        {error && <div className="mb-4 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}

        {/* One-click demo access for visitors checking out the site */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => handleDemoLogin('student')}
            disabled={!!demoLoading}
            className="btn-secondary justify-center"
          >
            {demoLoading === 'student' ? 'Logging in...' : 'Try as Student'}
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('instructor')}
            disabled={!!demoLoading}
            className="btn-secondary justify-center"
          >
            {demoLoading === 'instructor' ? 'Logging in...' : 'Try as Instructor'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-ink-700" />
          <span className="text-xs text-slate-500">or log in with your account</span>
          <div className="flex-1 h-px bg-ink-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Don't have an account?{' '}
          <Link to={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-accent-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}