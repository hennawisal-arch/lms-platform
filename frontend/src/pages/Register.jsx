import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetRole = searchParams.get('role') === 'instructor' ? 'instructor' : 'student';
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: presetRole });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Create your account</h1>
        <p className="text-sm text-slate-400 mb-6">Join as a student or an instructor.</p>

        {error && <div className="mb-4 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {['student', 'instructor'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold border capitalize transition-colors ${
                    form.role === r ? 'bg-accent-500 border-accent-500 text-white' : 'bg-ink-800 border-ink-600 text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-accent-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
