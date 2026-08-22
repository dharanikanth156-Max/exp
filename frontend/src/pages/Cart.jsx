import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, total, refreshCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => { refreshCart(); }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <ShoppingBag className="mx-auto text-soil-700/20 mb-3" size={44} />
        <p className="text-soil-700/60 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-leaf-600 font-medium text-sm">Browse fresh produce →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-soil-900 mb-6">Your cart</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.cart_item_id} className="bg-white rounded-xl shadow-crate p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-soil-900">{item.name}</p>
              <p className="text-xs text-soil-700/50">{item.farm_name} · ₹{Number(item.price).toFixed(0)}/{item.unit}</p>
            </div>
            <div className="flex items-center border border-soil-900/10 rounded-full">
              <button onClick={() => updateQuantity(item.cart_item_id, Math.max(1, Number(item.quantity) - 1))} className="p-1.5 focus-ring rounded-full"><Minus size={13} /></button>
              <span className="w-7 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.cart_item_id, Number(item.quantity) + 1)} className="p-1.5 focus-ring rounded-full"><Plus size={13} /></button>
            </div>
            <span className="w-16 text-right text-sm font-semibold text-soil-900">₹{(item.price * item.quantity).toFixed(0)}</span>
            <button onClick={() => removeItem(item.cart_item_id)} className="text-clay p-1.5 focus-ring rounded-full">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-crate p-5 mt-6 flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-soil-900">Total: ₹{total.toFixed(0)}</span>
        <button
          onClick={() => navigate('/checkout')}
          className="bg-harvest-500 text-soil-900 font-semibold px-6 py-2.5 rounded-full hover:bg-harvest-400 transition-colors"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
