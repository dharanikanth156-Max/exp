const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
// role must be 'farmer' or 'customer' — admins are seeded directly in the DB
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city, state, pincode, farm_name, farm_location } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required.' });
    }
    if (!['farmer', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be farmer or customer.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const isApproved = role === 'farmer' ? 0 : 1; // SQLite stores booleans as integers

    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, address, city, state, pincode, farm_name, farm_location, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, role, phone || null, address || null, city || null, state || null,
       pincode || null, farm_name || null, farm_location || null, isApproved]
    );

    const user = { id: result.insertId, name, email, role };

    if (role === 'farmer') {
      return res.status(201).json({
        message: 'Registration submitted. Your farmer account is pending admin approval before you can list products.',
        user
      });
    }

    const token = signToken(user);
    res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'This account has been suspended. Contact support.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.role === 'farmer' && !user.is_approved) {
      return res.status(403).json({ message: 'Your farmer account is still awaiting admin approval.' });
    }

    const token = signToken(user);
    delete user.password_hash;

    res.json({ message: 'Login successful.', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

// GET /api/auth/me
exports.getProfile = async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, name, email, role, phone, address, city, state, pincode, farm_name, farm_location, is_approved, created_at
     FROM users WHERE id = ?`, [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
  res.json(rows[0]);
};

// PUT /api/auth/me
exports.updateProfile = async (req, res) => {
  const { name, phone, address, city, state, pincode, farm_name, farm_location } = req.body;
  await db.query(
    `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address),
     city = COALESCE(?, city), state = COALESCE(?, state), pincode = COALESCE(?, pincode),
     farm_name = COALESCE(?, farm_name), farm_location = COALESCE(?, farm_location)
     WHERE id = ?`,
    [name, phone, address, city, state, pincode, farm_name, farm_location, req.user.id]
  );
  res.json({ message: 'Profile updated.' });
};
