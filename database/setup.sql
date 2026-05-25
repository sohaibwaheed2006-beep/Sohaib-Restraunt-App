-- ================================================
-- Sohaib Restaurant Database Setup
-- Run this file to create the database and tables
-- ================================================

CREATE DATABASE IF NOT EXISTS feastflow;
USE feastflow;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(300),
    description TEXT
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    image_url VARCHAR(300),
    category_id INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    options VARCHAR(500) DEFAULT NULL,
    options_total FLOAT DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount FLOAT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    payment_method VARCHAR(30),
    delivery_address TEXT,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price FLOAT NOT NULL,
    options VARCHAR(500) DEFAULT NULL,
    options_total FLOAT DEFAULT 0.0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount FLOAT NOT NULL,
    method VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ================================================
-- Seed Data: Admin User (password: admin123)
-- ================================================
INSERT INTO users (username, email, password_hash, phone, role) VALUES
('admin', 'admin@sohaibrestaurant.com', 'scrypt:32768:8:1$placeholder$admin', '03001234567', 'admin');

-- ================================================
-- Seed Data: Categories
-- ================================================
INSERT INTO categories (name, image_url, description) VALUES
('Burgers', '/static/images/cat_burgers.jpg', 'Juicy flame-grilled burgers loaded with flavor'),
('Fried Chicken', '/static/images/cat_chicken.jpg', 'Crispy golden fried chicken, our signature'),
('Pizza', '/static/images/cat_pizza.jpg', 'Hand-tossed pizzas with premium toppings'),
('Wraps & Rolls', '/static/images/cat_wraps.jpg', 'Wrapped perfection with sauces and fillings'),
('Sides', '/static/images/cat_sides.jpg', 'Fries, coleslaw, and more to complete your meal'),
('Beverages', '/static/images/cat_beverages.jpg', 'Ice-cold drinks and refreshing shakes'),
('Desserts', '/static/images/cat_desserts.jpg', 'Sweet treats to finish your feast');

-- ================================================
-- Seed Data: Menu Items
-- ================================================
INSERT INTO menu_items (name, description, price, image_url, category_id, is_available) VALUES
-- Burgers
('Classic Smash Burger', 'Double beef patty, cheddar, lettuce, tomato, special sauce', 850, '/static/images/item_smash.jpg', 1, TRUE),
('Zinger Burger', 'Crispy chicken fillet, spicy mayo, fresh lettuce', 750, '/static/images/item_zinger.jpg', 1, TRUE),
('BBQ Tower Burger', 'Grilled chicken, crispy onion rings, smoky BBQ sauce', 950, '/static/images/item_bbq.jpg', 1, TRUE),
('Cheese Lover Burger', 'Triple cheese melt with beef patty and jalapeños', 900, '/static/images/item_cheese.jpg', 1, TRUE),

-- Fried Chicken
('2-Piece Chicken', '2 pieces of our signature crispy fried chicken', 550, '/static/images/item_2pc.jpg', 2, TRUE),
('5-Piece Bucket', '5 pieces of crispy fried chicken, feeds 2', 1200, '/static/images/item_5pc.jpg', 2, TRUE),
('10-Piece Family Bucket', '10 pieces of crispy chicken for the whole family', 2200, '/static/images/item_10pc.jpg', 2, TRUE),
('Spicy Wings (6 pcs)', 'Hot and spicy chicken wings with dipping sauce', 650, '/static/images/item_wings.jpg', 2, TRUE),

-- Pizza
('Pepperoni Feast Pizza', 'Loaded with double pepperoni and mozzarella', 1200, '/static/images/item_pepperoni.jpg', 3, TRUE),
('Chicken Supreme Pizza', 'Grilled chicken, peppers, onions, olives, mushrooms', 1400, '/static/images/item_supreme.jpg', 3, TRUE),
('Margherita Pizza', 'Classic tomato, fresh mozzarella, basil', 900, '/static/images/item_margherita.jpg', 3, TRUE),

-- Wraps & Rolls
('Chicken Shawarma', 'Marinated chicken, garlic sauce, pickles in pita', 550, '/static/images/item_shawarma.jpg', 4, TRUE),
('Zinger Wrap', 'Crispy chicken strip, coleslaw, chili sauce in tortilla', 600, '/static/images/item_wrap.jpg', 4, TRUE),
('Beef Seekh Roll', 'Spiced beef seekh kebab rolled in paratha', 500, '/static/images/item_seekh.jpg', 4, TRUE),

-- Sides
('French Fries (Large)', 'Crispy golden french fries with ketchup', 350, '/static/images/item_fries.jpg', 5, TRUE),
('Coleslaw', 'Creamy fresh coleslaw', 200, '/static/images/item_coleslaw.jpg', 5, TRUE),
('Onion Rings', 'Crispy battered onion rings', 300, '/static/images/item_onion.jpg', 5, TRUE),
('Corn on the Cob', 'Buttered sweet corn on the cob', 250, '/static/images/item_corn.jpg', 5, TRUE),

-- Beverages
('Coca-Cola (500ml)', 'Ice-cold classic Coca-Cola', 180, '/static/images/item_cola.jpg', 6, TRUE),
('Mango Shake', 'Thick creamy mango milkshake', 400, '/static/images/item_mango.jpg', 6, TRUE),
('Chocolate Shake', 'Rich chocolate milkshake with whipped cream', 450, '/static/images/item_choco.jpg', 6, TRUE),
('Mint Lemonade', 'Fresh mint and lemon cooler', 250, '/static/images/item_lemon.jpg', 6, TRUE),

-- Desserts
('Chocolate Lava Cake', 'Warm chocolate cake with molten center', 500, '/static/images/item_lava.jpg', 7, TRUE),
('Vanilla Sundae', 'Vanilla ice cream with chocolate drizzle', 350, '/static/images/item_sundae.jpg', 7, TRUE),
('Brownie with Ice Cream', 'Fudge brownie topped with vanilla scoop', 450, '/static/images/item_brownie.jpg', 7, TRUE);
