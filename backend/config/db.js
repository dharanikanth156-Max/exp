const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'farmdirect.db');
const sqliteDb = new Database(dbPath);

// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');

// Initialize tables if they don't exist
const initDB = () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('admin', 'farmer', 'customer')),
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      farm_name TEXT,
      farm_location TEXT,
      is_approved INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      stock_quantity INTEGER DEFAULT 0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(farmer_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(customer_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      delivery_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`
  ];

  tables.forEach(table => {
    try {
      sqliteDb.exec(table);
    } catch (err) {
      console.error('Error creating table:', err.message);
    }
  });
};

// Initialize database
initDB();

const defaultCategories = ['Vegetables', 'Fruits', 'Leafy Greens', 'Grains', 'Herbs', 'Dairy'];
const categoryInsert = sqliteDb.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
const seedCategories = sqliteDb.transaction(() => {
  defaultCategories.forEach((category) => categoryInsert.run(category));
});
seedCategories();

const productColumns = sqliteDb.prepare('PRAGMA table_info(products)').all().map((column) => column.name);
if (!productColumns.includes('quantity')) sqliteDb.exec('ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0');
if (!productColumns.includes('is_organic')) sqliteDb.exec('ALTER TABLE products ADD COLUMN is_organic INTEGER DEFAULT 0');
if (!productColumns.includes('harvest_date')) sqliteDb.exec('ALTER TABLE products ADD COLUMN harvest_date TEXT');
if (!productColumns.includes('status')) sqliteDb.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active'");
if (productColumns.includes('stock_quantity') && !productColumns.includes('quantity')) {
  sqliteDb.exec('UPDATE products SET quantity = stock_quantity WHERE quantity IS NULL OR quantity = 0');
}

// Create a wrapper that mimics mysql2/promise interface
const pool = {
  query: async (sql, params = []) => {
    try {
      const sqlUpperCase = sql.trim().toUpperCase();
      
      if (sqlUpperCase.startsWith('SELECT')) {
        const stmt = sqliteDb.prepare(sql);
        const rows = stmt.all(...params);
        return [rows];
      } else if (sqlUpperCase.startsWith('INSERT')) {
        const stmt = sqliteDb.prepare(sql);
        const info = stmt.run(...params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
      } else if (sqlUpperCase.startsWith('UPDATE') || sqlUpperCase.startsWith('DELETE')) {
        const stmt = sqliteDb.prepare(sql);
        const info = stmt.run(...params);
        return [{ affectedRows: info.changes }];
      } else {
        const stmt = sqliteDb.prepare(sql);
        stmt.run(...params);
        return [{}];
      }
    } catch (err) {
      throw err;
    }
  },
  execute: async (sql, params = []) => {
    return pool.query(sql, params);
  }
};

module.exports = pool;
