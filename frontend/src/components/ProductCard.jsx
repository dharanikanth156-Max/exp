import { Link } from 'react-router-dom';
import { Leaf, MapPin } from 'lucide-react';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-crate hover:-translate-y-1 transition-transform duration-200 focus-ring"
    >
      <div className="relative h-40 bg-leaf-600/10 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Leaf className="text-leaf-600/40" size={44} />
        )}
        {product.is_organic ? (
          <span className="absolute top-2 left-2 bg-leaf-600 text-cream text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Organic
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-soil-900 text-base leading-snug truncate">{product.name}</h3>
        <p className="text-xs text-soil-700/60 flex items-center gap-1 mt-0.5">
          <MapPin size={11} /> {product.farm_name || product.farmer_name}{product.farmer_city ? `, ${product.farmer_city}` : ''}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="price-tag tag-notch pl-3 bg-harvest-500/15 rounded-r-full pr-3 py-1">
            <span className="font-display font-bold text-soil-900">₹{Number(product.price).toFixed(0)}</span>
            <span className="text-[11px] text-soil-700/70">/{product.unit}</span>
          </div>
          <StarRating value={product.avg_rating} count={product.review_count} showValue={product.review_count > 0} size={13} />
        </div>
      </div>
    </Link>
  );
}
