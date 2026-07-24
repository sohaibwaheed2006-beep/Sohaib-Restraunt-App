"""Database models for BiteBuddy."""

from datetime import datetime, timezone
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login."""
    return User.query.get(int(user_id))


class User(UserMixin, db.Model):
    """User model for customers and admins."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    role = db.Column(db.String(20), default='customer')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check hashed password."""
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        """Check if user is admin."""
        return self.role == 'admin'

    def __repr__(self):
        return f'<User {self.username}>'


class Category(db.Model):
    """Food category model."""
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    image_url = db.Column(db.String(300))
    description = db.Column(db.Text)

    # Relationships
    items = db.relationship('MenuItem', backref='category', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Category {self.name}>'


class MenuItem(db.Model):
    """Menu item model."""
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(300))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<MenuItem {self.name}>'


class CartItem(db.Model):
    """Shopping cart item model."""
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    options = db.Column(db.String(500))
    options_total = db.Column(db.Float, default=0.0)

    # Relationships
    menu_item = db.relationship('MenuItem', backref='cart_entries', lazy=True)

    def __repr__(self):
        return f'<CartItem user={self.user_id} item={self.item_id}>'


class Order(db.Model):
    """Order model."""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default='pending')
    payment_method = db.Column(db.String(30))
    delivery_address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False, cascade='all, delete-orphan')

    # Status options
    STATUS_CHOICES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

    @property
    def status_display(self):
        """Human-readable status."""
        return self.status.replace('_', ' ').title()

    @property
    def status_percentage(self):
        """Progress percentage for tracking."""
        progress = {
            'pending': 10,
            'confirmed': 25,
            'preparing': 50,
            'out_for_delivery': 75,
            'delivered': 100,
            'cancelled': 0,
        }
        return progress.get(self.status, 0)

    def __repr__(self):
        return f'<Order #{self.id} - {self.status}>'


class OrderItem(db.Model):
    """Individual item within an order."""
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    options = db.Column(db.String(500))
    options_total = db.Column(db.Float, default=0.0)

    # Relationships
    menu_item = db.relationship('MenuItem', backref='order_entries', lazy=True)

    @property
    def subtotal(self):
        """Calculate subtotal for this order item."""
        opt_total = self.options_total if self.options_total else 0.0
        return (self.price + opt_total) * self.quantity

    def __repr__(self):
        return f'<OrderItem order={self.order_id} item={self.item_id}>'


class Payment(db.Model):
    """Payment model."""
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(30), default='pending')
    transaction_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Payment #{self.id} - {self.status}>'
