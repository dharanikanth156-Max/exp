import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Leaf } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [organic, setOrganic] = useState(false);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, sort };
      if (categoryId) params.category_id = categoryId;
      if (organic) params.organic = 'true';
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, organic, sort]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-soil-900 text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block text-harvest-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Field to doorstep, no middlemen
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.1]">
              This week's harvest, priced by the farmer who grew it.
            </h1>
            <p className="mt-4 text-cream/70 text-base max-w-md">
              Browse produce straight from local farms, see exactly who grew it, and pay the price they actually set — not a distributor's markup.
            </p>
          </div>
          <div className="relative">
            <div className="bg-harvest-500/10 border border-harvest-500/30 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-harvest-400 text-sm font-semibold mb-2">
                <Leaf size={16} /> Today on FarmDirect
              </div>
              <p className="text-2xl font-display font-semibold">{products.length}+ fresh listings</p>
              <p className="text-cream/60 text-sm mt-1">from farms across the region, updated as they're picked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-7">
        <div className="bg-white rounded-2xl shadow-crate p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center flex-1 bg-cream rounded-xl px-3">
            <Search size={18} className="text-soil-700/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tomatoes, mangoes, dal..."
              className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 text-sm font-medium border border-soil-900/10 rounded-xl px-4 py-2.5 hover:bg-cream transition-colors focus-ring"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl shadow-crate p-4 mt-2 flex flex-wrap gap-4 items-center">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="text-sm border border-soil-900/10 rounded-lg px-3 py-2 focus-ring"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.product_count})</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-soil-900/10 rounded-lg px-3 py-2 focus-ring"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={organic} onChange={(e) => setOrganic(e.target.checked)} className="accent-leaf-600" />
              Organic only
            </label>
          </div>
        )}
      </section>

      {/* Product grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <p className="text-center text-soil-700/60 py-16">Loading fresh listings…</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Leaf className="mx-auto text-soil-700/20 mb-3" size={40} />
            <p className="text-soil-700/60">No produce matches those filters yet. Try widening your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
