"""Admin routes: Dashboard, Manage items, Manage orders."""

from functools import wraps
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.models import User, Category, MenuItem, Order

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_required(f):
    """Decorator to restrict access to admins only."""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('main.home'))
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/')
@admin_required
def dashboard():
    """Admin dashboard with stats."""
    total_users = User.query.count()
    total_orders = Order.query.count()
    total_items = MenuItem.query.count()
    pending_orders = Order.query.filter_by(status='pending').count()
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()

    total_revenue = db.session.query(db.func.sum(Order.total_amount))\
        .filter(Order.status != 'cancelled').scalar() or 0

    return render_template('admin/dashboard.html',
                           total_users=total_users,
                           total_orders=total_orders,
                           total_items=total_items,
                           pending_orders=pending_orders,
                           recent_orders=recent_orders,
                           total_revenue=total_revenue)


@admin_bp.route('/items')
@admin_required
def manage_items():
    """Manage menu items."""
    items = MenuItem.query.order_by(MenuItem.category_id).all()
    categories = Category.query.all()
    return render_template('admin/items.html', items=items, categories=categories)


@admin_bp.route('/items/add', methods=['GET', 'POST'])
@admin_required
def add_item():
    """Add a new menu item."""
    categories = Category.query.all()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', type=float)
        category_id = request.form.get('category_id', type=int)
        image_url = request.form.get('image_url', '').strip()
        is_available = request.form.get('is_available') == 'on'

        if not name or not price or not category_id:
            flash('Name, price, and category are required.', 'error')
            return render_template('admin/item_form.html', categories=categories,
                                   action='Add')

        item = MenuItem(
            name=name, description=description, price=price,
            category_id=category_id, image_url=image_url or '/static/images/default_food.jpg',
            is_available=is_available
        )
        db.session.add(item)
        db.session.commit()
        flash(f'{name} added to the menu!', 'success')
        return redirect(url_for('admin.manage_items'))

    return render_template('admin/item_form.html', categories=categories, action='Add')


@admin_bp.route('/items/edit/<int:item_id>', methods=['GET', 'POST'])
@admin_required
def edit_item(item_id):
    """Edit an existing menu item."""
    item = MenuItem.query.get_or_404(item_id)
    categories = Category.query.all()

    if request.method == 'POST':
        item.name = request.form.get('name', '').strip()
        item.description = request.form.get('description', '').strip()
        item.price = request.form.get('price', type=float)
        item.category_id = request.form.get('category_id', type=int)
        item.image_url = request.form.get('image_url', '').strip() or '/static/images/default_food.jpg'
        item.is_available = request.form.get('is_available') == 'on'

        db.session.commit()
        flash(f'{item.name} updated!', 'success')
        return redirect(url_for('admin.manage_items'))

    return render_template('admin/item_form.html', item=item,
                           categories=categories, action='Edit')


@admin_bp.route('/items/delete/<int:item_id>', methods=['POST'])
@admin_required
def delete_item(item_id):
    """Delete a menu item."""
    item = MenuItem.query.get_or_404(item_id)
    name = item.name
    db.session.delete(item)
    db.session.commit()
    flash(f'{name} deleted from menu.', 'info')
    return redirect(url_for('admin.manage_items'))


@admin_bp.route('/orders')
@admin_required
def manage_orders():
    """View and manage all orders."""
    status_filter = request.args.get('status', '')
    if status_filter:
        orders = Order.query.filter_by(status=status_filter)\
            .order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.order_by(Order.created_at.desc()).all()

    return render_template('admin/orders.html', orders=orders,
                           status_filter=status_filter)


@admin_bp.route('/orders/<int:order_id>/update-status', methods=['POST'])
@admin_required
def update_order_status(order_id):
    """Update order status."""
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status', '')

    if new_status in Order.STATUS_CHOICES:
        order.status = new_status
        db.session.commit()
        flash(f'Order #{order.id} updated to {order.status_display}.', 'success')
    else:
        flash('Invalid status.', 'error')

    return redirect(url_for('admin.manage_orders'))


@admin_bp.route('/categories')
@admin_required
def manage_categories():
    """Manage categories."""
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)


@admin_bp.route('/categories/add', methods=['POST'])
@admin_required
def add_category():
    """Add a new category."""
    name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    image_url = request.form.get('image_url', '').strip()

    if not name:
        flash('Category name is required.', 'error')
        return redirect(url_for('admin.manage_categories'))

    if Category.query.filter_by(name=name).first():
        flash('Category already exists.', 'error')
        return redirect(url_for('admin.manage_categories'))

    category = Category(name=name, description=description,
                        image_url=image_url or '/static/images/default_cat.jpg')
    db.session.add(category)
    db.session.commit()
    flash(f'Category "{name}" added!', 'success')
    return redirect(url_for('admin.manage_categories'))


@admin_bp.route('/categories/delete/<int:cat_id>', methods=['POST'])
@admin_required
def delete_category(cat_id):
    """Delete a category."""
    category = Category.query.get_or_404(cat_id)
    name = category.name
    db.session.delete(category)
    db.session.commit()
    flash(f'Category "{name}" deleted.', 'info')
    return redirect(url_for('admin.manage_categories'))
