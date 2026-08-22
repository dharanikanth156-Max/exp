const db = require('../config/db');

exports.listCategories = async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.*, COUNT(p.id) AS product_count FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
     GROUP BY c.id ORDER BY c.name`
  );
  res.json(rows);
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name is required.' });
  try {
    const [result] = await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null]);
    res.status(201).json({ message: 'Category created.', id: result.insertId });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ message: 'Category already exists.' });
    res.status(500).json({ message: 'Could not create category.', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  await db.query('UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
    [name, description, req.params.id]);
  res.json({ message: 'Category updated.' });
};

exports.deleteCategory = async (req, res) => {
  const [inUse] = await db.query('SELECT COUNT(*) AS c FROM products WHERE category_id = ?', [req.params.id]);
  if (inUse[0].c > 0) {
    return res.status(409).json({ message: 'Cannot delete a category that still has products assigned to it.' });
  }
  await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Category deleted.' });
};
