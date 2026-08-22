const db = require('../config/db');

// GET /api/products  — public browse with search/filter/sort/pagination
// query params: search, category_id, min_price, max_price, organic, sort(price_asc|price_desc|newest|rating), page, limit
exports.listProducts = async (req, res) => {
  try {
    const { search, category_id, min_price, max_price, sort, page = 1, limit = 12 } = req.query;
    const where = ["p.is_active = 1"];
    const params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      where.push('p.category_id = ?');
      params.push(category_id);
    }
    if (min_price) {
      where.push('p.price >= ?');
      params.push(min_price);
    }
    if (max_price) {
      where.push('p.price <= ?');
      params.push(max_price);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'rating') orderBy = 'avg_rating DESC';

    const offset = (Number(page) - 1) * Number(limit);

    const sql = `
      SELECT p.*, c.name AS category_name, u.name AS farmer_name, u.farm_name, u.city AS farmer_city,
        COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(DISTINCT r.id) AS review_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN users u ON u.id = p.farmer_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE ${where.join(' AND ')}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [rows] = await db.query(sql, params);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM products p WHERE ${where.join(' AND ')}`,
      params.slice(0, params.length - 2)
    );

    res.json({ products: rows, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch products.', error: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name, u.name AS farmer_name, u.farm_name, u.farm_location, u.city AS farmer_city,
       COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(DISTINCT r.id) AS review_count
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.farmer_id
     LEFT JOIN reviews r ON r.product_id = p.id
     WHERE p.id = ?
     GROUP BY p.id`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });

  const [reviews] = await db.query(
    `SELECT r.*, u.name AS customer_name FROM reviews r JOIN users u ON u.id = r.customer_id
     WHERE r.product_id = ? ORDER BY r.created_at DESC`, [req.params.id]
  );

  res.json({ ...rows[0], reviews });
};

// POST /api/products  (farmer only)
exports.createProduct = async (req, res) => {
  const { category_id, name, description, price, unit, quantity, image_url, is_organic, harvest_date } = req.body;
  if (!category_id || !name || !price || !unit) {
    return res.status(400).json({ message: 'category_id, name, price and unit are required.' });
  }
  const [result] = await db.query(
    `INSERT INTO products (farmer_id, category_id, name, description, price, unit, quantity, image_url, is_organic, harvest_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, category_id, name, description || null, price, unit, quantity || 0,
      image_url || null, is_organic ? 1 : 0, harvest_date || null]
  );
  res.status(201).json({ message: 'Product added.', id: result.insertId });
};

// PUT /api/products/:id  (farmer who owns it, or admin)
exports.updateProduct = async (req, res) => {
  const [rows] = await db.query('SELECT farmer_id FROM products WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
  if (req.user.role === 'farmer' && rows[0].farmer_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only edit your own products.' });
  }

  const { category_id, name, description, price, unit, quantity, image_url, is_organic, harvest_date, status } = req.body;
  await db.query(
    `UPDATE products SET
       category_id = COALESCE(?, category_id), name = COALESCE(?, name), description = COALESCE(?, description),
       price = COALESCE(?, price), unit = COALESCE(?, unit), quantity = COALESCE(?, quantity),
       image_url = COALESCE(?, image_url), is_organic = COALESCE(?, is_organic),
       harvest_date = COALESCE(?, harvest_date), status = COALESCE(?, status)
     WHERE id = ?`,
    [category_id, name, description, price, unit, quantity, image_url,
     typeof is_organic === 'boolean' ? (is_organic ? 1 : 0) : is_organic,
     harvest_date, status, req.params.id]
  );
  res.json({ message: 'Product updated.' });
};

// DELETE /api/products/:id (farmer who owns it, or admin)
exports.deleteProduct = async (req, res) => {
  const [rows] = await db.query('SELECT farmer_id FROM products WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
  if (req.user.role === 'farmer' && rows[0].farmer_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own products.' });
  }
  await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted.' });
};

// GET /api/products/farmer/mine  (farmer's own product list, any status)
exports.myProducts = async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.farmer_id = ? ORDER BY p.created_at DESC`, [req.user.id]
  );
  res.json(rows);
};
