const db = require('../config/db');

// GET /api/cart
exports.getCart = async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.id AS cart_item_id, c.quantity, p.id AS product_id, p.name, p.price, p.unit,
            p.image_url, p.stock_quantity AS stock, u.farm_name, u.id AS farmer_id
     FROM cart c
     JOIN products p ON p.id = c.product_id
     JOIN users u ON u.id = p.farmer_id
     WHERE c.customer_id = ?`,
    [req.user.id]
  );
  const total = rows.reduce((sum, r) => sum + Number(r.price) * Number(r.quantity), 0);
  res.json({ items: rows, total });
};

// POST /api/cart  { product_id, quantity }
exports.addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id is required.' });

  const [[product]] = await db.query('SELECT stock_quantity, is_active FROM products WHERE id = ?', [product_id]);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (!product.is_active) return res.status(400).json({ message: 'This product is currently unavailable.' });
  if (Number(quantity) > Number(product.stock_quantity)) {
    return res.status(400).json({ message: `Only ${product.stock_quantity} in stock.` });
  }

  try {
    const [existing] = await db.query('SELECT id FROM cart WHERE customer_id = ? AND product_id = ?', 
      [req.user.id, product_id]);
    
    if (existing.length > 0) {
      await db.query('UPDATE cart SET quantity = ? WHERE customer_id = ? AND product_id = ?',
        [quantity, req.user.id, product_id]);
    } else {
      await db.query('INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]);
    }
  } catch (err) {
    console.error(err);
  }
  res.status(201).json({ message: 'Added to cart.' });
};

// PUT /api/cart/:cartItemId  { quantity }
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than 0.' });
  await db.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND customer_id = ?',
    [quantity, req.params.cartItemId, req.user.id]);
  res.json({ message: 'Cart updated.' });
};

// DELETE /api/cart/:cartItemId
exports.removeCartItem = async (req, res) => {
  await db.query('DELETE FROM cart_items WHERE id = ? AND customer_id = ?', [req.params.cartItemId, req.user.id]);
  res.json({ message: 'Item removed from cart.' });
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  await db.query('DELETE FROM cart_items WHERE customer_id = ?', [req.user.id]);
  res.json({ message: 'Cart cleared.' });
};
