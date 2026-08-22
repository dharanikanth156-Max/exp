const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'farmdirect.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create a wrapper that mimics mysql2/promise interface
const pool = {
  query: async (sql, params = []) => {
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        return [rows];
      } else {
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
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
