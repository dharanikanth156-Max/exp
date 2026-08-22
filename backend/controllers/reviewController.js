const db = require('../config/db');

// POST /api/reviews  { product_id, rating, comment }
// Only allowed if the customer actually has a delivered order for this product.
exports.addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  if (!product_id || !rating) {
    return res.status(400).json({ message: 'product_id and rating are required.' });
  }
  if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

  const [[eligible]] = await db.query(
    `SELECT oi.id FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE oi.product_id = ? AND o.customer_id = ? AND o.status = 'delivered'`,
    [product_id, req.user.id]
  );
  if (!eligible) {
    return res.status(403).json({ message: 'You can only review products from your own delivered orders.' });
  }

  try {
    await db.query(
      'INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [product_id, req.user.id, rating, comment || null]
    );
    res.status(201).json({ message: 'Review submitted. Thank you for your feedback!' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ message: 'You already reviewed this product.' });
    res.status(500).json({ message: 'Could not submit review.', error: err.message });
  }
};

// GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*, u.name AS customer_name FROM reviews r JOIN users u ON u.id = r.customer_id
     WHERE r.product_id = ? ORDER BY r.created_at DESC`,
    [req.params.productId]
  );
  res.json(rows);
};

// DELETE /api/reviews/:id  (owner or admin)
exports.deleteReview = async (req, res) => {
  const [[review]] = await db.query('SELECT customer_id FROM reviews WHERE id = ?', [req.params.id]);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  if (req.user.role !== 'admin' && review.customer_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own review.' });
  }
  await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
  res.json({ message: 'Review deleted.' });
};
