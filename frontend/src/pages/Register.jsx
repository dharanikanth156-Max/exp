import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', city: '', state: '',
    address: '', pincode: '', farm_name: '', farm_location: ''
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setSubmitting(true);
    const res = await register({ ...form, role });
    setSubmitting(false);
    if (res.success) {
      if (role === 'farmer') {
        setInfo(res.message);
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Sprout className="mx-auto text-leaf-600 mb-2" size={32} />
          <h1 className="font-display text-2xl font-semibold text-soil-900">Join FarmDirect</h1>
          <p className="text-sm text-soil-700/60 mt-1">Sell what you grow, or shop straight from the farm.</p>
        </div>

        <div className="flex bg-white rounded-full p-1 shadow-crate mb-5">
          {['customer', 'farmer'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${role === r ? 'bg-harvest-500 text-soil-900' : 'text-soil-700/60'}`}
            >
              {r === 'customer' ? 'I want to buy' : 'I want to sell'}
            </button>
          ))}
        </div>

        {info ? (
          <div className="bg-white rounded-2xl shadow-crate p-6 text-center space-y-3">
            <p className="text-sm text-soil-900">{info}</p>
            <Link to="/login" className="inline-block text-leaf-600 font-medium text-sm">Go to log in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-crate p-6 space-y-3">
            {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
            <Field label="Full name" value={form.name} onChange={update('name')} required />
            <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
            <Field label="Password" type="password" value={form.password} onChange={update('password')} required />
            <Field label="Phone" value={form.phone} onChange={update('phone')} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={update('city')} />
              <Field label="State" value={form.state} onChange={update('state')} />
            </div>

            {role === 'customer' && (
              <>
                <Field label="Delivery address" value={form.address} onChange={update('address')} />
                <Field label="Pincode" value={form.pincode} onChange={update('pincode')} />
              </>
            )}

            {role === 'farmer' && (
              <>
                <Field label="Farm name" value={form.farm_name} onChange={update('farm_name')} />
                <Field label="Farm location" value={form.farm_location} onChange={update('farm_location')} />
                <p className="text-xs text-soil-700/50">Farmer accounts are reviewed by our team before you can list produce — usually within a day.</p>
              </>
            )}

            <button
              disabled={submitting}
              className="w-full bg-harvest-500 text-soil-900 font-semibold py-2.5 rounded-lg hover:bg-harvest-400 transition-colors disabled:opacity-60 mt-2"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-soil-700/60 mt-5">
          Already have an account? <Link to="/login" className="text-leaf-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label className="text-xs font-medium text-soil-700/70">{label}</label>
      <input
        type={type} value={value} onChange={onChange} required={required}
        className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring"
      />
    </div>
  );
}
