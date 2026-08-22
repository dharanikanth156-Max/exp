import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, MapPin, Minus, Plus, ShoppingCart } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  const load = () => api.get(`/products/${id}`).then((res) => setProduct(res.data)).catch(() => {});
  useEffect(() => { load(); }, [id]);

  if (!product) return <p className="text-center py-20 text-soil-700/60">Loading…</p>;

  const handleAdd = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'customer') return setMessage('Only customer accounts can add items to a cart.');
    try {
      await addToCart(product.id, qty);
      setMessage('Added to cart.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add to cart.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-10">
      <div className="bg-leaf-600/10 rounded-2xl h-80 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Leaf className="text-leaf-600/40" size={64} />
        )}
      </div>

      <div>
        {product.is_organic ? (
          <span className="inline-block bg-leaf-600 text-cream text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide mb-2">Organic</span>
        ) : null}
        <h1 className="font-display text-3xl font-semibold text-soil-900">{product.name}</h1>
        <p className="text-sm text-soil-700/60 flex items-center gap-1 mt-1">
          <MapPin size={13} /> {product.farm_name}, {product.farmer_city}
        </p>
        <div className="mt-3"><StarRating value={product.avg_rating} count={product.review_count} /></div>

        <p className="text-soil-700/80 text-sm mt-4 leading-relaxed">{product.description || 'No description provided.'}</p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-soil-900">₹{Number(product.price).toFixed(0)}</span>
          <span className="text-soil-700/60 text-sm">/ {product.unit}</span>
        </div>
        <p className="text-xs text-soil-700/50 mt-1">
          {product.quantity > 0 ? `${product.quantity} ${product.unit} available` : 'Out of stock'}
        </p>

        {message && <p className="text-sm text-leaf-600 mt-3">{message}</p>}

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center border border-soil-900/10 rounded-full">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 focus-ring rounded-full"><Minus size={15} /></button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="p-2 focus-ring rounded-full"><Plus size={15} /></button>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.quantity <= 0}
            className="flex-1 flex items-center justify-center gap-2 bg-harvest-500 text-soil-900 font-semibold py-2.5 rounded-full hover:bg-harvest-400 transition-colors disabled:opacity-50"
          >
            <ShoppingCart size={17} /> Add to cart
          </button>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold text-soil-900 mb-3">Reviews ({product.reviews?.length || 0})</h2>
          {product.reviews?.length === 0 ? (
            <p className="text-sm text-soil-700/50">No reviews yet — be the first to try it.</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((r) => (
                <div key={r.id} className="border-b border-soil-900/10 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-soil-900">{r.customer_name}</span>
                    <StarRating value={r.rating} showValue={false} size={13} />
                  </div>
                  {r.comment && <p className="text-sm text-soil-700/70 mt-1">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
