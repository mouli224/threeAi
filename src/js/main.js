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
        
        // AI Integration
        this.aiGenerator = null;
        this.aiEnabled = false;
        
        // Authentication & Usage
        this.authManager = null;
        this.usageManager = null;
        this.currentUser = null;
        
        // DOM elements
        this.promptInput = null;
        this.generateButton = null;
        this.historyList = null;
        this.loadingOverlay = null;
        this.emptyState = null;
        this.hfToggle = null;
        this.authButtons = null;
        this.userProfile = null;
        this.usageStats = null;
        
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupScene();
        this.setupEventListeners();
        this.setupHints();
        this.loadHistory();
        
        // Initialize AI Generator first
        this.initAI();
        
        // Initialize authentication system after AI
        this.initializeAuth();
        
        // Start render loop
        this.render();
        
        // Initial render to ensure canvas is visible
        setTimeout(() => {
            this.renderer.render(this.scene, this.camera);
            console.log('✅ Initial render completed');
        }, 100);
    }

    initAI() {
        // Check if AI integration is available
        if (typeof AIModelGenerator !== 'undefined') {
            this.aiGenerator = new AIModelGenerator();
            this.aiEnabled = true;
            console.log('✅ AI Model Generator initialized');
            
            // Add AI toggle to UI
            this.addAIToggle();
            
            // Show Hugging Face status
            this.showAIStatus();
        } else {
            console.log('ℹ️ AI Model Generator not available - using procedural generation only');
        }
    }

    initializeAuth() {
        console.log('🔍 Starting initializeAuth...');
        console.log('🔍 SupabaseAuth available:', typeof SupabaseAuth !== 'undefined');
        
        // Initialize token manager first
        if (typeof hfTokenManager !== 'undefined') {
            hfTokenManager.updateTokenStatus();
            console.log('✅ HF Token Manager initialized');
        }
        
        // Initialize Supabase authentication
        if (typeof SupabaseAuth !== 'undefined') {
            this.auth = new SupabaseAuth();
            console.log('✅ Supabase Auth initialized');
            
            // Initialize usage manager
            if (typeof UsageManager !== 'undefined') {
                // Pass the HuggingFaceService from aiGenerator
                const hfService = (this.aiGenerator && this.aiGenerator.huggingFaceService) 
                    ? this.aiGenerator.huggingFaceService 
                    : null;
                    
                console.log('🔍 Debug - aiGenerator:', !!this.aiGenerator);
                console.log('🔍 Debug - hfService:', !!hfService);
                if (hfService) {
                    console.log('🔍 Debug - hfService.generate3DModel:', typeof hfService.generate3DModel);
                }
                    
                this.usageManager = new UsageManager(this.auth, hfService);
                console.log('✅ Usage Manager initialized with HF service:', !!hfService);
                
                // Update usage display
                this.usageManager.updateUsageDisplay();
                
                // Add auth UI
                this.addAuthUI();
            }
            
            // Listen for auth state changes
            this.auth.onAuthStateChange((user) => {
                this.handleAuthStateChange(user);
            });
        } else {
            console.log('ℹ️ Supabase Auth not available - running in limited mode');
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('✅ User logged in:', user.email);
            this.showNotification(`👋 Welcome back, ${user.email}!`, 'success');
        } else {
            console.log('👋 User logged out');
        }
        
        // Update usage display
        if (this.usageManager) {
            this.usageManager.updateUsageDisplay();
        }
        
        // Update auth UI
        this.updateAuthUI();
    }

    addAuthUI() {
        // Add login/logout button to header
        const header = document.querySelector('.app-header');
        if (header) {
            const authContainer = document.createElement('div');
            authContainer.className = 'auth-container';
            authContainer.innerHTML = `
                <div id="user-info" class="user-info hidden">
                    <span id="user-email"></span>
                    <button id="logout-btn" class="auth-btn secondary">Logout</button>
                </div>
                <div id="auth-buttons" class="auth-buttons">
                    <button id="signup-btn" class="auth-btn primary">Sign Up</button>
                </div>
                <div id="usage-display" class="usage-display">
                    <span id="usage-status"></span>
                </div>
            `;
            
            header.appendChild(authContainer);
            
            // Add event listeners
            this.setupAuthEventListeners();
            
            document.getElementById('logout-btn').addEventListener('click', () => {
                this.auth.logout();
            });
            
            this.updateAuthUI();
        }
    }

    setupAuthEventListeners() {
        const authButtons = document.getElementById('auth-buttons');
        
        // Dynamic auth button handler
        authButtons.addEventListener('click', (e) => {
            if (e.target.id === 'signup-btn') {
                this.auth.showAuthModal('signup');
            } else if (e.target.id === 'login-btn') {
                this.auth.showAuthModal('login');
            }
        });
    }

    updateAuthButtonState(mode = 'signup') {
        const authButtons = document.getElementById('auth-buttons');
        
        if (mode === 'signup') {
            authButtons.innerHTML = '<button id="signup-btn" class="auth-btn primary">Sign Up</button>';
        } else {
            authButtons.innerHTML = '<button id="login-btn" class="auth-btn primary">Login</button>';
        }
    }

    updateSmartAuthButton() {
        // Check if user has previously logged in (preference stored)
        const hasAccount = localStorage.getItem('threeai_has_account') === 'true';
        const authButtons = document.getElementById('auth-buttons');
        
        if (hasAccount) {
            // User has an account, show login button
            authButtons.innerHTML = '<button id="login-btn" class="auth-btn primary">Login</button>';
        } else {
            // New user or no preference, show signup button
            authButtons.innerHTML = '<button id="signup-btn" class="auth-btn primary">Sign Up</button>';
        }
        
        // Re-attach event listeners since we replaced the HTML
        this.setupAuthEventListeners();
    }

    switchToLogin() {
        localStorage.setItem('threeai_has_account', 'true');
        this.updateSmartAuthButton();
    }

    switchToSignup() {
        localStorage.setItem('threeai_has_account', 'false');
        this.updateSmartAuthButton();
    }

    updateAuthUI() {
        const userInfo = document.getElementById('user-info');
        const authButtons = document.getElementById('auth-buttons');
        const userEmail = document.getElementById('user-email');
        
        if (this.auth && this.auth.isLoggedIn()) {
            const user = this.auth.getCurrentUser();
            if (user && userEmail) {
                userEmail.textContent = user.email;
                userInfo?.classList.remove('hidden');
                authButtons?.classList.add('hidden');
            }
        } else {
            userInfo?.classList.add('hidden');
            authButtons?.classList.remove('hidden');
        }
    }

    showAIStatus() {
        // Check if token is available
        const token = localStorage.getItem('hf_token');
        
        if (token) {
            // Show success message with token
            setTimeout(() => {
                this.showNotification('🤗 Hugging Face AI enabled with your token!', 'success');
            }, 1000);
        } else {
            // Show setup guide for better results
            setTimeout(() => {
                this.showNotification('🤗 Hugging Face AI enabled (limited). Click AI button for better results!', 'info');
            }, 1000);
        }
    }

    addAIToggle() {
        // Add AI toggle button to the UI
        const controlsContainer = document.querySelector('.viewer-controls');
        if (controlsContainer) {
            const aiToggle = document.createElement('button');
            aiToggle.className = 'control-btn ai-toggle';
            aiToggle.id = 'ai-toggle';
            aiToggle.title = 'Toggle AI Generation';
            aiToggle.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2ZM12 4.1L20 8.2V10C20 15 17 18.7 12 20C7 18.7 4 15 4 10V8.2L12 4.1ZM9 12L7 10L5.5 11.5L9 15L18.5 5.5L17 4L9 12Z"/>
                </svg>
                <span class="ai-status">AI</span>
            `;
            
            aiToggle.addEventListener('click', () => {
                this.toggleAI();
            });
            
            controlsContainer.appendChild(aiToggle);
            this.updateAIToggleStatus();
        }
    }

    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        this.updateAIToggleStatus();
        
        const status = this.aiEnabled ? 'enabled' : 'disabled';
        const message = this.aiEnabled ? 
            '🤗 Hugging Face AI Generation enabled' : 
            '⚙️ Procedural Generation enabled';
        this.showNotification(message, 'info');
    }

    updateAIToggleStatus() {
        const aiToggle = document.getElementById('ai-toggle');
        const aiStatus = aiToggle?.querySelector('.ai-status');
        
        if (aiToggle && aiStatus) {
            const hasToken = localStorage.getItem('hf_token');
            
            if (this.aiEnabled) {
                aiToggle.classList.add('active');
                aiStatus.textContent = hasToken ? '🤗 HF' : '🤗 Basic';
                aiToggle.style.backgroundColor = hasToken ? '#10b981' : '#f59e0b';
                aiToggle.title = hasToken ? 
                    'Hugging Face AI Generation Enabled (With Token)' : 
                    'Hugging Face AI Generation Enabled (Limited) - Click to setup token';
            } else {
                aiToggle.classList.remove('active');
                aiStatus.textContent = 'AI';
                aiToggle.style.backgroundColor = '#6b7280';
                aiToggle.title = 'AI Generation Disabled';
            }
        }
    }

    setupDOM() {
        this.canvas = document.getElementById('3d-canvas');
        this.promptInput = document.getElementById('prompt-input');
        this.generateButton = document.getElementById('generate-button');
        this.historyList = document.getElementById('history-list');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.emptyState = document.getElementById('empty-state');
        this.historyEmpty = document.getElementById('history-empty');
        
        // New auth and usage elements
        this.hfToggle = document.getElementById('hf-toggle');
        this.authButtons = document.getElementById('auth-buttons');
        this.userProfile = document.getElementById('user-profile');
        this.usageStats = document.getElementById('usage-stats');
        
        // Auth buttons
        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');
        this.logoutLink = document.getElementById('logout-link');
        this.userMenuBtn = document.getElementById('user-menu-btn');
        this.userDropdown = document.getElementById('user-dropdown');
        
        // Usage display elements
        this.proceduralCount = document.getElementById('procedural-count');
        this.hfCount = document.getElementById('hf-count');
        
        // Token management elements
        this.tokenStatus = document.getElementById('token-status');
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
        
        // Auth event listeners
        this.setupAuthListeners();
        
        // HF Toggle
        if (this.hfToggle) {
            this.hfToggle.addEventListener('change', () => {
                this.handleHFToggle();
            });
        }
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
        console.log('Setting up navigation for', navLinks.length, 'links');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                console.log('Navigation clicked:', section);
                this.handleNavigation(section, link);
            });
        });
    }

    handleNavigation(section, clickedLink) {
        console.log('Handling navigation to:', section);
        
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
                console.log('Showing home section');
                this.showHomeSection();
                break;
            case 'history':
                console.log('Showing history section');
                this.showHistorySection();
                break;
            case 'gallery':
                console.log('Showing gallery section');
                this.showGallerySection();
                break;
            case 'contact':
                console.log('Showing contact section');
                this.showContactSection();
                break;
            default:
                console.log('Unknown section:', section);
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
        console.log('Creating history modal...');
        this.hideModalSections();
        const modal = this.createModal('History', this.generateHistoryContent());
        document.body.appendChild(modal);
        console.log('History modal created and added to body');
    }

    showGallerySection() {
        console.log('Creating gallery modal...');
        this.hideModalSections();
        const modal = this.createModal('Gallery', this.generateGalleryContent());
        document.body.appendChild(modal);
        console.log('Gallery modal created and added to body');
    }

    showContactSection() {
        console.log('Creating contact modal...');
        this.hideModalSections();
        const modal = this.createModal('Contact Us', this.generateContactContent());
        document.body.appendChild(modal);
        console.log('Contact modal created and added to body');
    }

    createModal(title, content) {
        console.log('Creating modal with title:', title);
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
            console.log('Closing modal via close button');
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Closing modal via overlay click');
                document.body.removeChild(modal);
            }
        });

        // Add functionality to prompt tags if they exist
        const promptTags = modal.querySelectorAll('.prompt-tag');
        promptTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const prompt = tag.getAttribute('data-prompt');
                if (prompt && this.promptInput) {
                    this.promptInput.value = prompt;
                    this.showNotification(`✨ Prompt set: "${prompt}"`, 'success');
                    document.body.removeChild(modal);
                    // Switch to home section to see the prompt
                    document.querySelector('[data-section="home"]').click();
                }
            });
        });

        console.log('Modal created successfully');
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
                        <div class="prompt-tag" data-prompt="horse galloping">🐎 Horse</div>
                        <div class="prompt-tag" data-prompt="red ferrari sports car">🏎️ Ferrari</div>
                        <div class="prompt-tag" data-prompt="robot walking">🤖 Robot</div>
                        <div class="prompt-tag" data-prompt="soldier standing">🪖 Soldier</div>
                        <div class="prompt-tag" data-prompt="parrot colorful bird">🦜 Parrot</div>
                        <div class="prompt-tag" data-prompt="flamingo pink bird">🦩 Flamingo</div>
                        <div class="prompt-tag" data-prompt="damaged helmet armor">⚔️ Helmet</div>
                        <div class="prompt-tag" data-prompt="stork white bird">🕊️ Stork</div>
                        <div class="prompt-tag" data-prompt="crystal sculpture">💎 Crystal</div>
                        <div class="prompt-tag" data-prompt="spiral tower">🌪️ Spiral</div>
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

        const useHF = this.hfToggle ? this.hfToggle.checked : false;

        // Check if user can generate
        if (!this.canGenerate(useHF)) {
            if (useHF) {
                this.showNotification('No AI credits remaining. Please login or use your own token.', 'warning');
                if (!this.currentUser) {
                    this.showLoginModal();
                }
            } else {
                if (!this.currentUser) {
                    this.showNotification('Generation limit reached. Please login for unlimited procedural generations.', 'warning');
                    this.showLoginModal();
                } else {
                    this.showNotification('This should not happen - unlimited procedural for logged in users', 'error');
                }
            }
            return;
        }

        // Generate based on mode
        if (useHF) {
            // Check if user has their own HF token
            const userToken = hfTokenManager.getToken();
            if (userToken) {
                await this.generateWithUserToken(prompt, userToken);
            } else {
                // No user token - show token dialog
                this.showTokenRequiredDialog();
                return;
            }
        } else {
            await this.generateProcedural(prompt);
        }

        // Increment usage after successful generation
        this.incrementUsage(useHF);
    }

    /**
     * Show dialog when user tries to use AI without token
     */
    showTokenRequiredDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 AI Generation Requires Your Token</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>To use AI generation, you need your own HuggingFace token.</strong></p>
                    
                    <div class="benefits">
                        <p><strong>✨ Benefits of adding your token:</strong></p>
                        <ul>
                            <li>🚀 Unlimited AI generations</li>
                            <li>🎯 Access to latest AI models</li>
                            <li>🔒 Your token stays secure on your device</li>
                            <li>⚡ Faster processing with your quota</li>
                        </ul>
                    </div>
                    
                    <div class="fallback">
                        <p><strong>💡 Don't have a token?</strong></p>
                        <p>You can still use <strong>procedural generation</strong> which creates 3D objects using algorithms.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal').remove(); app.hfToggle.checked = false;" class="btn btn-secondary">Use Procedural</button>
                    <button onclick="this.closest('.modal').remove(); hfTokenManager.showTokenDialog();" class="btn btn-primary">Add HF Token</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async generateWithUserToken(prompt, userToken) {
        this.showLoading(true);
        this.generateButton.disabled = true;

        try {
            console.log('🤗 Starting AI generation with user token for:', prompt);
            
            // Try different AI approaches
            let model = null;
            
            // 1. Try HuggingFace service if available
            if (window.HuggingFaceService) {
                try {
                    console.log('🔄 Attempting HuggingFace generation...');
                    const hfService = new HuggingFaceService(userToken);
                    model = await hfService.generate3DModel(prompt, { 
                        model: 'shap_e',
                        guidanceScale: 15.0,
                        steps: 50 
                    });
                    if (model) {
                        console.log('✅ HuggingFace generation successful!');
                    }
                } catch (error) {
                    console.warn('HuggingFace service failed:', error);
                    model = null;
                }
            }
            
            // 2. Try AIModelGenerator with Shap-E
            if (!model && this.aiGenerator) {
                try {
                    console.log('🔄 Attempting Shap-E generation...');
                    model = await this.aiGenerator.generateWithShapE(prompt, { 
                        apiKey: userToken,
                        guidanceScale: 15.0,
                        steps: 50 
                    });
                    if (model) {
                        console.log('✅ Shap-E generation successful!');
                    }
                } catch (error) {
                    console.warn('Shap-E generation failed:', error);
                    model = null;
                }
            }
            
            // 3. Fallback to enhanced procedural
            if (!model) {
                console.log('🎨 Falling back to AI-enhanced procedural generation...');
                model = await this.aiGenerator.generateAIStyledProceduralModel(prompt);
            }
            
            // Add the model to the scene
            if (model) {
                this.clearScene();
                this.scene.add(model);
                console.log('✅ Model added to scene successfully');
                this.showNotification('✨ AI generation completed!', 'success');
            } else {
                throw new Error('Failed to generate any model');
            }
            
        } catch (error) {
            console.error('AI generation failed completely:', error);
            this.showNotification('AI generation failed, trying enhanced procedural...', 'warning');
            await this.generateProcedural(prompt);
        } finally {
            this.showLoading(false);
            this.generateButton.disabled = false;
        }
    }

    async generateProcedural(prompt) {
        this.showLoading(true);
        this.generateButton.disabled = true;

        try {
            console.log('🎨 Starting enhanced procedural generation for:', prompt);
            
            // Clear existing objects
            this.clearScene();
            this.emptyState.style.display = 'none';

            // Use enhanced procedural generation
            let model = null;
            
            if (this.aiGenerator) {
                model = await this.aiGenerator.generateAIStyledProceduralModel(prompt);
            }
            
            if (!model) {
                // Fallback to basic procedural
                model = await this.aiGenerator.generateProceduralModel(prompt);
            }
            
            if (model) {
                // Position the model
                model.position.set(0, 0, 0);
                model.castShadow = true;
                model.receiveShadow = true;
                
                this.scene.add(model);
                this.objects.push(model);
                
                // Focus camera on the new model
                this.focusCameraOnScene();
                
                // Add to history
                this.addToHistory(prompt);
                
                console.log('✅ Enhanced procedural generation completed');
                this.showNotification('🎨 Enhanced procedural generation completed!', 'success');
            } else {
                throw new Error('Failed to generate procedural model');
            }
            
        } catch (error) {
            console.error('Procedural generation failed:', error);
            this.showNotification('Generation failed', 'error');
            this.emptyState.style.display = 'flex';
        } finally {
            this.showLoading(false);
            this.generateButton.disabled = false;
        }
    }

    async generateWithUsageManager(prompt) {
        this.showLoading(true);
        this.generateButton.disabled = true;

        try {
            // Clear existing objects
            this.clearScene();
            this.emptyState.style.display = 'none';

            this.showNotification('🤖 Generating with AI...', 'info');
            
            // Execute generation through usage manager
            const aiModel = await this.usageManager.executeGeneration(prompt);
            
            if (aiModel) {
                // Position the AI-generated model
                aiModel.position.set(0, 1, 0);
                aiModel.castShadow = true;
                aiModel.receiveShadow = true;
                
                this.scene.add(aiModel);
                this.objects.push(aiModel);
                
                // Focus camera on the new model
                this.focusCameraOnScene();
                this.showNotification('✨ AI model generated successfully!', 'success');
            } else {
                // Fallback to procedural generation
                await this.parseAndCreateGeometryProcedural(prompt);
            }

            // Add to history
            this.addToHistory(prompt);
            this.renderer.render(this.scene, this.camera);

        } finally {
            this.showLoading(false);
            this.generateButton.disabled = false;
        }
    }

    async generateGeometryDirect(prompt) {
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
        // Try AI generation first if enabled
        if (this.aiEnabled && this.aiGenerator) {
            try {
                this.showNotification('🤖 Generating with AI...', 'info');
                const aiModel = await this.tryAIGeneration(prompt);
                
                if (aiModel) {
                    // Position the AI-generated model
                    aiModel.position.set(0, 1, 0);
                    aiModel.castShadow = true;
                    aiModel.receiveShadow = true;
                    
                    this.scene.add(aiModel);
                    this.objects.push(aiModel);
                    
                    // Focus camera on the new model
                    this.focusCameraOnScene();
                    this.showNotification('✨ AI model generated successfully!', 'success');
                    return; // Exit early if AI generation succeeded
                }
            } catch (error) {
                console.warn('AI generation failed, using fallback:', error);
                this.showNotification('AI generation failed, using fallback...', 'warning');
            }
        }

        // Fallback to procedural generation
        await this.parseAndCreateGeometryProcedural(prompt);
    }

    async parseAndCreateGeometryProcedural(prompt) {
        console.log('🎨 Using enhanced procedural generation for:', prompt);
        
        try {
            // Use the enhanced procedural generation from AIModelGenerator
            let model = null;
            
            if (this.aiGenerator) {
                // Try enhanced AI-styled procedural first
                try {
                    model = await this.aiGenerator.generateAIStyledProceduralModel(prompt);
                    console.log('✅ Enhanced procedural generation successful');
                } catch (error) {
                    console.warn('Enhanced procedural failed, trying basic:', error);
                    model = await this.aiGenerator.generateProceduralModel(prompt);
                }
            }
            
            if (model) {
                // Position the model
                model.position.set(0, 0, 0);
                model.castShadow = true;
                model.receiveShadow = true;
                
                this.scene.add(model);
                this.objects.push(model);
                
                // Focus camera on the new model
                this.focusCameraOnScene();
                console.log('✅ Enhanced procedural model added to scene');
                
            } else {
                // Final fallback to old procedural method
                console.log('🔄 Using legacy procedural fallback...');
                await this.legacyProceduralGeneration(prompt);
            }
            
        } catch (error) {
            console.error('Enhanced procedural generation failed:', error);
            await this.legacyProceduralGeneration(prompt);
        }
        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    async legacyProceduralGeneration(prompt) {
        // Original procedural generation as fallback
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
    }

    async tryAIGeneration(prompt) {
        // Check cache first
        const cachedModel = this.aiGenerator.getCachedModel(prompt);
        if (cachedModel) {
            this.showNotification('📦 Using cached AI model', 'info');
            return cachedModel;
        }

        // Generation strategies in priority order
        const strategies = [
            {
                name: 'GLB Models',
                fn: () => this.aiGenerator.generateWithGLBLibrary(prompt),
                timeout: 15000
            },
            {
                name: 'Hugging Face',
                fn: () => this.aiGenerator.generateWithShapE(prompt),
                timeout: 45000
            },
            {
                name: 'Enhanced Procedural',
                fn: () => this.aiGenerator.generateAIStyledProceduralModel(prompt),
                timeout: 5000
            },
            {
                name: 'Basic Procedural',
                fn: () => this.aiGenerator.generateProceduralModel(prompt),
                timeout: 3000
            }
        ];

        for (const strategy of strategies) {
            try {
                console.log(`🔄 Trying ${strategy.name}...`);
                this.showNotification(`🔄 Trying ${strategy.name}...`, 'info');
                
                const model = await Promise.race([
                    strategy.fn(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), strategy.timeout)
                    )
                ]);

                if (model) {
                    console.log(`✅ ${strategy.name} generation successful!`);
                    this.showNotification(`✅ ${strategy.name} generation successful!`, 'success');
                    
                    // Cache the successful generation
                    this.aiGenerator.cacheModel(prompt, model);
                    return model;
                }
            } catch (error) {
                console.warn(`⚠️ ${strategy.name} failed:`, error.message);
                continue;
            }
        }

        console.error('❌ All generation strategies failed');
        return null; // All strategies failed
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

    // ===== AUTH AND USAGE MANAGEMENT =====
    
    setupAuthListeners() {
        // Login button
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }
        
        // Signup button  
        if (this.signupBtn) {
            this.signupBtn.addEventListener('click', () => {
                this.showSignupModal();
            });
        }
        
        // Logout link
        if (this.logoutLink) {
            this.logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // User menu toggle
        if (this.userMenuBtn) {
            this.userMenuBtn.addEventListener('click', () => {
                this.toggleUserMenu();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.userDropdown && !this.userProfile.contains(e.target)) {
                this.userDropdown.classList.remove('show');
            }
        });
    }
    
    handleHFToggle() {
        if (this.hfToggle.checked) {
            // User wants to use AI - check if they have a token
            if (!hfTokenManager.hasToken) {
                // No token - show token dialog
                this.hfToggle.checked = false;
                this.showTokenRequiredDialog();
            } else {
                this.showNotification('AI mode enabled with your token', 'success');
            }
        } else {
            this.showNotification('Procedural mode enabled', 'info');
        }
    }
    
    showLoginModal() {
        if (this.auth && this.auth.showAuthModal) {
            this.auth.showAuthModal('login');
        } else {
            this.showNotification('Please wait for auth system to load...', 'warning');
        }
    }
    
    showSignupModal() {
        if (this.auth && this.auth.showAuthModal) {
            this.auth.showAuthModal('signup');
        } else {
            this.showNotification('Please wait for auth system to load...', 'warning');
        }
    }
    
    async logout() {
        if (this.auth && this.auth.logout) {
            await this.auth.logout();
            this.currentUser = null;
            this.updateAuthUI();
            this.updateUsageDisplay();
            this.showNotification('Logged out successfully', 'success');
        } else {
            this.showNotification('Auth system not available', 'error');
        }
    }
    
    toggleUserMenu() {
        if (this.userDropdown) {
            this.userDropdown.classList.toggle('show');
        }
    }
    
    async updateAuthUI() {
        // Only update if elements exist
        if (!this.authButtons || !this.userProfile) {
            console.log('Auth UI elements not found, skipping update');
            return;
        }
        
        if (this.currentUser) {
            // Show user profile, hide auth buttons
            this.authButtons.style.display = 'none';
            this.userProfile.style.display = 'flex';
            
            // Update user name - get from profile or metadata
            const userName = document.getElementById('user-name');
            if (userName) {
                let displayName = this.currentUser.email?.split('@')[0] || 'User';
                
                // Try to get full name from user metadata or profile
                if (this.currentUser.user_metadata?.full_name) {
                    displayName = this.currentUser.user_metadata.full_name;
                } else if (this.auth && this.auth.getUserProfile) {
                    try {
                        const profile = await this.auth.getUserProfile(this.currentUser.id);
                        if (profile?.full_name) {
                            displayName = profile.full_name;
                        }
                    } catch (error) {
                        console.log('Could not fetch user profile for name');
                    }
                }
                
                userName.textContent = displayName;
            }
        } else {
            // Show smart auth button, hide user profile
            this.authButtons.style.display = 'flex';
            this.userProfile.style.display = 'none';
            
            // Show smart auth button based on user preference
            this.updateSmartAuthButton();
        }
    }
    
    getUsageData() {
        if (this.currentUser) {
            // Get from server/supabase for logged in users
            return this.usageManager ? this.usageManager.getCurrentUsage() : { procedural: 0, hf: 0 };
        } else {
            // Get from localStorage for anonymous users
            const usage = localStorage.getItem('threeai_usage');
            return usage ? JSON.parse(usage) : { procedural: 0, hf: 0 };
        }
    }
    
    saveUsageData(usage) {
        if (this.currentUser) {
            // Save to server/supabase for logged in users
            if (this.usageManager) {
                this.usageManager.updateUsage(usage);
            }
        } else {
            // Save to localStorage for anonymous users
            localStorage.setItem('threeai_usage', JSON.stringify(usage));
        }
    }
    
    updateUsageDisplay() {
        // Check if config is available
        if (!window.HUGGINGFACE_CONFIG || !window.HUGGINGFACE_CONFIG.limits) {
            console.log('HUGGINGFACE_CONFIG not available, skipping usage display update');
            return;
        }
        
        const usage = this.getUsageData();
        const limits = this.currentUser ? window.HUGGINGFACE_CONFIG.limits.registered : window.HUGGINGFACE_CONFIG.limits.anonymous;
        
        if (this.proceduralCount) {
            this.proceduralCount.textContent = `${usage.procedural}/${this.currentUser ? '∞' : limits.procedural}`;
        }
        
        if (this.hfCount) {
            // AI generations with user token are unlimited
            const hasToken = hfTokenManager.hasToken;
            this.hfCount.textContent = hasToken ? `${usage.hf}/∞` : 'Token Required';
        }
    }
    
    canGenerate(useHF = false) {
        // Check if config is available
        if (!window.HUGGINGFACE_CONFIG || !window.HUGGINGFACE_CONFIG.limits) {
            console.log('HUGGINGFACE_CONFIG not available, allowing generation');
            return true; // Allow generation if config not available
        }
        
        const usage = this.getUsageData();
        const limits = this.currentUser ? window.HUGGINGFACE_CONFIG.limits.registered : window.HUGGINGFACE_CONFIG.limits.anonymous;
        
        if (useHF) {
            // AI generation requires user's own token
            if (!hfTokenManager.hasToken) {
                return false; // No user token available
            }
            // With user token, they have unlimited generations
            return true;
        } else {
            // Procedural generation limits
            if (this.currentUser) return true; // Unlimited procedural for logged in
            return usage.procedural < limits.procedural;
        }
    }
    
    incrementUsage(useHF = false) {
        const usage = this.getUsageData();
        
        if (useHF) {
            usage.hf += 1;
        } else {
            usage.procedural += 1;
        }
        
        this.saveUsageData(usage);
        this.updateUsageDisplay();
    }
    
    async initializeAuth() {
        // Initialize Supabase authentication using the SupabaseAuth class
        if (typeof SupabaseAuth !== 'undefined') {
            this.auth = new SupabaseAuth();
            console.log('✅ Supabase Auth initialized');
            
            // Listen for auth state changes
            if (this.auth.onAuthStateChange) {
                this.auth.onAuthStateChange((user) => {
                    this.currentUser = user;
                    this.updateAuthUI();
                    this.updateUsageDisplay();
                });
            }
            
            // Check current auth state
            this.currentUser = this.auth.getCurrentUser ? this.auth.getCurrentUser() : null;
            
            // Initialize usage manager if available
            if (typeof UsageManager !== 'undefined') {
                // Pass the HuggingFaceService from aiGenerator
                const hfService = (this.aiGenerator && this.aiGenerator.huggingFaceService) 
                    ? this.aiGenerator.huggingFaceService 
                    : null;
                    
                this.usageManager = new UsageManager(this.auth, hfService);
                console.log('✅ Usage Manager initialized with HF service:', !!hfService);
            }
        } else {
            console.log('ℹ️ Supabase Auth class not available - running without authentication');
        }
        
        // Update UI
        this.updateAuthUI();
        this.updateUsageDisplay();
        
        // Make app globally accessible for modal callbacks
        window.app = this;
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