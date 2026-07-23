// ==========================================================================
// Sohaib Restaurant - Interactive Procedural 3D Food Food3D Model Renderer
// ==========================================================================

class Food3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Active model: 'burger' or 'pizza'
        this.currentModel = 'burger';
        this.burgerGroup = null;
        this.pizzaGroup = null;
        this.activeGroup = null;

        // Interaction states
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.explosionFactor = 0; // 0 = flat, 1 = fully exploded
        this.targetExplosion = 0;
        
        this.burgerLayers = [];
        this.pizzaLayers = [];

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. Create Scene & Camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 1.2, 10);

        // 2. Create Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // 3. Setup Lights
        this.setupLights();

        // 4. Generate Procedural Models
        this.createBurger();
        this.createPizza();

        // Add both to scene, hide pizza by default
        this.scene.add(this.burgerGroup);
        this.scene.add(this.pizzaGroup);
        this.pizzaGroup.visible = false;
        this.activeGroup = this.burgerGroup;

        // 5. Register Event Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        
        // Listen to scroll to trigger exploded view
        window.addEventListener('scroll', this.onScroll.bind(this));

        // Start Loop
        this.animate();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambientLight);

        // Main warm orange directional light from front-top
        const dirLight1 = new THREE.DirectionalLight(0xffaa77, 1.8);
        dirLight1.position.set(6, 10, 6);
        dirLight1.castShadow = true;
        this.scene.add(dirLight1);

        // Sub light: Cool blue backlight for nice premium depth
        const dirLight2 = new THREE.DirectionalLight(0x77bbff, 1.2);
        dirLight2.position.set(-6, -2, -4);
        this.scene.add(dirLight2);

        // Point light in center to create cheese-melt glow
        const pointLight = new THREE.PointLight(0xffb800, 1.0, 8);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }

    createBurger() {
        this.burgerGroup = new THREE.Group();
        const layers = [];

        // Materials setup
        const bunMaterial = new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.55, metalness: 0.1 });
        const seedMaterial = new THREE.MeshStandardMaterial({ color: 0xfffdd0, roughness: 0.4 });
        const pattyMaterial = new THREE.MeshStandardMaterial({ color: 0x3d1d0c, roughness: 0.85, metalness: 0.05 });
        const cheeseMaterial = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.4, metalness: 0.05 });
        const tomatoMaterial = new THREE.MeshStandardMaterial({ color: 0xd9381e, roughness: 0.35, metalness: 0.1 });
        const lettuceMaterial = new THREE.MeshStandardMaterial({ color: 0x3cb371, roughness: 0.65 });

        // Layer 6: Top Bun (Hemisphere)
        const topBunGroup = new THREE.Group();
        const topBunGeo = new THREE.SphereGeometry(1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const topBunMesh = new THREE.Mesh(topBunGeo, bunMaterial);
        topBunMesh.scale.set(1, 0.75, 1);
        topBunMesh.castShadow = true;
        topBunGroup.add(topBunMesh);

        // Sesame seeds on Top Bun
        for (let i = 0; i < 40; i++) {
            const seedGeo = new THREE.ConeGeometry(0.04, 0.12, 4);
            const seedMesh = new THREE.Mesh(seedGeo, seedMaterial);
            
            // Distribute randomly on hemisphere
            const theta = Math.random() * Math.PI * 0.4;
            const phi = Math.random() * Math.PI * 2;

            seedMesh.position.x = 1.78 * Math.sin(theta) * Math.cos(phi);
            seedMesh.position.z = 1.78 * Math.sin(theta) * Math.sin(phi);
            seedMesh.position.y = 1.78 * Math.cos(theta) * 0.75;
            
            seedMesh.rotation.x = theta * Math.cos(phi);
            seedMesh.rotation.z = -theta * Math.sin(phi);
            seedMesh.rotation.y = phi;
            topBunGroup.add(seedMesh);
        }
        layers.push({ obj: topBunGroup, targetY: 1.15, explodedY: 3.0 });

        // Layer 5: Tomato Slices (Two discs side by side)
        const tomatoGroup = new THREE.Group();
        for (let i = -1; i <= 1; i += 2) {
            const tomatoGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.15, 24);
            const tomatoMesh = new THREE.Mesh(tomatoGeo, tomatoMaterial);
            tomatoMesh.position.x = i * 0.7;
            tomatoMesh.rotation.x = Math.PI / 2 + (Math.random() * 0.1 - 0.05);
            tomatoMesh.rotation.y = Math.random() * 0.1;
            tomatoGroup.add(tomatoMesh);
        }
        layers.push({ obj: tomatoGroup, targetY: 0.75, explodedY: 1.8 });

        // Layer 4: Cheese Slice (Thin rotated square draped)
        const cheeseGeo = new THREE.BoxGeometry(3.2, 0.06, 3.2);
        const cheeseMesh = new THREE.Mesh(cheeseGeo, cheeseMaterial);
        cheeseMesh.rotation.y = Math.PI / 4;
        cheeseMesh.rotation.x = 0.05; // Slightly melted drape
        layers.push({ obj: cheeseMesh, targetY: 0.45, explodedY: 0.9 });

        // Layer 3: Meat Patty (Thick cylinder)
        const pattyGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.55, 32);
        // Add random bumps to patty surface
        const pos = pattyGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            if (Math.abs(pos.getY(i)) > 0.2) {
                // displace top/bottom
                pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.04);
            }
        }
        pattyGeo.computeVertexNormals();
        const pattyMesh = new THREE.Mesh(pattyGeo, pattyMaterial);
        pattyMesh.castShadow = true;
        layers.push({ obj: pattyMesh, targetY: 0.0, explodedY: 0.0 });

        // Layer 2: Lettuce Leaf (Thin disc with wavy edges)
        const lettuceGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.08, 64);
        const lPos = lettuceGeo.attributes.position;
        for (let i = 0; i < lPos.count; i++) {
            const lx = lPos.getX(i);
            const lz = lPos.getZ(i);
            const angle = Math.atan2(lz, lx);
            // add sine wave displacements to Y
            const wave = Math.sin(angle * 12) * 0.18;
            lPos.setY(i, lPos.getY(i) + wave);
        }
        lettuceGeo.computeVertexNormals();
        const lettuceMesh = new THREE.Mesh(lettuceGeo, lettuceMaterial);
        layers.push({ obj: lettuceMesh, targetY: -0.4, explodedY: -0.9 });

        // Layer 1: Bottom Bun (Flat cylinder)
        const botBunGeo = new THREE.CylinderGeometry(1.75, 1.65, 0.45, 32);
        const botBunMesh = new THREE.Mesh(botBunGeo, bunMaterial);
        botBunMesh.castShadow = true;
        layers.push({ obj: botBunMesh, targetY: -0.85, explodedY: -1.8 });

        // Add layers to the main group
        layers.forEach(layer => {
            layer.obj.position.y = layer.targetY;
            this.burgerGroup.add(layer.obj);
        });

        this.burgerLayers = layers;
        
        // Initial setup for the entire group
        this.burgerGroup.position.set(0, 0, 0);
        this.burgerGroup.rotation.x = 0.25; // Default tilt
    }

    createPizza() {
        this.pizzaGroup = new THREE.Group();
        const layers = [];

        // Materials setup
        const crustMaterial = new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.6, metalness: 0.05 });
        const cheeseMaterial = new THREE.MeshStandardMaterial({ color: 0xffc107, roughness: 0.45, metalness: 0.02 });
        const pepperoniMaterial = new THREE.MeshStandardMaterial({ color: 0xb22222, roughness: 0.4, metalness: 0.05 });
        const oliveMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
        const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6 });

        // Layer 1: Pizza Crust & Base
        const crustGeo = new THREE.TorusGeometry(2.1, 0.22, 16, 64);
        const crustMesh = new THREE.Mesh(crustGeo, crustMaterial);
        crustMesh.rotation.x = Math.PI / 2;
        crustMesh.castShadow = true;
        
        const baseGeo = new THREE.CylinderGeometry(2.05, 2.05, 0.12, 48);
        const baseMesh = new THREE.Mesh(baseGeo, crustMaterial);
        baseMesh.position.y = -0.06;
        
        const baseGroup = new THREE.Group();
        baseGroup.add(crustMesh);
        baseGroup.add(baseMesh);
        layers.push({ obj: baseGroup, targetY: -0.2, explodedY: -1.2 });

        // Layer 2: Melted Cheese (Thin circular disc)
        const cheeseGeo = new THREE.CylinderGeometry(1.95, 1.95, 0.08, 48);
        const cheeseMesh = new THREE.Mesh(cheeseGeo, cheeseMaterial);
        layers.push({ obj: cheeseMesh, targetY: 0.02, explodedY: -0.3 });

        // Layer 3: Pepperoni Slices
        const pepperoniGroup = new THREE.Group();
        const pPositions = [
            { x: 0.9, z: 0.9 },
            { x: -0.9, z: 0.9 },
            { x: 0.9, z: -0.9 },
            { x: -0.9, z: -0.9 },
            { x: 1.2, z: 0 },
            { x: -1.2, z: 0 },
            { x: 0, z: 1.2 },
            { x: 0, z: -1.2 },
            { x: 0, z: 0 }
        ];

        pPositions.forEach(pos => {
            const pepGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 16);
            const pepMesh = new THREE.Mesh(pepGeo, pepperoniMaterial);
            pepMesh.position.set(pos.x, 0.02, pos.z);
            pepMesh.rotation.y = Math.random() * Math.PI;
            pepMesh.rotation.z = (Math.random() - 0.5) * 0.05; // slightly uneven
            pepperoniGroup.add(pepMesh);
        });
        layers.push({ obj: pepperoniGroup, targetY: 0.08, explodedY: 0.5 });

        // Layer 4: Olives and Green Leaves
        const toppingsGroup = new THREE.Group();
        
        // Olives (Black Toruses)
        for (let i = 0; i < 15; i++) {
            const oliveGeo = new THREE.TorusGeometry(0.08, 0.04, 8, 16);
            const oliveMesh = new THREE.Mesh(oliveGeo, oliveMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.5 + 0.2;
            oliveMesh.position.set(radius * Math.cos(angle), 0.02, radius * Math.sin(angle));
            oliveMesh.rotation.x = Math.PI / 2;
            oliveMesh.rotation.y = Math.random() * Math.PI;
            toppingsGroup.add(oliveMesh);
        }

        // Green Basil Leaves (Thin scaling green boxes)
        for (let i = 0; i < 8; i++) {
            const leafGeo = new THREE.BoxGeometry(0.18, 0.02, 0.28);
            const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.4 + 0.3;
            leafMesh.position.set(radius * Math.cos(angle), 0.03, radius * Math.sin(angle));
            leafMesh.rotation.y = Math.random() * Math.PI;
            leafMesh.rotation.z = (Math.random() - 0.5) * 0.2;
            toppingsGroup.add(leafMesh);
        }
        layers.push({ obj: toppingsGroup, targetY: 0.12, explodedY: 1.4 });

        // Add layers to pizza
        layers.forEach(layer => {
            layer.obj.position.y = layer.targetY;
            this.pizzaGroup.add(layer.obj);
        });

        this.pizzaLayers = layers;
        
        this.pizzaGroup.position.set(0, 0, 0);
        this.pizzaGroup.rotation.x = 0.5; // Tilted towards the camera more
    }

    onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        // Standardize mouse coordinates between -1 and 1
        this.targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Trigger exploded view slightly on mouse hover!
        this.targetExplosion = 0.35;
    }

    onMouseLeave() {
        this.targetMouse.x = 0;
        this.targetMouse.y = 0;
        this.targetExplosion = window.scrollY > 150 ? 1 : 0;
    }

    onScroll() {
        // Explode the model as the user scrolls down!
        const scrollPercent = Math.min(window.scrollY / 400, 1.0);
        this.targetExplosion = Math.max(scrollPercent, this.targetMouse.x !== 0 || this.targetMouse.y !== 0 ? 0.35 : 0);
    }

    onWindowResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setModel(modelName) {
        if (modelName === this.currentModel) return;
        
        this.currentModel = modelName;
        const toHide = modelName === 'burger' ? this.pizzaGroup : this.burgerGroup;
        const toShow = modelName === 'burger' ? this.burgerGroup : this.pizzaGroup;

        // Smooth GSAP fade out / in transition
        gsap.to(toHide.scale, {
            x: 0, y: 0, z: 0, duration: 0.4, onComplete: () => {
                toHide.visible = false;
                toShow.visible = true;
                toShow.scale.set(0, 0, 0);
                this.activeGroup = toShow;
                
                gsap.to(toShow.scale, {
                    x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.5)'
                });
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // 1. Lerp mouse movement for buttery smooth parallax
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

        // Apply mouse tilt to the whole active group
        if (this.activeGroup) {
            const baseRotX = this.currentModel === 'burger' ? 0.25 : 0.65;
            this.activeGroup.rotation.x = baseRotX - this.mouse.y * 0.5;
            this.activeGroup.rotation.y += 0.006; // Continuous auto rotation
            this.activeGroup.rotation.y = (this.activeGroup.rotation.y % (Math.PI * 2)) + (this.mouse.x * 0.02);
        }

        // 2. Lerp explosion factor
        this.explosionFactor += (this.targetExplosion - this.explosionFactor) * 0.1;

        // 3. Update Y positions of layers based on explosion factor
        const activeLayers = this.currentModel === 'burger' ? this.burgerLayers : this.pizzaLayers;
        activeLayers.forEach(layer => {
            layer.obj.position.y = layer.targetY + (layer.explodedY - layer.targetY) * this.explosionFactor;
            
            // Add subtle spin in opposite directions to outer layers in exploded state
            if (this.explosionFactor > 0.01) {
                const layerIndex = activeLayers.indexOf(layer);
                const dir = layerIndex % 2 === 0 ? 1 : -1;
                layer.obj.rotation.y = dir * this.explosionFactor * 0.4;
            } else {
                layer.obj.rotation.y = 0;
            }
        });

        // 4. Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Global initialization helper — handles the case where DOMContentLoaded
// has already fired by the time this late-loaded script is parsed.
(function initFood3D() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.food3D = new Food3D('hero-3d-container');
        });
    } else {
        // DOM already ready
        window.food3D = new Food3D('hero-3d-container');
    }
})();
