import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    delivery_address: user?.address || '',
    delivery_city: user?.city || '',
    delivery_pincode: user?.pincode || '',
    payment_method: 'cod'
  });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setPlacing(true);
    try {
      const { data } = await api.post('/orders/checkout', form);
      await clearCart();
      navigate(`/orders/${data.order_id}/track`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-soil-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-crate p-6 space-y-4">
        {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="text-xs font-medium text-soil-700/70">Delivery address</label>
          <textarea
            required rows={2} value={form.delivery_address}
            onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
            className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-soil-700/70">City</label>
            <input
              value={form.delivery_city}
              onChange={(e) => setForm({ ...form, delivery_city: e.target.value })}
              className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-soil-700/70">Pincode</label>
            <input
              value={form.delivery_pincode}
              onChange={(e) => setForm({ ...form, delivery_pincode: e.target.value })}
              className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-soil-700/70 block mb-2">Payment method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'cod', label: 'Cash on delivery' },
              { key: 'upi', label: 'UPI' },
              { key: 'card', label: 'Card' },
            ].map((m) => (
              <button
                type="button" key={m.key}
                onClick={() => setForm({ ...form, payment_method: m.key })}
                className={`text-xs font-medium py-2.5 rounded-lg border transition-colors ${form.payment_method === m.key ? 'bg-harvest-500 border-harvest-500 text-soil-900' : 'border-soil-900/10 text-soil-700/70'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {form.payment_method !== 'cod' && (
            <p className="text-xs text-soil-700/50 mt-2">This is a simulated payment flow for demo purposes — no real transaction is processed.</p>
          )}
        </div>

        <div className="border-t border-soil-900/10 pt-4 flex items-center justify-between">
          <span className="text-sm text-soil-700/60">{items.length} item(s)</span>
          <span className="font-display text-lg font-semibold text-soil-900">₹{total.toFixed(0)}</span>
        </div>

        <button
          disabled={placing}
          className="w-full bg-harvest-500 text-soil-900 font-semibold py-3 rounded-full hover:bg-harvest-400 transition-colors disabled:opacity-60"
        >
          {placing ? 'Placing order…' : `Place order · ₹${total.toFixed(0)}`}
        </button>
      </form>
    </div>
  );
}
