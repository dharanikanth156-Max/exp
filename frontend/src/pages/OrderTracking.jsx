import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Star } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STAGES = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [reviewState, setReviewState] = useState({}); // productId -> { rating, comment }
  const [submitted, setSubmitted] = useState({});

  const load = () => api.get(`/orders/${id}/track`).then((res) => setOrder(res.data)).catch(() => {});
  useEffect(() => { load(); }, [id]);

  if (!order) return <p className="text-center py-20 text-soil-700/60">Loading…</p>;

  const currentStageIndex = STAGES.indexOf(order.order_status) >= 0 ? STAGES.indexOf(order.order_status) : 0;

  const submitReview = async (productId) => {
    const rv = reviewState[productId] || { rating: 5, comment: '' };
    try {
      await api.post('/reviews', { product_id: productId, order_id: order.id, rating: rv.rating, comment: rv.comment });
      setSubmitted({ ...submitted, [productId]: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit review.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-soil-900 mb-1">Order #{order.id}</h1>
      <p className="text-sm text-soil-700/60 mb-6">Placed {new Date(order.placed_at).toLocaleString()}</p>

      {order.order_status !== 'cancelled' && (
        <div className="bg-white rounded-2xl shadow-crate p-6 mb-6">
          <div className="flex items-center justify-between">
            {STAGES.map((stage, idx) => (
              <div key={stage} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && (
                  <div className={`absolute top-3 right-1/2 w-full h-0.5 ${idx <= currentStageIndex ? 'bg-leaf-600' : 'bg-soil-900/10'}`} />
                )}
                {idx <= currentStageIndex ? (
                  <CheckCircle2 className="text-leaf-600 z-10 bg-white" size={22} />
                ) : (
                  <Circle className="text-soil-900/20 z-10 bg-white" size={22} />
                )}
                <span className="text-[10px] text-soil-700/60 mt-1.5 capitalize text-center">{stage.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-crate p-5 mb-6">
        <h2 className="font-medium text-soil-900 mb-3 text-sm">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="border-b border-soil-900/10 pb-3 last:border-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-soil-900">{item.product_name} × {item.quantity}</span>
                <span className="font-medium text-soil-900">₹{Number(item.line_total).toFixed(0)}</span>
              </div>
              <span className="text-xs text-soil-700/50 capitalize">{item.item_status.replace(/_/g, ' ')}</span>

              {user?.role === 'customer' && item.item_status === 'delivered' && !submitted[item.product_id] && (
                <div className="mt-2 flex items-center gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} onClick={() => setReviewState({ ...reviewState, [item.product_id]: { ...(reviewState[item.product_id] || {}), rating: n } })}>
                      <Star size={16} className={(reviewState[item.product_id]?.rating || 5) >= n ? 'fill-harvest-500 text-harvest-500' : 'text-soil-900/20'} />
                    </button>
                  ))}
                  <input
                    placeholder="Add a comment (optional)"
                    className="flex-1 text-xs border border-soil-900/10 rounded-lg px-2 py-1.5 focus-ring"
                    onChange={(e) => setReviewState({ ...reviewState, [item.product_id]: { ...(reviewState[item.product_id] || { rating: 5 }), comment: e.target.value } })}
                  />
                  <button onClick={() => submitReview(item.product_id)} className="text-xs font-semibold text-leaf-600">Submit</button>
                </div>
              )}
              {submitted[item.product_id] && <p className="text-xs text-leaf-600 mt-1">Thanks for your review!</p>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-soil-900/10 text-sm font-semibold text-soil-900">
          <span>Total</span><span>₹{Number(order.total_amount).toFixed(0)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-crate p-5">
        <h2 className="font-medium text-soil-900 mb-3 text-sm">Delivery history</h2>
        <ul className="space-y-2">
          {order.history.map((h) => (
            <li key={h.id} className="text-xs text-soil-700/70 flex justify-between">
              <span>{h.note}</span>
              <span className="text-soil-700/40">{new Date(h.updated_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
