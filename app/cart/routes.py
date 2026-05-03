"""Cart routes: View, Add, Update, Remove, Clear."""

from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import CartItem, MenuItem

cart_bp = Blueprint('cart', __name__, url_prefix='/cart')


@cart_bp.route('/')
@login_required
def view_cart():
    """View shopping cart."""
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(item.menu_item.price * item.quantity for item in cart_items)
    return render_template('cart/view.html', cart_items=cart_items, total=total)


@cart_bp.route('/add/<int:item_id>', methods=['POST'])
@login_required
def add_to_cart(item_id):
    """Add item to cart."""
    menu_item = MenuItem.query.get_or_404(item_id)
    if not menu_item.is_available:
        flash('This item is currently unavailable.', 'error')
        return redirect(url_for('menu.browse'))

    quantity = request.form.get('quantity', 1, type=int)
    if quantity < 1:
        quantity = 1

    # Check if already in cart
    cart_item = CartItem.query.filter_by(user_id=current_user.id, item_id=item_id).first()
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(user_id=current_user.id, item_id=item_id, quantity=quantity)
        db.session.add(cart_item)

    db.session.commit()
    flash(f'{menu_item.name} added to cart!', 'success')

    # Return JSON if AJAX request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        cart_count = sum(c.quantity for c in CartItem.query.filter_by(user_id=current_user.id).all())
        return jsonify({'success': True, 'cart_count': cart_count, 'message': f'{menu_item.name} added to cart!'})

    return redirect(request.referrer or url_for('menu.browse'))


@cart_bp.route('/update/<int:cart_item_id>', methods=['POST'])
@login_required
def update_cart(cart_item_id):
    """Update cart item quantity."""
    cart_item = CartItem.query.get_or_404(cart_item_id)
    if cart_item.user_id != current_user.id:
        flash('Unauthorized action.', 'error')
        return redirect(url_for('cart.view_cart'))

    quantity = request.form.get('quantity', 1, type=int)
    if quantity < 1:
        db.session.delete(cart_item)
    else:
        cart_item.quantity = quantity
    db.session.commit()
    flash('Cart updated!', 'success')
    return redirect(url_for('cart.view_cart'))


@cart_bp.route('/remove/<int:cart_item_id>', methods=['POST'])
@login_required
def remove_from_cart(cart_item_id):
    """Remove item from cart."""
    cart_item = CartItem.query.get_or_404(cart_item_id)
    if cart_item.user_id != current_user.id:
        flash('Unauthorized action.', 'error')
        return redirect(url_for('cart.view_cart'))

    db.session.delete(cart_item)
    db.session.commit()
    flash('Item removed from cart.', 'info')

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        cart_count = sum(c.quantity for c in CartItem.query.filter_by(user_id=current_user.id).all())
        return jsonify({'success': True, 'cart_count': cart_count})

    return redirect(url_for('cart.view_cart'))


@cart_bp.route('/clear', methods=['POST'])
@login_required
def clear_cart():
    """Clear entire cart."""
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    flash('Cart cleared.', 'info')
    return redirect(url_for('cart.view_cart'))


@cart_bp.route('/count')
@login_required
def cart_count():
    """Get cart count (AJAX endpoint)."""
    count = sum(c.quantity for c in CartItem.query.filter_by(user_id=current_user.id).all())
    return jsonify({'count': count})
