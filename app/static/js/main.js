// ==========================================================================
// Sohaib Restaurant - Global Frontend Logic & GSAP Motion Controller
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle hamburger icon animation
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.className = 'bi bi-x-lg';
                } else {
                    icon.className = 'bi bi-list';
                }
            }
        });
    }

    // 2. User Dropdown Toggle
    const userBtn = document.getElementById('nav-user-btn');
    const userDropdown = document.getElementById('nav-dropdown');

    if (userBtn && userDropdown) {
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

    // 3. GSAP Animations & Motion Graphics
    if (typeof gsap !== 'undefined') {
        // Register ScrollTrigger plugin
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Hero Entrance Section
        gsap.from('.hero-badge', { opacity: 0, y: 30, duration: 0.8, ease: 'power4.out', delay: 0.1 });
        gsap.from('.hero-title-word', { opacity: 0, y: 60, rotateX: -45, stagger: 0.08, duration: 1.0, ease: 'back.out(1.3)', delay: 0.2 });
        gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.6 });
        gsap.from('.hero-cta-btn', { opacity: 0, scale: 0.8, stagger: 0.12, duration: 0.8, ease: 'back.out(1.5)', delay: 0.8 });

        // Category Cards entrance (Staggered Fade-in)
        if (document.querySelector('.category-grid')) {
            gsap.from('.category-card', {
                scrollTrigger: {
                    trigger: '.category-grid',
                    start: 'top 85%',
                },
                opacity: 0,
                y: 40,
                stagger: 0.08,
                duration: 0.8,
                ease: 'power3.out'
            });
        }

        // Deal Cards entrance (Staggered scale up)
        if (document.querySelector('.deal-grid')) {
            gsap.from('.deal-card', {
                scrollTrigger: {
                    trigger: '.deal-grid',
                    start: 'top 85%',
                },
                opacity: 0,
                scale: 0.9,
                stagger: 0.1,
                duration: 0.8,
                ease: 'back.out(1.2)'
            });
        }

        // Menu Cards Grid entrance
        if (document.querySelector('.menu-item-grid')) {
            gsap.from('.menu-item-card', {
                scrollTrigger: {
                    trigger: '.menu-item-grid',
                    start: 'top 85%',
                },
                opacity: 0,
                y: 50,
                stagger: 0.08,
                duration: 0.8,
                ease: 'power3.out'
            });
        }
    }

    // 4. Interactive 3D Card Tilt Effect
    const cardElements = document.querySelectorAll('.card, .category-card');
    cardElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            // Tilt range values (adjust denominator to control intensity)
            const angleX = (yc - y) / 8;
            const angleY = (x - xc) / 8;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // 5. Add to Cart AJAX Operations
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const url = form.getAttribute('action');
            const formData = new FormData(form);
            
            // Add visual click animation feedback on the button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    submitBtn.style.transform = '';
                }, 100);
            }
            
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
                        
                        // Pulse animation on cart badge
                        cartBadge.style.transform = 'scale(1.6)';
                        cartBadge.style.boxShadow = '0 0 25px rgba(255, 107, 53, 0.85)';
                        setTimeout(() => {
                            cartBadge.style.transform = 'scale(1)';
                            cartBadge.style.boxShadow = '';
                        }, 300);
                    }
                    
                    // Create beautiful toast notification
                    let flashContainer = document.querySelector('.flash-container');
                    if (!flashContainer) {
                        flashContainer = document.createElement('div');
                        flashContainer.className = 'flash-container fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-6 md:px-0';
                        document.body.appendChild(flashContainer);
                    }
                    const flashMessage = document.createElement('div');
                    flashMessage.className = 'flash-message bg-brand-charcoal/95 border border-white/10 text-white rounded-2xl p-4 shadow-glass backdrop-blur-md flex items-start gap-3 justify-between animate-[slideIn_0.3s_ease-out_forwards]';
                    flashMessage.innerHTML = `
                        <div class="flex items-center gap-3">
                            <i class="bi bi-check-circle-fill text-emerald-500 text-lg"></i>
                            <span class="text-sm font-medium leading-relaxed">${data.message || 'Item added successfully!'}</span>
                        </div>
                        <button class="text-neutral-400 hover:text-white transition-all focus:outline-none" onclick="this.parentElement.remove()"><i class="bi bi-x-lg text-xs"></i></button>
                    `;
                    flashContainer.appendChild(flashMessage);
                    
                    // Auto-remove notification toast after 4 seconds
                    setTimeout(() => {
                        if (document.body.contains(flashMessage)) {
                            flashMessage.remove();
                        }
                    }, 4000);
                }
            } catch (error) {
                console.error('AJAX add-to-cart error:', error);
                // Fallback to regular submission if fetch fails
                form.submit();
            }
        });
    });
});
