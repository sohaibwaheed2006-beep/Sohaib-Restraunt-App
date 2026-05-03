import os
import glob

replacements = {
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css': 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
    'fas fa-fire': 'bi bi-fire',
    'fas fa-search': 'bi bi-search',
    'fas fa-home': 'bi bi-house-fill',
    'fas fa-utensils': 'bi bi-basket2-fill',
    'fas fa-shopping-cart': 'bi bi-cart-fill',
    'fas fa-receipt': 'bi bi-receipt',
    'fas fa-shield-halved': 'bi bi-shield-lock-fill',
    'fas fa-user-circle': 'bi bi-person-circle',
    'fas fa-chevron-down': 'bi bi-chevron-down',
    'fas fa-user': 'bi bi-person-fill',
    'fas fa-box': 'bi bi-box-seam',
    'fas fa-sign-out-alt': 'bi bi-box-arrow-right',
    'fas fa-sign-in-alt': 'bi bi-box-arrow-in-right',
    'fas fa-user-plus': 'bi bi-person-plus-fill',
    'fas fa-bars': 'bi bi-list',
    'fas fa-times': 'bi bi-x-lg',
    'fab fa-facebook-f': 'bi bi-facebook',
    'fab fa-instagram': 'bi bi-instagram',
    'fab fa-twitter': 'bi bi-twitter-x',
    'fas fa-map-marker-alt': 'bi bi-geo-alt-fill',
    'fas fa-phone': 'bi bi-telephone-fill',
    'fas fa-envelope': 'bi bi-envelope-fill',
    'fas fa-list-alt': 'bi bi-list-ul',
    'fas fa-fire-flame-curved': 'bi bi-fire',
    'fas fa-cart-plus': 'bi bi-cart-plus-fill',
    'fas fa-trash': 'bi bi-trash-fill',
    'fas fa-edit': 'bi bi-pencil-fill',
    'fas fa-plus': 'bi bi-plus-lg',
    'fas fa-check': 'bi bi-check-lg',
    'fas fa-arrow-left': 'bi bi-arrow-left',
    'fas fa-box-open': 'bi bi-box2'
}

for filepath in glob.glob('app/templates/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Icons replaced successfully!")
