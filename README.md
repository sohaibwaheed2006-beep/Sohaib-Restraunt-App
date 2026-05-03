# Sohaib Restaurant 🍔

A modern, full-stack food ordering web application built with Python (Flask) and MySQL. It features a premium, dark-themed UI inspired by popular fast-food chains like KFC.

## Features
- **User Authentication:** Register, login, and secure session management.
- **Dynamic Menu:** Browse by category or search for specific items.
- **Shopping Cart:** Add, update, and remove items dynamically.
- **Checkout & Payment:** Secure checkout flow with a simulated payment gateway.
- **Order Tracking:** Live visual tracking from 'Pending' to 'Delivered'.
- **Admin Dashboard:** Full CRUD management for menu items, categories, and live order status updates.
- **Stunning UI:** Glassmorphism, animations, and a rich, responsive layout.

## Setup Instructions

1. **Prerequisites:**
   - Python 3.9+
   - MySQL Server running on localhost (default root user)

2. **Database Setup:**
   Run the SQL script to create the database, tables, and seed data:
   ```bash
   mysql -u root -p < database/setup.sql
   ```
   *(Ensure your database credentials match the `config.py` file)*

3. **Install Dependencies:**
   Create a virtual environment and install packages:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
   ```

4. **Run the Application:**
   Start the Flask server:
   ```bash
   python run.py
   ```



## Tech Stack
- **Backend:** Flask, Flask-SQLAlchemy, Flask-Login, PyMySQL
- **Frontend:** HTML5, Vanilla CSS3, JavaScript, FontAwesome
- **Database:** MySQL
