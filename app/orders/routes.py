"""Order routes: Checkout, Order history, Order tracking."""

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.models import CartItem, Order, OrderItem

orders_bp = Blueprint('orders', __name__, url_prefix='/orders')


@orders_bp.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    """Checkout page — review cart and place order."""
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()

    if not cart_items:
        flash('Your cart is empty. Add items before checkout.', 'info')
        return redirect(url_for('menu.browse'))

    total = sum(item.menu_item.price * item.quantity for item in cart_items)

    if request.method == 'POST':
        delivery_address = request.form.get('delivery_address', '').strip()
        phone = request.form.get('phone', '').strip()
        payment_method = request.form.get('payment_method', 'cash')

        if not delivery_address:
            flash('Please enter a delivery address.', 'error')
            return render_template('orders/checkout.html', cart_items=cart_items,
                                   total=total, phone=phone,
                                   delivery_address=delivery_address)
        if not phone:
            flash('Please enter a phone number.', 'error')
            return render_template('orders/checkout.html', cart_items=cart_items,
                                   total=total, phone=phone,
                                   delivery_address=delivery_address)

        # Create order
        order = Order(
            user_id=current_user.id,
            total_amount=total,
            status='pending',
            payment_method=payment_method,
            delivery_address=delivery_address,
            phone=phone
        )
        db.session.add(order)
        db.session.flush()  # Get order.id

        # Create order items
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                item_id=cart_item.item_id,
                quantity=cart_item.quantity,
                price=cart_item.menu_item.price
            )
            db.session.add(order_item)

        # Clear cart
        CartItem.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()

        if payment_method == 'cash':
            order.status = 'confirmed'
            db.session.commit()
            flash('Order placed successfully via Cash on Delivery!', 'success')
            return redirect(url_for('payment.confirmation', order_id=order.id))

        # Redirect to payment (for card)
        return redirect(url_for('payment.pay', order_id=order.id))

    return render_template('orders/checkout.html', cart_items=cart_items,
                           total=total)


@orders_bp.route('/history')
@login_required
def history():
    """Order history page."""
    orders = Order.query.filter_by(user_id=current_user.id)\
        .order_by(Order.created_at.desc()).all()
    return render_template('orders/history.html', orders=orders)


@orders_bp.route('/track/<int:order_id>')
@login_required
def track(order_id):
    """Track a specific order."""
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id and not current_user.is_admin:
        flash('Unauthorized access.', 'error')
        return redirect(url_for('orders.history'))

    return render_template('orders/track.html', order=order)
