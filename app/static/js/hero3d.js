/**
 * hero3d.js  —  Animated exploded burger & pizza (CSS + GSAP)
 * Inspired by the Figma "Animated Burger Landing" design
 */

/* ─────────────────────────────────────────────
   BURGER LAYERS CONFIG
   Each layer: { label, cal, color, height, emoji }
   Listed top → bottom (as they appear in an assembled burger)
───────────────────────────────────────────── */
const BURGER_LAYERS = [
    { label: 'Bun',      cal: '130 cal', color: '#D4843B', emoji: '🍞', h: 52, rx: 50 },
    { label: 'Tomatoes', cal: '25 cal',  color: '#E8331A', emoji: '🍅', h: 18, rx: 50 },
    { label: 'Onions',   cal: '20 cal',  color: '#9B3FAF', emoji: '🧅', h: 18, rx: 50 },
    { label: 'Bacon',    cal: '65 cal',  color: '#7B2020', emoji: '🥓', h: 14, rx: 4  },
    { label: 'Cheese',   cal: '112 cal', color: '#F5C842', emoji: '🧀', h: 14, rx: 6  },
    { label: 'Meat',     cal: '235 cal', color: '#5C2A0E', emoji: '🥩', h: 28, rx: 50 },
    { label: 'Salad',    cal: '10 cal',  color: '#3CB371', emoji: '🥬', h: 20, rx: 50 },
    { label: 'Bun',      cal: '130 cal', color: '#D4843B', emoji: '🍞', h: 40, rx: 50 },
];

/* ─────────────────────────────────────────────
   PIZZA LAYERS CONFIG
───────────────────────────────────────────── */
const PIZZA_LAYERS = [
    { label: 'Pepperoni', cal: '130 cal', color: '#C0392B', emoji: '🫓', h: 20, rx: 50 },
    { label: 'Basil',     cal: '5 cal',   color: '#27AE60', emoji: '🌿', h: 14, rx: 50 },
    { label: 'Mozzarella',cal: '85 cal',  color: '#FFF3CD', emoji: '🧀', h: 22, rx: 50 },
    { label: 'Sauce',     cal: '40 cal',  color: '#E74C3C', emoji: '🍅', h: 16, rx: 50 },
    { label: 'Dough',     cal: '200 cal', color: '#D4A029', emoji: '🫓', h: 36, rx: 50 },
];

/* ─────────────────────────────────────────────
   FOOD3D CLASS
───────────────────────────────────────────── */
class Food3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.currentModel = 'burger';
        this.exploded = false;
        this._build();
        this._startIdleAnimation();
        this._setupScrollExplode();
    }

    _build() {
        this.container.innerHTML = '';
        this.container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
        `;

        this._buildBurger();
        this._buildPizza();

        // Show burger by default
        this.burgerEl.style.display = 'flex';
        this.pizzaEl.style.display = 'none';
    }

    /* ── BURGER ── */
    _buildBurger() {
        this.burgerEl = this._buildExplodedStack('burger', BURGER_LAYERS, '/static/images/hero_burger.png');
        this.container.appendChild(this.burgerEl);
    }

    /* ── PIZZA ── */
    _buildPizza() {
        this.pizzaEl = this._buildExplodedStack('pizza', PIZZA_LAYERS, '/static/images/hero_pizza.png');
        this.container.appendChild(this.pizzaEl);
    }

    /* ── SHARED EXPLODED STACK BUILDER ── */
    _buildExplodedStack(type, layers, heroImg) {
        const wrap = document.createElement('div');
        wrap.className = `exploded-${type}`;
        wrap.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            gap: 0;
            width: 340px;
        `;

        // ── Hero assembled image (shown when collapsed) ──
        const heroImgEl = document.createElement('img');
        heroImgEl.src = heroImg;
        heroImgEl.alt = type;
        heroImgEl.className = `hero-food-img hero-food-img-${type}`;
        heroImgEl.style.cssText = `
            width: ${type === 'pizza' ? '310px' : '290px'};
            height: ${type === 'pizza' ? '310px' : '270px'};
            object-fit: contain;
            filter: drop-shadow(0 24px 48px rgba(255,107,53,0.25)) drop-shadow(0 8px 16px rgba(0,0,0,0.7));
            mix-blend-mode: screen;
            transition: opacity 0.5s ease, transform 0.5s ease;
            position: absolute;
            z-index: 10;
            background: transparent;
        `;
        wrap.appendChild(heroImgEl);

        // ── Exploded layers container ──
        const stackEl = document.createElement('div');
        stackEl.className = `layer-stack layer-stack-${type}`;
        stackEl.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.5s ease, transform 0.5s ease;
            position: relative;
            padding: 10px 0;
        `;

        layers.forEach((layer, i) => {
            const isLeft = i % 2 === 0;
            const layerRow = document.createElement('div');
            layerRow.style.cssText = `
                display: flex;
                align-items: center;
                width: 100%;
                justify-content: center;
                position: relative;
                margin: 3px 0;
            `;

            // ── Left label ──
            const leftLabel = document.createElement('div');
            leftLabel.className = 'layer-label layer-label-left';
            leftLabel.style.cssText = `
                position: absolute;
                left: 0;
                display: flex;
                align-items: center;
                gap: 6px;
                opacity: 0;
                transform: translateX(-10px);
                transition: all 0.4s ease ${i * 0.05}s;
                white-space: nowrap;
            `;

            // ── Right label ──
            const rightLabel = document.createElement('div');
            rightLabel.className = 'layer-label layer-label-right';
            rightLabel.style.cssText = `
                position: absolute;
                right: 0;
                display: flex;
                align-items: center;
                gap: 6px;
                opacity: 0;
                transform: translateX(10px);
                transition: all 0.4s ease ${i * 0.05}s;
                white-space: nowrap;
            `;

            if (isLeft) {
                leftLabel.innerHTML = `
                    <span style="font-family: Outfit,sans-serif; font-size: 11px; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.05em;">${layer.label}</span>
                    <span style="font-size: 9px; color: rgba(255,255,255,0.5); font-family: Inter,sans-serif;">${layer.cal}</span>
                `;
                leftLabel.innerHTML += `<div style="width: 24px; height: 1px; background: rgba(255,255,255,0.3); flex-shrink:0;"></div>`;
            } else {
                rightLabel.innerHTML = `
                    <div style="width: 24px; height: 1px; background: rgba(255,255,255,0.3); flex-shrink:0;"></div>
                    <span style="font-family: Outfit,sans-serif; font-size: 11px; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.05em;">${layer.label}</span>
                    <span style="font-size: 9px; color: rgba(255,255,255,0.5); font-family: Inter,sans-serif;">${layer.cal}</span>
                `;
            }

            // ── The layer disc ──
            const disc = document.createElement('div');
            disc.className = `food-layer food-layer-${i}`;
            const discWidth = type === 'pizza' ? 220 : (i === 0 || i === layers.length - 1 ? 200 : 180 - i * 2);
            disc.style.cssText = `
                width: ${discWidth}px;
                height: ${layer.h}px;
                background: ${this._layerGradient(layer.color, type, i, layers.length)};
                border-radius: ${layer.rx}px ${layer.rx}px ${Math.round(layer.rx * 0.4)}px ${Math.round(layer.rx * 0.4)}px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${Math.round(layer.h * 0.55)}px;
                position: relative;
                z-index: ${10 - i};
                transition: transform 0.15s ease;
                cursor: default;
                flex-shrink: 0;
            `;
            disc.title = `${layer.label} – ${layer.cal}`;

            // Texture detail lines inside disc
            const texture = document.createElement('div');
            texture.style.cssText = `
                position: absolute; inset: 0;
                border-radius: inherit;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 6px,
                    rgba(255,255,255,0.03) 6px,
                    rgba(255,255,255,0.03) 12px
                );
                pointer-events: none;
            `;
            disc.appendChild(texture);

            // Hover tilt
            disc.addEventListener('mouseenter', () => {
                disc.style.transform = 'scaleX(1.04) translateY(-2px)';
                disc.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2), 0 0 0 2px ${layer.color}55`;
            });
            disc.addEventListener('mouseleave', () => {
                disc.style.transform = '';
                disc.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15)';
            });

            layerRow.appendChild(leftLabel);
            layerRow.appendChild(disc);
            layerRow.appendChild(rightLabel);
            stackEl.appendChild(layerRow);
        });

        wrap.appendChild(stackEl);
        wrap._heroImg = heroImgEl;
        wrap._stack = stackEl;
        return wrap;
    }

    _layerGradient(base, type, i, total) {
        const isTopBun = (type === 'burger' && i === 0);
        const isBottomBun = (type === 'burger' && i === total - 1);
        if (isTopBun) {
            return `radial-gradient(ellipse at 40% 30%, #F5C06B, ${base} 60%, #8B5E2B)`;
        }
        if (isBottomBun) {
            return `linear-gradient(180deg, ${base} 0%, #9B6B25 100%)`;
        }
        return `linear-gradient(160deg, ${this._lighten(base, 30)} 0%, ${base} 50%, ${this._darken(base, 20)} 100%)`;
    }

    _lighten(hex, pct) {
        return hex; // simplified — colors already chosen
    }
    _darken(hex, pct) {
        return hex;
    }

    /* ── IDLE FLOAT ANIMATION ── */
    _startIdleAnimation() {
        const active = () => this.currentModel === 'burger' ? this.burgerEl : this.pizzaEl;
        const floatEl = () => active()._heroImg;

        const tick = (t) => {
            const el = floatEl();
            if (el && !this.exploded) {
                el.style.transform = `translateY(${Math.sin(t * 0.002) * 10}px) rotate(${Math.sin(t * 0.001) * 1.5}deg)`;
            }
            this._rafId = requestAnimationFrame(tick);
        };
        this._rafId = requestAnimationFrame(tick);
    }

    /* ── SCROLL-TRIGGERED EXPLODE ── */
    _setupScrollExplode() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: '#hero-3d-container',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                if (self.progress > 0.15 && !this.exploded) {
                    this._explode();
                } else if (self.progress <= 0.15 && this.exploded) {
                    this._collapse();
                }
            }
        });
    }

    _explode() {
        this.exploded = true;
        const active = this.currentModel === 'burger' ? this.burgerEl : this.pizzaEl;
        active._heroImg.style.opacity = '0';
        active._heroImg.style.transform = 'scale(0.7)';
        active._stack.style.opacity = '1';
        active._stack.style.transform = 'scale(1)';

        // Animate labels in
        active._stack.querySelectorAll('.layer-label').forEach(l => {
            l.style.opacity = '1';
            l.style.transform = 'translateX(0)';
        });

        // Animate layers apart with GSAP stagger
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(active._stack.querySelectorAll('.food-layer'), 
                { y: 0 },
                { y: (i) => (i - BURGER_LAYERS.length / 2) * 6, stagger: 0.04, duration: 0.5, ease: 'back.out(1.5)' }
            );
        }
    }

    _collapse() {
        this.exploded = false;
        const active = this.currentModel === 'burger' ? this.burgerEl : this.pizzaEl;
        active._heroImg.style.opacity = '1';
        active._heroImg.style.transform = '';
        active._stack.style.opacity = '0';
        active._stack.style.transform = 'scale(0.8)';

        active._stack.querySelectorAll('.layer-label').forEach(l => {
            l.style.opacity = '0';
        });
    }

    /* ── PUBLIC API: switch model ── */
    setModel(name) {
        if (name === this.currentModel) return;
        this.exploded = false;

        const current = this.currentModel === 'burger' ? this.burgerEl : this.pizzaEl;
        const next = name === 'burger' ? this.burgerEl : this.pizzaEl;

        // GSAP crossfade
        if (typeof gsap !== 'undefined') {
            gsap.to(current, { opacity: 0, x: -30, duration: 0.3, ease: 'power2.in', onComplete: () => {
                current.style.display = 'none';
                current.style.opacity = '';
                current.style.transform = '';
                next.style.display = 'flex';
                next.style.opacity = '0';
                next._stack.style.opacity = '0';
                next._heroImg.style.opacity = '1';
                gsap.to(next, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
            }});
        } else {
            current.style.display = 'none';
            next.style.display = 'flex';
        }

        this.currentModel = name;
    }

    destroy() {
        if (this._rafId) cancelAnimationFrame(this._rafId);
    }
}

/* ── INIT ── */
(function initFood3D() {
    const init = () => { window.food3D = new Food3D('hero-3d-container'); };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
