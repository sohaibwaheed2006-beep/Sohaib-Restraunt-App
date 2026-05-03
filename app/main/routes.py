"""Main routes: Home, About, Contact."""

from flask import Blueprint, render_template
from app.models import Category, MenuItem

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def home():
    """Landing / home page."""
    categories = Category.query.all()
    popular_items = MenuItem.query.filter_by(is_available=True).limit(8).all()
    return render_template('main/home.html', categories=categories,
                           popular_items=popular_items)


@main_bp.route('/about')
def about():
    """About us page."""
    return render_template('main/about.html')
