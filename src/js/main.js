/**
 * 3D Creator - Main Application
 * Modern web application for creating 3D geometry from natural language
 */

class ThreeJSApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.canvas = null;
        this.objects = [];
        this.history = [];
        
        // DOM elements
        this.promptInput = null;
        this.generateButton = null;
        this.historyList = null;
        this.loadingOverlay = null;
        this.emptyState = null;
        
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupScene();
        this.setupEventListeners();
        this.setupHints();
        this.loadHistory();
        
        // Start render loop
        this.render();
        
        // Initial render to ensure canvas is visible
        setTimeout(() => {
            this.renderer.render(this.scene, this.camera);
            console.log('✅ Initial render completed');
        }, 100);
    }

    setupDOM() {
        this.canvas = document.getElementById('3d-canvas');
        this.promptInput = document.getElementById('prompt-input');
        this.generateButton = document.getElementById('generate-button');
        this.historyList = document.getElementById('history-list');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.emptyState = document.getElementById('empty-state');
        this.historyEmpty = document.getElementById('history-empty');
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8fafc);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(8, 6, 8);
        this.camera.lookAt(0, 1, 0); // Look at center point above ground

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(
            this.canvas.parentElement.clientWidth,
            this.canvas.parentElement.clientHeight
        );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controls - Wait for OrbitControls to be available
        this.setupControls();

        // Lighting
        this.setupLighting();

        // Ground plane
        this.createGroundPlane();

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupControls() {
        // Try multiple times to initialize controls
        const initControls = () => {
            if (window.THREE && THREE.OrbitControls) {
                this.controls = new THREE.OrbitControls(this.camera, this.canvas);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.enableZoom = true;
                this.controls.enablePan = true;
                this.controls.target.set(0, 1, 0); // Look at center above ground
                this.controls.update();
                console.log('✅ OrbitControls initialized');
                return true;
            }
            return false;
        };

        // Try immediately
        if (!initControls()) {
            // If not available, try again after a short delay
            setTimeout(() => {
                if (!initControls()) {
                    console.warn('⚠️ OrbitControls not available - using basic camera controls');
                }
            }, 100);
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional light (main)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Hemisphere light for soft ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x98fb98, 0.3);
        this.scene.add(hemisphereLight);
    }

    createGroundPlane() {
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        plane.receiveShadow = true;
        this.scene.add(plane);
    }

    setupEventListeners() {
        // Generate button
        this.generateButton.addEventListener('click', () => {
            this.generateGeometry();
        });

        // Enter key in input
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateGeometry();
            }
        });

        // Camera reset button
        const resetButton = document.getElementById('reset-camera');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetCamera();
            });
        }

        // Fullscreen button
        const fullscreenButton = document.getElementById('fullscreen');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // History toggle
        const historyToggle = document.getElementById('history-toggle');
        if (historyToggle) {
            historyToggle.addEventListener('click', () => {
                this.toggleHistoryPanel();
            });
        }

        // Navbar functionality
        this.setupNavbar();
    }

    setupNavbar() {
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navbarNav = document.querySelector('.navbar-nav');
        
        if (mobileToggle && navbarNav) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navbarNav.classList.toggle('mobile-open');
            });
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.handleNavigation(section, link);
            });
        });
    }

    handleNavigation(section, clickedLink) {
        // Update active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');

        // Close mobile menu if open
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navbarNav = document.querySelector('.navbar-nav');
        if (mobileToggle && navbarNav) {
            mobileToggle.classList.remove('active');
            navbarNav.classList.remove('mobile-open');
        }

        // Handle different sections
        switch (section) {
            case 'home':
                this.showHomeSection();
                break;
            case 'history':
                this.showHistorySection();
                break;
            case 'gallery':
                this.showGallerySection();
                break;
            case 'contact':
                this.showContactSection();
                break;
        }
    }

    showHomeSection() {
        // Show main content, hide others
        document.querySelector('.main-content').style.display = 'flex';
        document.querySelector('.history-panel').style.display = 'flex';
        this.hideModalSections();
        this.showNotification('Welcome to ThreeAI 3D Creator!', 'info');
    }

    showHistorySection() {
        this.hideModalSections();
        const modal = this.createModal('History', this.generateHistoryContent());
        document.body.appendChild(modal);
    }

    showGallerySection() {
        this.hideModalSections();
        const modal = this.createModal('Gallery', this.generateGalleryContent());
        document.body.appendChild(modal);
    }

    showContactSection() {
        this.hideModalSections();
        const modal = this.createModal('Contact Us', this.generateContactContent());
        document.body.appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        return modal;
    }

    generateHistoryContent() {
        if (this.history.length === 0) {
            return `
                <div class="modal-empty">
                    <div class="empty-icon">📜</div>
                    <h3>No Creations Yet</h3>
                    <p>Start creating some 3D scenes to see them here!</p>
                </div>
            `;
        }

        let content = '<div class="history-grid">';
        this.history.forEach((item, index) => {
            content += `
                <div class="history-card" data-prompt="${item.prompt}">
                    <div class="history-card-header">
                        <span class="history-index">#${index + 1}</span>
                        <span class="history-time">${this.formatTime(item.timestamp)}</span>
                    </div>
                    <div class="history-card-content">
                        <p>${item.prompt}</p>
                    </div>
                    <button class="history-recreate" data-prompt="${item.prompt}">
                        🚀 Recreate
                    </button>
                </div>
            `;
        });
        content += '</div>';

        // Add event listeners for recreate buttons
        setTimeout(() => {
            document.querySelectorAll('.history-recreate').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    this.promptInput.value = prompt;
                    this.generateGeometry();
                    // Close modal
                    document.querySelector('.modal-overlay').remove();
                    // Switch to home
                    document.querySelector('[data-section="home"]').click();
                });
            });
        }, 100);

        return content;
    }

    generateGalleryContent() {
        return `
            <div class="gallery-content">
                <div class="gallery-grid">
                    <div class="gallery-item">
                        <div class="gallery-preview">🎲</div>
                        <h4>Basic Shapes</h4>
                        <p>Cubes, spheres, cylinders</p>
                    </div>
                    <div class="gallery-item">
                        <div class="gallery-preview">🏛️</div>
                        <h4>Architecture</h4>
                        <p>Buildings and structures</p>
                    </div>
                    <div class="gallery-item">
                        <div class="gallery-preview">🎨</div>
                        <h4>Abstract Art</h4>
                        <p>Creative compositions</p>
                    </div>
                    <div class="gallery-item">
                        <div class="gallery-preview">🌟</div>
                        <h4>Space Scenes</h4>
                        <p>Cosmic arrangements</p>
                    </div>
                </div>
                <div class="gallery-examples">
                    <h3>Popular Prompts</h3>
                    <div class="prompt-examples">
                        <span class="prompt-tag" data-prompt="golden pyramid on marble platform">Golden Pyramid</span>
                        <span class="prompt-tag" data-prompt="three colorful spheres floating in space">Floating Spheres</span>
                        <span class="prompt-tag" data-prompt="red cube blue cylinder green sphere arrangement">RGB Shapes</span>
                        <span class="prompt-tag" data-prompt="crystal tower with glowing base">Crystal Tower</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateContactContent() {
        return `
            <div class="contact-content">
                <div class="contact-info">
                    <div class="contact-section">
                        <h3>🚀 ThreeAI Team</h3>
                        <p>We're passionate about making 3D creation accessible to everyone through AI and natural language processing.</p>
                    </div>
                    
                    <div class="contact-section">
                        <h4>📧 Get in Touch</h4>
                        <p><strong>Email:</strong> threeaiproject@gmail.com </p>
                        <p><strong>Support:</strong> +91 7013938180</p>
                    </div>
                    
                    <div class="contact-section">
                        <h4>🌐 Follow Us</h4>
                        <div class="social-links">
                            <a href="https://www.github.com/mouli224/" class="social-link">GitHub</a>
                        </div>
                    </div>
                    
                    <div class="contact-section">
                        <h4>💡 Feedback</h4>
                        <p>Have ideas for new features? Found a bug? We'd love to hear from you!</p>
                        <button class="feedback-btn">Send Feedback</button>
                    </div>
                </div>
            </div>
        `;
    }

    hideModalSections() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
    }

    setupHints() {
        const hints = document.querySelectorAll('.hint');
        hints.forEach(hint => {
            hint.addEventListener('click', () => {
                this.promptInput.value = hint.textContent.replace('Try: ', '').replace(/"/g, '');
                this.promptInput.focus();
            });
        });
    }

    async generateGeometry() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            this.showNotification('Please enter a description', 'warning');
            return;
        }

        this.showLoading(true);
        this.generateButton.disabled = true;

        try {
            // Clear existing objects
            this.clearScene();

            // Hide empty state immediately
            this.emptyState.style.display = 'none';

            // Parse prompt and create geometry
            await this.parseAndCreateGeometry(prompt);

            // Add to history
            this.addToHistory(prompt);

            // Force a render update
            this.renderer.render(this.scene, this.camera);

            this.showNotification('Scene created successfully!', 'success');
        } catch (error) {
            console.error('Error generating geometry:', error);
            this.showNotification('Error creating scene. Please try again.', 'error');
            // Show empty state again if there's an error
            this.emptyState.style.display = 'flex';
        } finally {
            this.showLoading(false);
            this.generateButton.disabled = false;
        }
    }

    async parseAndCreateGeometry(prompt) {
        // Simple prompt parsing - in a real app, this would use NLP/AI
        const words = prompt.toLowerCase().split(' ');
        const shapes = this.extractShapes(words);
        const colors = this.extractColors(words);
        const positions = this.extractPositions(words);

        // Create objects with some randomization if not enough specific info
        let objectIndex = 0;
        const spacing = 2;

        for (const shape of shapes) {
            const color = colors[objectIndex] || this.getRandomColor();
            const position = positions[objectIndex] || {
                x: (objectIndex - shapes.length / 2) * spacing,
                y: 1, // Raise objects above ground plane
                z: 0
            };

            await this.createObject(shape, color, position);
            objectIndex++;
        }

        // If no shapes found, create a default scene
        if (shapes.length === 0) {
            await this.createDefaultScene();
        }

        // After creating objects, adjust camera to look at the scene
        this.focusCameraOnScene();

        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    focusCameraOnScene() {
        if (this.objects.length > 0) {
            // Calculate bounding box of all objects
            const box = new THREE.Box3();
            this.objects.forEach(obj => {
                box.expandByObject(obj);
            });

            // Get center of the scene
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Position camera to view all objects
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = this.camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            
            cameraZ *= 2.5; // Add some padding
            
            this.camera.position.set(cameraZ, cameraZ, cameraZ);
            this.camera.lookAt(center);

            if (this.controls) {
                this.controls.target.copy(center);
                this.controls.update();
            }

            // Force render
            this.renderer.render(this.scene, this.camera);
        }
    }

    extractShapes(words) {
        const shapeMap = {
            'cube': 'cube',
            'box': 'cube',
            'sphere': 'sphere',
            'ball': 'sphere',
            'cylinder': 'cylinder',
            'cone': 'cone',
            'pyramid': 'pyramid',
            'torus': 'torus',
            'donut': 'torus',
            'plane': 'plane',
            'circle': 'circle'
        };

        const shapes = [];
        for (const word of words) {
            if (shapeMap[word]) {
                shapes.push(shapeMap[word]);
            }
        }

        return shapes.length > 0 ? shapes : ['cube']; // Default to cube
    }

    extractColors(words) {
        const colorMap = {
            'red': 0xff4444,
            'blue': 0x4444ff,
            'green': 0x44ff44,
            'yellow': 0xffff44,
            'orange': 0xff8844,
            'purple': 0xff44ff,
            'pink': 0xff88ff,
            'white': 0xffffff,
            'black': 0x444444,
            'gray': 0x888888,
            'grey': 0x888888,
            'brown': 0x8b4513,
            'gold': 0xffd700,
            'silver': 0xc0c0c0
        };

        const colors = [];
        for (const word of words) {
            if (colorMap[word] !== undefined) {
                colors.push(colorMap[word]);
            }
        }

        return colors;
    }

    extractPositions(words) {
        // Simple position extraction - could be enhanced
        const positions = [];
        // This would be more sophisticated in a real implementation
        return positions;
    }

    getRandomColor() {
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd, 0x98d8c8];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createObject(shape, color, position) {
        return new Promise((resolve) => {
            let geometry, material, mesh;

            // Create geometry based on shape
            switch (shape) {
                case 'cube':
                    geometry = new THREE.BoxGeometry(1, 1, 1);
                    break;
                case 'sphere':
                    geometry = new THREE.SphereGeometry(0.6, 32, 32);
                    break;
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
                    break;
                case 'cone':
                    geometry = new THREE.ConeGeometry(0.5, 1, 32);
                    break;
                case 'pyramid':
                    geometry = new THREE.ConeGeometry(0.5, 1, 4);
                    break;
                case 'torus':
                    geometry = new THREE.TorusGeometry(0.6, 0.2, 16, 100);
                    break;
                case 'plane':
                    geometry = new THREE.PlaneGeometry(2, 2);
                    break;
                case 'circle':
                    geometry = new THREE.CircleGeometry(0.8, 32);
                    break;
                default:
                    geometry = new THREE.BoxGeometry(1, 1, 1);
            }

            // Create material
            material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 30,
                transparent: true,
                opacity: 0.9
            });

            // Create mesh
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y, position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Add to scene with animation
            mesh.scale.set(0.1, 0.1, 0.1);
            this.scene.add(mesh);
            this.objects.push(mesh);

            // Force immediate render
            this.renderer.render(this.scene, this.camera);

            // Animate scale up
            this.animateScaleUp(mesh, resolve);
        });
    }

    animateScaleUp(object, callback) {
        const startTime = Date.now();
        const duration = 500;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutBounce(progress);

            object.scale.setScalar(0.1 + eased * 0.9);

            // Force render during animation
            this.renderer.render(this.scene, this.camera);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback();
            }
        };

        animate();
    }

    easeOutBounce(t) {
        if (t < (1 / 2.75)) {
            return (7.5625 * t * t);
        } else if (t < (2 / 2.75)) {
            return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
        } else if (t < (2.5 / 2.75)) {
            return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
        } else {
            return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
        }
    }

    createDefaultScene() {
        return new Promise(async (resolve) => {
            const defaultObjects = [
                { shape: 'cube', color: 0xff6b6b, position: { x: -2, y: 1, z: 0 } },
                { shape: 'sphere', color: 0x4ecdc4, position: { x: 0, y: 1, z: 0 } },
                { shape: 'cylinder', color: 0x45b7d1, position: { x: 2, y: 1, z: 0 } }
            ];

            for (const obj of defaultObjects) {
                await this.createObject(obj.shape, obj.color, obj.position);
                await new Promise(r => setTimeout(r, 150)); // Stagger creation
            }

            resolve();
        });
    }

    clearScene() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        this.objects = [];
    }

    addToHistory(prompt) {
        const historyItem = {
            prompt: prompt,
            timestamp: new Date()
        };

        this.history.unshift(historyItem);
        if (this.history.length > 10) {
            this.history.pop();
        }

        this.updateHistoryUI();
        this.saveHistory();
    }

    updateHistoryUI() {
        this.historyList.innerHTML = '';

        if (this.history.length === 0) {
            this.historyEmpty.style.display = 'block';
            return;
        }

        this.historyEmpty.style.display = 'none';

        this.history.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-item-text">${item.prompt}</div>
                <div class="history-item-time">${this.formatTime(item.timestamp)}</div>
            `;

            li.addEventListener('click', () => {
                this.promptInput.value = item.prompt;
                this.generateGeometry();
            });

            this.historyList.appendChild(li);
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    saveHistory() {
        try {
            localStorage.setItem('3d-creator-history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Could not save history to localStorage');
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('3d-creator-history');
            if (saved) {
                this.history = JSON.parse(saved).map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                this.updateHistoryUI();
            }
        } catch (e) {
            console.warn('Could not load history from localStorage');
        }
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // You could implement a toast notification here
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    resetCamera() {
        if (this.controls) {
            // Reset controls to initial position
            this.camera.position.set(8, 6, 8);
            this.controls.target.set(0, 1, 0);
            this.controls.update();
        } else {
            // Fallback if no controls
            this.camera.position.set(8, 6, 8);
            this.camera.lookAt(0, 1, 0);
        }
        
        // Force render
        this.renderer.render(this.scene, this.camera);
    }

    toggleFullscreen() {
        const canvasWrapper = this.canvas.parentElement;
        if (!document.fullscreenElement) {
            canvasWrapper.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    toggleHistoryPanel() {
        const historyPanel = document.querySelector('.history-panel');
        historyPanel.classList.toggle('collapsed');
    }

    onWindowResize() {
        const container = this.canvas.parentElement;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    render() {
        requestAnimationFrame(() => this.render());

        if (this.controls) {
            this.controls.update();
        }

        // Rotate objects slightly for visual appeal
        this.objects.forEach((obj, index) => {
            obj.rotation.y += 0.005 * (index + 1);
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if THREE.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded');
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Inter, sans-serif;">
                <div style="text-align: center; padding: 40px; border: 2px solid #e5e7eb; border-radius: 16px; background: white;">
                    <h2 style="color: #ef4444;">❌ THREE.js Not Loaded</h2>
                    <p style="color: #6b7280;">Please refresh the page and check your internet connection.</p>
                    <button onclick="location.reload()" style="background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px;">
                        🔄 Reload Page
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    console.log('✅ THREE.js loaded successfully, version:', THREE.REVISION);
    
    // Check for OrbitControls
    if (THREE.OrbitControls) {
        console.log('✅ OrbitControls available');
    } else {
        console.warn('⚠️ OrbitControls not found in THREE namespace');
    }
    
    // Wait a bit for all scripts to load, then initialize
    setTimeout(() => {
        new ThreeJSApp();
    }, 50);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeJSApp;
}