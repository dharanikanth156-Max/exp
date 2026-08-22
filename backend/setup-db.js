const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔧 Attempting to connect to MySQL...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Password: ${process.env.DB_PASSWORD ? '***' : 'empty'}`);

    // First, connect without specifying a database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL successfully!');

    // Read the schema file
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    
    // Execute the entire schema at once
    await connection.query(schema);
    
    console.log('\n✅ Database and tables created successfully!');
    console.log('Database: farmdirect');
    console.log('Tables: users, categories, products, reviews, orders, order_items, cart');

    await connection.end();
    console.log('✅ Setup complete!');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Verify your root password in .env file');
    console.error('3. Check if you have permission to create databases');
    process.exit(1);
  }
}

setupDatabase();
