-- ============================================================
-- Farmers' Direct Produce Marketplace — MySQL Schema
-- ============================================================
DROP DATABASE IF EXISTS farmdirect;
CREATE DATABASE farmdirect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmdirect;

-- ---------------------------------------------------------
-- USERS (single table, role-differentiated)
-- ---------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','farmer','customer') NOT NULL DEFAULT 'customer',
  phone         VARCHAR(20),
  address       VARCHAR(255),
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(12),
  -- farmer-only fields
  farm_name     VARCHAR(150),
  farm_location VARCHAR(255),
  is_approved   BOOLEAN DEFAULT FALSE,   -- admin must approve farmers
  is_active     BOOLEAN DEFAULT TRUE,    -- admin can suspend any account
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id     INT NOT NULL,
  category_id   INT NOT NULL,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  unit          VARCHAR(20) NOT NULL DEFAULT 'kg', -- kg, dozen, litre, piece
  quantity      DECIMAL(10,2) NOT NULL DEFAULT 0,   -- stock available
  image_url     VARCHAR(500),
  is_organic    BOOLEAN DEFAULT FALSE,
  harvest_date  DATE,
  status        ENUM('active','inactive','out_of_stock') DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ---------------------------------------------------------
-- CART (persisted server-side per customer)
-- ---------------------------------------------------------
CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    DECIMAL(10,2) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_line (customer_id, product_id)
);

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
CREATE TABLE orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_id      INT NOT NULL,
  total_amount     DECIMAL(12,2) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  delivery_city    VARCHAR(100),
  delivery_pincode VARCHAR(12),
  payment_method   ENUM('cod','card','upi') NOT NULL DEFAULT 'cod',
  payment_status   ENUM('pending','paid','failed') DEFAULT 'pending',
  order_status     ENUM('placed','confirmed','packed','out_for_delivery','delivered','cancelled') DEFAULT 'placed',
  placed_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Each order can contain items from multiple farmers
CREATE TABLE order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  product_id   INT NOT NULL,
  farmer_id    INT NOT NULL,
  product_name VARCHAR(150) NOT NULL, -- snapshot at time of order
  unit_price   DECIMAL(10,2) NOT NULL,
  quantity     DECIMAL(10,2) NOT NULL,
  line_total   DECIMAL(12,2) NOT NULL,
  item_status  ENUM('pending','confirmed','packed','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- ---------------------------------------------------------
-- DELIVERY TRACKING
-- ---------------------------------------------------------
CREATE TABLE delivery_tracking (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  status      VARCHAR(50) NOT NULL,
  note        VARCHAR(255),
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- PAYMENTS (simulated gateway record)
-- ---------------------------------------------------------
CREATE TABLE payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  order_id       INT NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  method         ENUM('cod','card','upi') NOT NULL,
  transaction_ref VARCHAR(100),
  status         ENUM('pending','success','failed') DEFAULT 'pending',
  paid_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- RATINGS & REVIEWS
-- ---------------------------------------------------------
CREATE TABLE reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  customer_id INT NOT NULL,
  order_id    INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY one_review_per_order_item (customer_id, product_id, order_id)
);

-- ---------------------------------------------------------
-- SEED DATA
-- ---------------------------------------------------------
INSERT INTO categories (name, description) VALUES
('Vegetables', 'Fresh seasonal vegetables'),
('Fruits', 'Farm-fresh fruits'),
('Grains & Pulses', 'Rice, wheat, lentils and more'),
('Dairy', 'Milk, paneer, ghee'),
('Herbs & Spices', 'Fresh herbs and home-grown spices');

-- password for all seed accounts below is: Password123  (bcrypt hash)
INSERT INTO users (name, email, password_hash, role, phone, city, state, is_approved) VALUES
('Site Admin', 'admin@farmdirect.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gZ5G1z3g0X7WlQpX6Q1a1a1a1a1a1', 'admin', '9000000000', 'Chennai', 'Tamil Nadu', TRUE);

INSERT INTO users (name, email, password_hash, role, phone, city, state, farm_name, farm_location, is_approved) VALUES
('Murugan Farms', 'murugan@farmdirect.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gZ5G1z3g0X7WlQpX6Q1a1a1a1a1a1', 'farmer', '9111111111', 'Coimbatore', 'Tamil Nadu', 'Murugan Organic Farms', 'Pollachi, Coimbatore', TRUE);

INSERT INTO users (name, email, password_hash, role, phone, city, state) VALUES
('Divya Ramesh', 'divya@example.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8gZ5G1z3g0X7WlQpX6Q1a1a1a1a1a1', 'customer', '9222222222', 'Chennai', 'Tamil Nadu');

INSERT INTO products (farmer_id, category_id, name, description, price, unit, quantity, is_organic, harvest_date) VALUES
(2, 1, 'Tomatoes', 'Vine-ripened country tomatoes', 35.00, 'kg', 120, TRUE, '2026-08-18'),
(2, 2, 'Alphonso Mangoes', 'Sweet Alphonso mangoes, hand-picked', 180.00, 'dozen', 40, TRUE, '2026-08-15'),
(2, 3, 'Toor Dal', 'Home-processed toor dal', 140.00, 'kg', 200, FALSE, '2026-07-20');
