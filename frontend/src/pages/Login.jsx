import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Sprout className="mx-auto text-leaf-600 mb-2" size={32} />
          <h1 className="font-display text-2xl font-semibold text-soil-900">Welcome back</h1>
          <p className="text-sm text-soil-700/60 mt-1">Log in to browse or manage your farm.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-crate p-6 space-y-4">
          {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="text-xs font-medium text-soil-700/70">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-soil-700/70">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring"
            />
          </div>
          <button
            disabled={submitting}
            className="w-full bg-harvest-500 text-soil-900 font-semibold py-2.5 rounded-lg hover:bg-harvest-400 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-soil-700/60 mt-5">
          New to FarmDirect? <Link to="/register" className="text-leaf-600 font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
