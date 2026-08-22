import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

const EMPTY_FORM = { category_id: '', name: '', description: '', price: '', unit: 'kg', quantity: '', image_url: '', is_organic: false, harvest_date: '' };

export default function FarmerDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadProducts = () => api.get('/products/farmer/mine').then((r) => setProducts(r.data));
  const loadOrders = () => api.get('/orders/farmer/mine').then((r) => setOrders(r.data));

  useEffect(() => {
    loadProducts();
    loadOrders();
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      category_id: p.category_id, name: p.name, description: p.description || '', price: p.price,
      unit: p.unit, quantity: p.quantity, image_url: p.image_url || '', is_organic: !!p.is_organic,
      harvest_date: p.harvest_date ? p.harvest_date.slice(0, 10) : ''
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/products/${editingId}`, form);
    } else {
      await api.post('/products', form);
    }
    setShowForm(false);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product listing?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  const updateOrderStatus = async (orderItemId, status) => {
    await api.put(`/orders/item/${orderItemId}/status`, { status });
    loadOrders();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-soil-900 mb-6">Farmer dashboard</h1>

      <div className="flex bg-white rounded-full p-1 shadow-crate w-fit mb-6">
        {[{ key: 'products', label: 'My produce' }, { key: 'orders', label: 'Incoming orders' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors ${tab === t.key ? 'bg-harvest-500 text-soil-900' : 'text-soil-700/60'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div>
          <button onClick={openNew} className="flex items-center gap-2 bg-leaf-600 text-cream text-sm font-semibold px-4 py-2 rounded-full mb-4 hover:bg-leaf-600/90 transition-colors">
            <Plus size={16} /> Add produce
          </button>

          <div className="bg-white rounded-2xl shadow-crate overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-soil-700/60 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-soil-900/5">
                    <td className="px-4 py-3 font-medium text-soil-900">{p.name}</td>
                    <td className="px-4 py-3">₹{Number(p.price).toFixed(0)}/{p.unit}</td>
                    <td className="px-4 py-3">{p.quantity} {p.unit}</td>
                    <td className="px-4 py-3 capitalize">{p.status.replace('_', ' ')}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-soil-700/60 hover:text-harvest-600"><Pencil size={15} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-clay"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-soil-700/50">No produce listed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-crate overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-soil-700/60 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Qty</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-soil-900/5">
                  <td className="px-4 py-3 font-medium text-soil-900">{o.product_name}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3">{o.quantity}</td>
                  <td className="px-4 py-3 capitalize">{o.item_status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.item_status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="text-xs border border-soil-900/10 rounded-lg px-2 py-1.5 focus-ring"
                    >
                      {['pending','confirmed','packed','out_for_delivery','delivered','cancelled'].map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-soil-700/50">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-soil-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-soil-700/50"><X size={18} /></button>
            <h2 className="font-display text-lg font-semibold text-soil-900 mb-4">{editingId ? 'Edit produce' : 'Add produce'}</h2>
            <form onSubmit={submitProduct} className="space-y-3">
              <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <div>
                <label className="text-xs font-medium text-soil-700/70">Category</label>
                <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
              <div className="grid grid-cols-3 gap-2">
                <FormField label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
                <div>
                  <label className="text-xs font-medium text-soil-700/70">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring">
                    {['kg','dozen','litre','piece'].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <FormField label="Stock" type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} required />
              </div>
              <FormField label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
              <FormField label="Harvest date" type="date" value={form.harvest_date} onChange={(v) => setForm({ ...form, harvest_date: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_organic} onChange={(e) => setForm({ ...form, is_organic: e.target.checked })} className="accent-leaf-600" />
                Organically grown
              </label>
              <button className="w-full bg-harvest-500 text-soil-900 font-semibold py-2.5 rounded-lg hover:bg-harvest-400 transition-colors mt-2">
                {editingId ? 'Save changes' : 'Add produce'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required, textarea }) {
  return (
    <div>
      <label className="text-xs font-medium text-soil-700/70">{label}</label>
      {textarea ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} required={required}
          className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
          className="w-full mt-1 border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring" />
      )}
    </div>
  );
}
