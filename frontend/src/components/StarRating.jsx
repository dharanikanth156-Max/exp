import { Star } from 'lucide-react';

export default function StarRating({ value = 0, size = 15, showValue = true, count }) {
  const rounded = Math.round(Number(value) * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? 'fill-harvest-500 text-harvest-500' : 'text-soil-700/30'}
          />
        ))}
      </div>
      {showValue && Number(value) > 0 && (
        <span className="text-xs text-soil-700/70">
          {Number(value).toFixed(1)}{count !== undefined ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}
