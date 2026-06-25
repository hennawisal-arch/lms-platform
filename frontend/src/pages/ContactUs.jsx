import React, { useState } from 'react';
import api from '../api/axios';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong sending your message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Contact Us</h1>
      <p className="text-sm text-slate-400 mb-8">
        Questions about a course, a technical issue, or feedback on the platform — send it our way.
      </p>

      {sent ? (
        <div className="card p-10 text-center">
          <p className="text-mint-400 font-semibold mb-2">Message sent.</p>
          <p className="text-sm text-slate-400">Thanks for reaching out — we'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && <div className="text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your name</label>
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
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              className="input"
              placeholder="What's this about?"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              required
              rows={5}
              className="input"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}
