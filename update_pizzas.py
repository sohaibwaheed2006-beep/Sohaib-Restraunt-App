from app import create_app, db
from app.models import MenuItem

app = create_app()

with app.app_context():
    # Category 3 is Pizza based on setup.sql
    items = MenuItem.query.filter(MenuItem.category_id == 3).all()
    updated = 0
    for item in items:
        if not item.name.lower().endswith('pizza'):
            print(f"Updating: {item.name} -> {item.name} Pizza")
            item.name = item.name + ' Pizza'
            updated += 1
    
    db.session.commit()
    print(f"Updated {updated} pizza names successfully!")
