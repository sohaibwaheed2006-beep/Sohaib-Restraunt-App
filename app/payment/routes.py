"""Payment routes: Process payment, confirmation."""

import uuid
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.models import Order, Payment

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')


@payment_bp.route('/pay/<int:order_id>', methods=['GET', 'POST'])
@login_required
def pay(order_id):
    """Payment page for an order."""
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id:
        flash('Unauthorized access.', 'error')
        return redirect(url_for('orders.history'))

    if order.payment:
        flash('This order has already been paid.', 'info')
        return redirect(url_for('orders.track', order_id=order.id))

    if request.method == 'POST':
        method = order.payment_method or 'cash'

        # Simulate payment processing
        transaction_id = str(uuid.uuid4())[:12].upper()

        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            method=method,
            status='completed',
            transaction_id=transaction_id
        )
        db.session.add(payment)

        # Update order status
        order.status = 'confirmed'
        db.session.commit()

        flash('Payment successful! Your order has been confirmed.', 'success')
        return redirect(url_for('payment.confirmation', order_id=order.id))

    return render_template('payment/pay.html', order=order)


@payment_bp.route('/confirmation/<int:order_id>')
@login_required
def confirmation(order_id):
    """Order confirmation after payment."""
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id:
        flash('Unauthorized access.', 'error')
        return redirect(url_for('orders.history'))

    return render_template('payment/confirmation.html', order=order)
