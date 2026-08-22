const db = require('../config/db');

// POST /api/orders/checkout
// { delivery_address, delivery_city, delivery_state, delivery_pincode }
// Places an order from everything currently in the customer's cart.
exports.checkout = async (req, res) => {
  const { delivery_address, delivery_city, delivery_state, delivery_pincode } = req.body;
  if (!delivery_address || !delivery_city || !delivery_state || !delivery_pincode) {
    return res.status(400).json({ message: 'All delivery fields are required.' });
  }

  try {
    // Get cart items
    const [cartRows] = await db.query(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.farmer_id, p.stock_quantity AS stock
       FROM cart c JOIN products p ON p.id = c.product_id WHERE c.customer_id = ?`,
      [req.user.id]
    );

    if (cartRows.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Check stock for all items
    for (const item of cartRows) {
      if (Number(item.quantity) > Number(item.stock)) {
        return res.status(400).json({ message: `${item.name} only has ${item.stock} left in stock.` });
      }
    }

    // Calculate total
    const total = cartRows.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders (customer_id, total_price, delivery_address, city, state, pincode, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'Pending payment')`,
      [req.user.id, total, delivery_address, delivery_city, delivery_state, delivery_pincode]
    );
    const orderId = orderResult.insertId;

    // Add order items and update stock
    for (const item of cartRows) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Reduce stock
      await db.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE customer_id = ?', [req.user.id]);

    res.status(201).json({ 
      message: 'Order placed successfully.', 
      order_id: orderId, 
      total: total 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Checkout failed.', error: err.message });
  }
};

// GET /api/orders
// List all orders for the logged-in customer
exports.listOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, COUNT(oi.id) AS item_count, SUM(oi.quantity) AS total_items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch orders.', error: err.message });
  }
};

// GET /api/orders/:orderId
// Get order details
exports.getOrder = async (req, res) => {
  try {
    const [order] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
      [req.params.orderId, req.user.id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image_url, u.name AS farmer_name, u.farm_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN users u ON u.id = p.farmer_id
       WHERE oi.order_id = ?`,
      [req.params.orderId]
    );

    res.json({ order: order[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch order.', error: err.message });
  }
};

// PUT /api/orders/:orderId
// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  if (!valid.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.orderId]);
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update order.', error: err.message });
  }
};

// GET /api/orders/mine  (customer's own orders)
exports.myOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`, [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch orders.', error: err.message });
  }
};

// GET /api/orders/:id/track
exports.trackOrder = async (req, res) => {
  try {
    const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (req.user.role === 'customer' && order[0].customer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only track your own orders.' });
    }
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...order[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch order.', error: err.message });
  }
};

// GET /api/orders/farmer/mine  (order items belonging to the logged-in farmer's products)
exports.farmerOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT oi.*, o.created_at, o.delivery_address, o.city, o.state, o.pincode, o.status,
              u.name AS customer_name, u.phone AS customer_phone, p.name AS product_name
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN users u ON u.id = o.customer_id
       JOIN products p ON p.id = oi.product_id
       WHERE p.farmer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch orders.', error: err.message });
  }
};

// PUT /api/orders/item/:orderItemId/status  (farmer updates their line item; admin can too)
// body: { status: 'confirmed'|'shipped'|'delivered'|'cancelled' }
exports.updateOrderItemStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status value.' });

  try {
    const [item] = await db.query('SELECT * FROM order_items WHERE id = ?', [req.params.orderItemId]);
    if (item.length === 0) return res.status(404).json({ message: 'Order item not found.' });
    
    const [product] = await db.query('SELECT farmer_id FROM products WHERE id = ?', [item[0].product_id]);
    if (req.user.role === 'farmer' && product[0].farmer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own order items.' });
    }

    // Update order status as well
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, item[0].order_id]);
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update order.', error: err.message });
  }
};
