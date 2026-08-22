import { Sprout } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-soil-900 text-cream/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display text-cream font-semibold">
          <Sprout size={18} className="text-harvest-500" /> FarmDirect
        </div>
        <p className="text-xs text-center">
          Fresh produce, straight from the farmer's field to your kitchen — no middlemen, fair prices.
        </p>
        <p className="text-xs">&copy; {new Date().getFullYear()} FarmDirect Marketplace</p>
      </div>
    </footer>
  );
}
