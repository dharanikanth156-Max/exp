const db = require('../config/db');

// GET /api/admin/farmers?status=pending|approved|all
exports.listFarmers = async (req, res) => {
  const { status = 'all' } = req.query;
  let where = "role = 'farmer'";
  if (status === 'pending') where += ' AND is_approved = FALSE';
  if (status === 'approved') where += ' AND is_approved = TRUE';

  const [rows] = await db.query(
    `SELECT id, name, email, phone, city, state, farm_name, farm_location, is_approved, is_active, created_at
     FROM users WHERE ${where} ORDER BY created_at DESC`
  );
  res.json(rows);
};

// PUT /api/admin/farmers/:id/approve
exports.approveFarmer = async (req, res) => {
  await db.query("UPDATE users SET is_approved = 1 WHERE id = ? AND role = 'farmer'", [req.params.id]);
  res.json({ message: 'Farmer approved. They can now log in and list products.' });
};

// PUT /api/admin/users/:id/suspend  { active: boolean }
exports.setUserActive = async (req, res) => {
  const { active } = req.body;
  await db.query('UPDATE users SET is_active = ? WHERE id = ?', [active ? 1 : 0, req.params.id]);
  res.json({ message: active ? 'Account re-activated.' : 'Account suspended.' });
};

// GET /api/admin/customers
exports.listCustomers = async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, name, email, phone, city, state, is_active, created_at FROM users
     WHERE role = 'customer' ORDER BY created_at DESC`
  );
  res.json(rows);
};

// GET /api/admin/products
exports.listAllProducts = async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name, u.name AS farmer_name, u.farm_name
     FROM products p JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.farmer_id
     ORDER BY p.created_at DESC`
  );
  res.json(rows);
};

// GET /api/admin/orders
exports.listAllOrders = async (req, res) => {
  const [orders] = await db.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email FROM orders o
      JOIN users u ON u.id = o.customer_id ORDER BY o.created_at DESC`
  );
  for (const order of orders) {
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
  }
  res.json(orders);
};

// GET /api/admin/sales  — dashboard summary
exports.salesSummary = async (req, res) => {
  const [[totals]] = await db.query(
    `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_price), 0) AS total_revenue
     FROM orders WHERE status != 'cancelled'`
  );
  const [[counts]] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'farmer' AND is_approved = 1) AS active_farmers,
      (SELECT COUNT(*) FROM users WHERE role = 'farmer' AND is_approved = 0) AS pending_farmers,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
      (SELECT COUNT(*) FROM products WHERE is_active = 1) AS active_products
  `);
  const [topProducts] = await db.query(`
    SELECT p.id, p.name, SUM(oi.quantity) AS units_sold, SUM(oi.quantity * oi.price) AS revenue
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    GROUP BY p.id ORDER BY revenue DESC LIMIT 5
  `);
  const [salesByCategory] = await db.query(`
    SELECT c.name AS category, SUM(oi.quantity * oi.price) AS revenue
    FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id
    GROUP BY c.id ORDER BY revenue DESC
  `);
  const [monthly] = await db.query(`
    SELECT strftime('%Y-%m', created_at) AS month, SUM(total_price) AS revenue, COUNT(*) AS orders
    FROM orders WHERE status != 'cancelled'
    GROUP BY month ORDER BY month DESC LIMIT 6
  `);

  res.json({ ...totals, ...counts, topProducts, salesByCategory, monthly });
};
