import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../api/axios';

const statusColor = {
  placed: 'bg-soil-900/10 text-soil-900',
  confirmed: 'bg-harvest-500/20 text-harvest-600',
  packed: 'bg-harvest-500/20 text-harvest-600',
  out_for_delivery: 'bg-leaf-600/15 text-leaf-600',
  delivered: 'bg-leaf-600/20 text-leaf-600',
  cancelled: 'bg-clay/15 text-clay'
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data)).catch(() => {});
  }, []);

  if (orders.length === 0) {
    return (
      <div className="text-center py-24">
        <Package className="mx-auto text-soil-700/20 mb-3" size={44} />
        <p className="text-soil-700/60">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-soil-900 mb-6">My orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            to={`/orders/${order.id}/track`}
            key={order.id}
            className="block bg-white rounded-xl shadow-crate p-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-soil-900">Order #{order.id}</p>
                <p className="text-xs text-soil-700/50">{new Date(order.placed_at).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[order.order_status]}`}>
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mt-2 text-sm text-soil-700/70">
              {order.items.map((i) => i.product_name).join(', ')}
            </div>
            <div className="mt-2 text-sm font-semibold text-soil-900">₹{Number(order.total_amount).toFixed(0)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
