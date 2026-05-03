document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // User dropdown toggle
    const userBtn = document.getElementById('nav-user-btn');
    const userDropdown = document.getElementById('nav-dropdown');

    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Add to cart AJAX
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const url = form.getAttribute('action');
            const formData = new FormData(form);
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const cartBadge = document.getElementById('cart-badge');
                    if (cartBadge) {
                        cartBadge.textContent = data.cart_count;
                        
                        // Simple animation
                        cartBadge.style.transform = 'scale(1.5)';
                        setTimeout(() => {
                            cartBadge.style.transform = 'scale(1)';
                        }, 200);
                    }
                    
                    // Create beautiful toast notification
                    let flashContainer = document.querySelector('.flash-container');
                    if (!flashContainer) {
                        flashContainer = document.createElement('div');
                        flashContainer.className = 'flash-container';
                        document.body.appendChild(flashContainer);
                    }
                    const flashMessage = document.createElement('div');
                    flashMessage.className = 'flash-message flash-success';
                    flashMessage.innerHTML = `
                        <span style="display: flex; align-items: center; gap: 15px;">${data.message || 'Added to cart!'}</span>
                        <button class="flash-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                    `;
                    flashContainer.appendChild(flashMessage);
                    
                    // Auto remove after 5 seconds
                    setTimeout(() => {
                        if (document.body.contains(flashMessage)) {
                            flashMessage.remove();
                        }
                    }, 5000);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                // Fallback to regular submission if AJAX fails
                form.submit();
            }
        });
    });
});
