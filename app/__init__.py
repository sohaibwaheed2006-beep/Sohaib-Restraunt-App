"""Sohaib Restaurant Application Factory."""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import config

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'


def create_app(config_name='default'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)

    # Register blueprints
    from app.auth.routes import auth_bp
    from app.main.routes import main_bp
    from app.menu.routes import menu_bp
    from app.cart.routes import cart_bp
    from app.orders.routes import orders_bp
    from app.payment.routes import payment_bp
    from app.admin.routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(admin_bp)

    # Create tables
    with app.app_context():
        from app import models  # noqa: F401
        db.create_all()

        # Create default admin if not exists
        from app.models import User
        from werkzeug.security import generate_password_hash, check_password_hash
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            admin_user = User(
                username='admin',
                email='admin@sohaibrestaurant.com',
                password_hash=generate_password_hash('sohaibAdmin2026!'),
                phone='03001234567',
                role='admin'
            )
            db.session.add(admin_user)
            db.session.commit()
        else:
            # Dynamically upgrade weak/breached password 'admin123' if it exists in the database
            if check_password_hash(admin.password_hash, 'admin123'):
                admin.password_hash = generate_password_hash('sohaibAdmin2026!')
                db.session.commit()

        # Seed categories if empty
        from app.models import Category
        if Category.query.count() == 0:
            seed_categories = [
                Category(name='Burgers', image_url='/static/images/cat_burgers.jpg',
                         description='Juicy flame-grilled burgers loaded with flavor'),
                Category(name='Fried Chicken', image_url='/static/images/cat_chicken.jpg',
                         description='Crispy golden fried chicken, our signature'),
                Category(name='Pizza', image_url='/static/images/cat_pizza.jpg',
                         description='Hand-tossed pizzas with premium toppings'),
                Category(name='Wraps & Rolls', image_url='/static/images/cat_wraps.jpg',
                         description='Wrapped perfection with sauces and fillings'),
                Category(name='Sides', image_url='/static/images/cat_sides.jpg',
                         description='Fries, coleslaw, and more to complete your meal'),
                Category(name='Beverages', image_url='/static/images/cat_beverages.jpg',
                         description='Ice-cold drinks and refreshing shakes'),
                Category(name='Desserts', image_url='/static/images/cat_desserts.jpg',
                         description='Sweet treats to finish your feast'),
            ]
            db.session.add_all(seed_categories)
            db.session.commit()

        # Seed menu items if empty
        from app.models import MenuItem
        if MenuItem.query.count() == 0:
            items_data = [
                # Burgers (category_id=1)
                ('Classic Smash Burger', 'Double beef patty, cheddar, lettuce, tomato, special sauce', 850, '/static/images/item_smash.jpg', 1),
                ('Zinger Burger', 'Crispy chicken fillet, spicy mayo, fresh lettuce', 750, '/static/images/item_zinger.jpg', 1),
                ('BBQ Tower Burger', 'Grilled chicken, crispy onion rings, smoky BBQ sauce', 950, '/static/images/item_bbq.jpg', 1),
                ('Cheese Lover Burger', 'Triple cheese melt with beef patty and jalapeños', 900, '/static/images/item_cheese.jpg', 1),
                # Fried Chicken (category_id=2)
                ('2-Piece Chicken', '2 pieces of our signature crispy fried chicken', 550, '/static/images/item_2pc.jpg', 2),
                ('5-Piece Bucket', '5 pieces of crispy fried chicken, feeds 2', 1200, '/static/images/item_5pc.jpg', 2),
                ('10-Piece Family Bucket', '10 pieces of crispy chicken for the whole family', 2200, '/static/images/item_10pc.jpg', 2),
                ('Spicy Wings (6 pcs)', 'Hot and spicy chicken wings with dipping sauce', 650, '/static/images/item_wings.jpg', 2),
                # Pizza (category_id=3)
                ('Pepperoni Feast', 'Loaded with double pepperoni and mozzarella', 1200, '/static/images/item_pepperoni.jpg', 3),
                ('Chicken Supreme', 'Grilled chicken, peppers, onions, olives, mushrooms', 1400, '/static/images/item_supreme.jpg', 3),
                ('Margherita', 'Classic tomato, fresh mozzarella, basil', 900, '/static/images/item_margherita.jpg', 3),
                # Wraps (category_id=4)
                ('Chicken Shawarma', 'Marinated chicken, garlic sauce, pickles in pita', 550, '/static/images/item_shawarma.jpg', 4),
                ('Zinger Wrap', 'Crispy chicken strip, coleslaw, chili sauce in tortilla', 600, '/static/images/item_wrap.jpg', 4),
                ('Beef Seekh Roll', 'Spiced beef seekh kebab rolled in paratha', 500, '/static/images/item_seekh.jpg', 4),
                # Sides (category_id=5)
                ('French Fries (Large)', 'Crispy golden french fries with ketchup', 350, '/static/images/item_fries.jpg', 5),
                ('Coleslaw', 'Creamy fresh coleslaw', 200, '/static/images/item_coleslaw.jpg', 5),
                ('Onion Rings', 'Crispy battered onion rings', 300, '/static/images/item_onion.jpg', 5),
                ('Corn on the Cob', 'Buttered sweet corn on the cob', 250, '/static/images/item_corn.jpg', 5),
                # Beverages (category_id=6)
                ('Coca-Cola (500ml)', 'Ice-cold classic Coca-Cola', 180, '/static/images/item_cola.jpg', 6),
                ('Mango Shake', 'Thick creamy mango milkshake', 400, '/static/images/item_mango.jpg', 6),
                ('Chocolate Shake', 'Rich chocolate milkshake with whipped cream', 450, '/static/images/item_choco.jpg', 6),
                ('Mint Lemonade', 'Fresh mint and lemon cooler', 250, '/static/images/item_lemon.jpg', 6),
                # Desserts (category_id=7)
                ('Chocolate Lava Cake', 'Warm chocolate cake with molten center', 500, '/static/images/item_lava.jpg', 7),
                ('Vanilla Sundae', 'Vanilla ice cream with chocolate drizzle', 350, '/static/images/item_sundae.jpg', 7),
                ('Brownie with Ice Cream', 'Fudge brownie topped with vanilla scoop', 450, '/static/images/item_brownie.jpg', 7),
            ]
            for name, desc, price, img, cat_id in items_data:
                item = MenuItem(name=name, description=desc, price=price,
                                image_url=img, category_id=cat_id, is_available=True)
                db.session.add(item)
            db.session.commit()

    return app
