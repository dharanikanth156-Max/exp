import { useEffect, useState } from 'react';
import { CheckCircle2, Ban, Plus, Trash2, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

const TABS = [
  { key: 'sales', label: 'Sales' },
  { key: 'farmers', label: 'Farmers' },
  { key: 'customers', label: 'Customers' },
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'orders', label: 'Orders' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('sales');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-soil-900 mb-6">Admin console</h1>

      <div className="flex flex-wrap bg-white rounded-full p-1 shadow-crate w-fit mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${tab === t.key ? 'bg-harvest-500 text-soil-900' : 'text-soil-700/60'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && <SalesTab />}
      {tab === 'farmers' && <FarmersTab />}
      {tab === 'customers' && <CustomersTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'orders' && <OrdersTab />}
    </div>
  );
}

function Table({ head, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-crate overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-cream text-soil-700/60 text-xs uppercase">
          <tr>{head.map((h) => <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-crate p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-soil-700/60 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className="font-display text-2xl font-semibold text-soil-900 mt-2">{value}</p>
    </div>
  );
}

function SalesTab() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/admin/sales').then((r) => setData(r.data)); }, []);
  if (!data) return <p className="text-soil-700/60">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={`₹${Number(data.total_revenue).toFixed(0)}`} icon={<TrendingUp size={16} className="text-leaf-600" />} />
        <StatCard label="Total orders" value={data.total_orders} />
        <StatCard label="Active farmers" value={data.active_farmers} />
        <StatCard label="Customers" value={data.total_customers} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-crate p-5">
          <h3 className="font-medium text-soil-900 mb-3 text-sm">Top products</h3>
          <ul className="space-y-2">
            {data.topProducts.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span className="text-soil-700/80">{p.name}</span>
                <span className="font-medium text-soil-900">₹{Number(p.revenue).toFixed(0)}</span>
              </li>
            ))}
            {data.topProducts.length === 0 && <p className="text-sm text-soil-700/50">No sales yet.</p>}
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow-crate p-5">
          <h3 className="font-medium text-soil-900 mb-3 text-sm">Sales by category</h3>
          <ul className="space-y-2">
            {data.salesByCategory.map((c) => (
              <li key={c.category} className="flex justify-between text-sm">
                <span className="text-soil-700/80">{c.category}</span>
                <span className="font-medium text-soil-900">₹{Number(c.revenue).toFixed(0)}</span>
              </li>
            ))}
            {data.salesByCategory.length === 0 && <p className="text-sm text-soil-700/50">No sales yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FarmersTab() {
  const [farmers, setFarmers] = useState([]);
  const load = () => api.get('/admin/farmers').then((r) => setFarmers(r.data));
  useEffect(() => { load(); }, []);

  const approve = async (id) => { await api.put(`/admin/farmers/${id}/approve`); load(); };
  const toggleActive = async (id, active) => { await api.put(`/admin/users/${id}/suspend`, { active }); load(); };

  return (
    <Table head={['Name', 'Farm', 'Email', 'Status', 'Actions']}>
      {farmers.map((f) => (
        <tr key={f.id} className="border-t border-soil-900/5">
          <td className="px-4 py-3 font-medium text-soil-900">{f.name}</td>
          <td className="px-4 py-3">{f.farm_name || '—'}</td>
          <td className="px-4 py-3">{f.email}</td>
          <td className="px-4 py-3">
            {!f.is_approved ? <span className="text-xs text-harvest-600 font-semibold">Pending approval</span>
              : f.is_active ? <span className="text-xs text-leaf-600 font-semibold">Active</span>
              : <span className="text-xs text-clay font-semibold">Suspended</span>}
          </td>
          <td className="px-4 py-3 flex gap-2">
            {!f.is_approved && (
              <button onClick={() => approve(f.id)} className="flex items-center gap-1 text-xs font-semibold text-leaf-600"><CheckCircle2 size={14} /> Approve</button>
            )}
            {f.is_approved && (
              <button onClick={() => toggleActive(f.id, !f.is_active)} className="flex items-center gap-1 text-xs font-semibold text-clay">
                <Ban size={14} /> {f.is_active ? 'Suspend' : 'Reactivate'}
              </button>
            )}
          </td>
        </tr>
      ))}
      {farmers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-soil-700/50">No farmers registered yet.</td></tr>}
    </Table>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const load = () => api.get('/admin/customers').then((r) => setCustomers(r.data));
  useEffect(() => { load(); }, []);
  const toggleActive = async (id, active) => { await api.put(`/admin/users/${id}/suspend`, { active }); load(); };

  return (
    <Table head={['Name', 'Email', 'City', 'Status', 'Actions']}>
      {customers.map((c) => (
        <tr key={c.id} className="border-t border-soil-900/5">
          <td className="px-4 py-3 font-medium text-soil-900">{c.name}</td>
          <td className="px-4 py-3">{c.email}</td>
          <td className="px-4 py-3">{c.city || '—'}</td>
          <td className="px-4 py-3">{c.is_active ? <span className="text-xs text-leaf-600 font-semibold">Active</span> : <span className="text-xs text-clay font-semibold">Suspended</span>}</td>
          <td className="px-4 py-3">
            <button onClick={() => toggleActive(c.id, !c.is_active)} className="flex items-center gap-1 text-xs font-semibold text-clay">
              <Ban size={14} /> {c.is_active ? 'Suspend' : 'Reactivate'}
            </button>
          </td>
        </tr>
      ))}
      {customers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-soil-700/50">No customers yet.</td></tr>}
    </Table>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get('/admin/products').then((r) => setProducts(r.data)); }, []);
  const remove = async (id) => { if (!confirm('Remove this listing?')) return; await api.delete(`/products/${id}`); setProducts(products.filter((p) => p.id !== id)); };

  return (
    <Table head={['Product', 'Farmer', 'Category', 'Price', 'Status', '']}>
      {products.map((p) => (
        <tr key={p.id} className="border-t border-soil-900/5">
          <td className="px-4 py-3 font-medium text-soil-900">{p.name}</td>
          <td className="px-4 py-3">{p.farm_name || p.farmer_name}</td>
          <td className="px-4 py-3">{p.category_name}</td>
          <td className="px-4 py-3">₹{Number(p.price).toFixed(0)}/{p.unit}</td>
          <td className="px-4 py-3 capitalize">{p.status.replace('_', ' ')}</td>
          <td className="px-4 py-3"><button onClick={() => remove(p.id)} className="text-clay"><Trash2 size={15} /></button></td>
        </tr>
      ))}
      {products.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-soil-700/50">No products listed yet.</td></tr>}
    </Table>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const load = () => api.get('/categories').then((r) => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/categories', { name });
    setName('');
    load();
  };
  const remove = async (id) => {
    try { await api.delete(`/categories/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Could not delete category.'); }
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name"
          className="border border-soil-900/10 rounded-lg px-3 py-2 text-sm focus-ring flex-1 max-w-xs" />
        <button className="flex items-center gap-1 bg-leaf-600 text-cream text-sm font-semibold px-4 py-2 rounded-full">
          <Plus size={15} /> Add
        </button>
      </form>
      <Table head={['Category', 'Products', '']}>
        {categories.map((c) => (
          <tr key={c.id} className="border-t border-soil-900/5">
            <td className="px-4 py-3 font-medium text-soil-900">{c.name}</td>
            <td className="px-4 py-3">{c.product_count}</td>
            <td className="px-4 py-3"><button onClick={() => remove(c.id)} className="text-clay"><Trash2 size={15} /></button></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get('/admin/orders').then((r) => setOrders(r.data)); }, []);

  return (
    <Table head={['Order', 'Customer', 'Items', 'Total', 'Status', 'Placed']}>
      {orders.map((o) => (
        <tr key={o.id} className="border-t border-soil-900/5">
          <td className="px-4 py-3 font-medium text-soil-900">#{o.id}</td>
          <td className="px-4 py-3">{o.customer_name}</td>
          <td className="px-4 py-3">{o.items.length}</td>
          <td className="px-4 py-3">₹{Number(o.total_amount).toFixed(0)}</td>
          <td className="px-4 py-3 capitalize">{o.order_status.replace(/_/g, ' ')}</td>
          <td className="px-4 py-3 text-xs text-soil-700/60">{new Date(o.placed_at).toLocaleDateString()}</td>
        </tr>
      ))}
      {orders.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-soil-700/50">No orders yet.</td></tr>}
    </Table>
  );
}
