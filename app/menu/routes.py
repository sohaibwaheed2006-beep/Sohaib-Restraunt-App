"""Menu routes: Browse items, Search, Item detail."""

from flask import Blueprint, render_template, request
from sqlalchemy import or_
from app.models import Category, MenuItem

menu_bp = Blueprint('menu', __name__, url_prefix='/menu')


@menu_bp.route('/')
def browse():
    """Browse full menu, optionally filtered by category."""
    category_id = request.args.get('category', type=int)
    categories = Category.query.all()

    if category_id:
        items = MenuItem.query.filter_by(category_id=category_id, is_available=True).all()
        active_category = Category.query.get(category_id)
    else:
        items = MenuItem.query.filter_by(is_available=True).all()
        active_category = None

    return render_template('menu/browse.html', items=items,
                           categories=categories, active_category=active_category)


@menu_bp.route('/search')
def search():
    """Search menu items."""
    query = request.args.get('q', '').strip()
    categories = Category.query.all()

    if query:
        search_pattern = f'%{query}%'
        items = MenuItem.query.join(Category).filter(
            MenuItem.is_available == True,  # noqa: E712
            or_(
                MenuItem.name.ilike(search_pattern),
                MenuItem.description.ilike(search_pattern),
                Category.name.ilike(search_pattern)
            )
        ).all()
    else:
        items = []

    return render_template('menu/browse.html', items=items,
                           categories=categories, search_query=query,
                           active_category=None)


@menu_bp.route('/item/<int:item_id>')
def item_detail(item_id):
    """Single item detail page."""
    item = MenuItem.query.get_or_404(item_id)
    related_items = MenuItem.query.filter(
        MenuItem.category_id == item.category_id,
        MenuItem.id != item.id,
        MenuItem.is_available == True  # noqa: E712
    ).limit(4).all()
    return render_template('menu/item_detail.html', item=item,
                           related_items=related_items)
