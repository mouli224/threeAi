/**
 * Supabase Configuration and Authentication
 * Handles user authentication and usage tracking
 */

class SupabaseAuth {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.initialized = false;
        this.initPromise = this.initSupabase();
    }

    /**
     * Initialize Supabase client
     */
    async initSupabase() {
        try {
            // Check if configuration is available
            if (typeof SUPABASE_CONFIG === 'undefined') {
                console.error('⚠️ Supabase configuration not found. Please check config.js');
                return;
            }

            if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || 
                SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
                SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                console.error('⚠️ Supabase URL or anon key not configured. Please update config.js with real values');
                return;
            }

            // Check if Supabase is loaded
            if (typeof window.supabase === 'undefined') {
                console.error('Supabase client not loaded. Please include Supabase CDN.');
                return;
            }

            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url, 
                SUPABASE_CONFIG.anonKey
            );

            this.initialized = true;
            console.log('✅ Supabase client initialized successfully');
            
            // Check for email confirmation in URL
            await this.handleEmailConfirmation();
            
            // Check current session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.user = session.user;
                console.log('✅ User already logged in:', this.user.email);
            }

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                this.user = session?.user || null;
                this.onAuthStateChange(event, session);
            });

        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
        }
    }

    /**
     * Handle authentication state changes
     */
    onAuthStateChange(event, session) {
        const authButton = document.getElementById('auth-button');
        const userInfo = document.getElementById('user-info');
        
        if (session?.user) {
            // User logged in
            this.updateUIForLoggedInUser(session.user);
            this.trackUserLogin(session.user);
        } else {
            // User logged out
            this.updateUIForLoggedOutUser();
        }
        
        // Trigger usage limit update
        if (window.app && window.app.updateUsageLimits) {
            window.app.updateUsageLimits();
        }
    }

    /**
     * Update UI for logged in user
     */
    async updateUIForLoggedInUser(user) {
        const authButton = document.getElementById('auth-button');
        const userInfo = document.getElementById('user-info');
        
        // Get user profile to show name
        const profile = await this.getUserProfile(user.id);
        const displayName = profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0];
        
        if (authButton) {
            authButton.textContent = 'Logout';
            authButton.onclick = () => this.signOut();
        }
        
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    <span class="user-name">👋 ${displayName}</span>
                    <span class="user-email">${user.email}</span>
                    <span class="user-status" id="usage-status">Loading...</span>
                </div>
            `;
            userInfo.style.display = 'block';
        }
        
        // Update navbar user display if it exists
        this.updateNavbarUserDisplay(displayName, user.email);
    }

    /**
     * Update navbar user display
     */
    updateNavbarUserDisplay(displayName, email) {
        const userName = document.getElementById('user-name');
        const userProfile = document.getElementById('user-profile');
        const authButtons = document.getElementById('auth-buttons');
        
        if (userName) {
            userName.textContent = displayName;
        }
        
        if (userProfile && authButtons) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
        }
    }

    /**
     * Update UI for logged out user
     */
    updateUIForLoggedOutUser() {
        const authButton = document.getElementById('auth-button');
        const userInfo = document.getElementById('user-info');
        
        if (authButton) {
            authButton.textContent = 'Login';
            authButton.onclick = () => this.showAuthModal();
        }
        
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }

    /**
     * Show authentication modal
     */
    showAuthModal() {
        const modal = this.createAuthModal();
        document.body.appendChild(modal);
    }

    /**
     * Create authentication modal
     */
    createAuthModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🚀 Join ThreeAI</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="auth-tabs">
                            <button class="tab-btn active" data-tab="login">Login</button>
                            <button class="tab-btn" data-tab="signup">Sign Up</button>
                        </div>
                        
                        <div class="tab-content active" id="login-tab">
                            <h3>Welcome Back!</h3>
                            <form id="login-form">
                                <input type="email" id="login-email" placeholder="Email" required>
                                <input type="password" id="login-password" placeholder="Password" required>
                                <button type="submit" class="auth-btn">Login</button>
                            </form>
                            <p class="auth-info">
                                ✨ Get 3 free AI generations with your account!
                            </p>
                        </div>
                        
                        <div class="tab-content" id="signup-tab">
                            <h3>Create Your Account</h3>
                            <form id="signup-form">
                                <input type="text" id="signup-name" placeholder="Full Name" required>
                                <input type="email" id="signup-email" placeholder="Email" required>
                                <input type="password" id="signup-password" placeholder="Password (min 6 chars)" required minlength="6">
                                <input type="password" id="signup-confirm" placeholder="Confirm Password" required>
                                <button type="submit" class="auth-btn">Sign Up</button>
                            </form>
                            <p class="auth-info">
                                🎁 New users get 3 free AI generations!<br>
                                💡 After that, add your own Hugging Face token for unlimited use.
                            </p>
                        </div>

                        <div class="usage-tiers">
                            <h4>💫 Usage Tiers</h4>
                            <div class="tier">
                                <strong>👤 No Account:</strong> 1 free generation
                            </div>
                            <div class="tier">
                                <strong>🆕 New User:</strong> 3 free generations
                            </div>
                            <div class="tier">
                                <strong>🔑 Own Token:</strong> Unlimited generations
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addAuthModalStyles();
        this.addAuthModalListeners(modal);
        return modal;
    }

    /**
     * Add modal styles
     */
    addAuthModalStyles() {
        if (document.getElementById('auth-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'auth-modal-styles';
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }

            .auth-modal .modal-overlay {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .auth-modal .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 450px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .auth-modal .modal-header {
                padding: 24px 24px 16px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .auth-modal .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
            }

            .auth-modal .auth-tabs {
                display: flex;
                border-bottom: 1px solid #e5e7eb;
            }

            .auth-modal .tab-btn {
                flex: 1;
                padding: 16px;
                border: none;
                background: none;
                cursor: pointer;
                font-weight: 500;
                color: #6b7280;
            }

            .auth-modal .tab-btn.active {
                color: #3b82f6;
                border-bottom: 2px solid #3b82f6;
            }

            .auth-modal .tab-content {
                padding: 24px;
                display: none;
            }

            .auth-modal .tab-content.active {
                display: block;
            }

            .auth-modal .tab-content h3 {
                margin: 0 0 20px 0;
                color: #1f2937;
            }

            .auth-modal form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .auth-modal input {
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 16px;
            }

            .auth-modal input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .auth-modal .auth-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 16px;
            }

            .auth-modal .auth-btn:hover {
                background: #2563eb;
            }

            .auth-modal .auth-btn:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }

            .auth-modal .auth-info {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 16px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 8px;
            }

            .auth-modal .usage-tiers {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }

            .auth-modal .usage-tiers h4 {
                margin: 0 0 16px 0;
                color: #1f2937;
            }

            .auth-modal .tier {
                padding: 8px 0;
                color: #374151;
                font-size: 14px;
            }

            .user-profile {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }

            .user-email {
                font-size: 14px;
                color: #374151;
                font-weight: 500;
            }

            .user-status {
                font-size: 12px;
                color: #6b7280;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Add modal event listeners
     */
    addAuthModalListeners(modal) {
        // Close modal
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-overlay').onclick = (e) => {
            if (e.target.classList.contains('modal-overlay')) modal.remove();
        };

        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                const tab = btn.dataset.tab;
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                modal.querySelector(`#${tab}-tab`).classList.add('active');
            };
        });

        // Login form
        modal.querySelector('#login-form').onsubmit = async (e) => {
            e.preventDefault();
            const email = modal.querySelector('#login-email').value;
            const password = modal.querySelector('#login-password').value;
            await this.signIn(email, password, modal);
        };

        // Signup form
        modal.querySelector('#signup-form').onsubmit = async (e) => {
            e.preventDefault();
            const name = modal.querySelector('#signup-name').value;
            const email = modal.querySelector('#signup-email').value;
            const password = modal.querySelector('#signup-password').value;
            const confirm = modal.querySelector('#signup-confirm').value;
            
            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }
            
            await this.signUp(name, email, password, modal);
        };
    }

    /**
     * Sign in user
     */
    async signIn(email, password, modal) {
        const btn = modal.querySelector('#login-form .auth-btn');
        btn.disabled = true;
        btn.textContent = 'Signing in...';

        try {
            // Wait for Supabase to be initialized
            await this.initPromise;
            
            if (!this.supabase) {
                throw new Error('Supabase client not initialized. Please check configuration.');
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            modal.remove();
            this.showNotification('✅ Successfully logged in!', 'success');
        } catch (error) {
            this.showNotification(`❌ Login failed: ${error.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    }

    /**
     * Sign up user
     */
    async signUp(name, email, password, modal) {
        const btn = modal.querySelector('#signup-form .auth-btn');
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            // Wait for Supabase to be initialized
            await this.initPromise;
            
            if (!this.supabase) {
                throw new Error('Supabase client not initialized. Please check configuration.');
            }

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/index.html`,
                    data: {
                        full_name: name,
                        app_name: 'ThreeAI 3D Creator'
                    }
                }
            });

            if (error) throw error;

            console.log('Signup successful:', data);

            // Store name in user metadata if signup is successful
            if (data.user) {
                await this.updateUserProfile(data.user.id, name);
            }

            // Always redirect to login after signup
            modal.remove();
            
            // Show success message and redirect to login
            this.showNotification('✅ Account created successfully! Please log in to continue.', 'success');
            
            // Wait a moment then show login modal
            setTimeout(() => {
                this.showAuthModal('login');
            }, 1500);

        } catch (error) {
            console.error('Signup error:', error);
            
            // Provide specific error messages
            let errorMessage = error.message;
            if (error.message.includes('User already registered')) {
                errorMessage = 'This email is already registered. Try logging in instead.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message.includes('Password')) {
                errorMessage = 'Password must be at least 6 characters long.';
            }
            
            this.showNotification(`❌ Signup failed: ${errorMessage}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign Up';
        }
    }

    /**
     * Sign out user
     */
    async signOut() {
        try {
            // Wait for Supabase to be initialized
            await this.initPromise;
            
            if (!this.supabase) {
                throw new Error('Supabase client not initialized');
            }

            await this.supabase.auth.signOut();
            this.showNotification('👋 Successfully logged out!', 'info');
        } catch (error) {
            this.showNotification(`❌ Logout failed: ${error.message}`, 'error');
        }
    }

    /**
     * Resend verification email
     */
    async resendVerification(email) {
        try {
            const { error } = await this.supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) throw error;

            this.showNotification('✅ Verification email resent! Check your inbox and spam folder.', 'success');
        } catch (error) {
            this.showNotification(`❌ Failed to resend email: ${error.message}`, 'error');
        }
    }

    /**
     * Handle email confirmation from URL
     */
    async handleEmailConfirmation() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        if (token && type === 'signup') {
            try {
                const { data, error } = await this.supabase.auth.verifyOtp({
                    token_hash: token,
                    type: 'email'
                });

                if (error) throw error;

                this.showNotification('✅ Email verified successfully! You can now use all features.', 'success');
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                return true;
            } catch (error) {
                this.showNotification(`❌ Email verification failed: ${error.message}`, 'error');
                return false;
            }
        }
        return false;
    }

    /**
     * Update user profile with name
     */
    async updateUserProfile(userId, name) {
        try {
            const { error } = await this.supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    full_name: name,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Could not save user profile:', error);
                // Don't throw error - profile saving is not critical for signup
            }
        } catch (error) {
            console.warn('Profile update failed:', error);
        }
    }

    /**
     * Get user profile including name
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.warn('Could not fetch user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.warn('Profile fetch failed:', error);
            return null;
        }
    }

    /**
     * Show verification message with resend option
     */
    showVerificationMessage(email) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📧 Check Your Email</h3>
                </div>
                <div class="modal-body">
                    <div class="verification-message">
                        <p>✅ Account created successfully!</p>
                        <p>We've sent a verification email to <strong>${email}</strong></p>
                        <p>Please check your inbox and click the verification link to activate your account.</p>
                        
                        <div class="email-help">
                            <h4>📋 Troubleshooting:</h4>
                            <ul>
                                <li>Check your <strong>spam/junk folder</strong></li>
                                <li>Wait a few minutes for the email to arrive</li>
                                <li>Make sure the email address is correct</li>
                            </ul>
                        </div>
                        
                        <div class="verification-actions">
                            <button class="auth-btn secondary" id="resend-email">
                                🔄 Resend Email
                            </button>
                            <button class="auth-btn primary" onclick="this.closest('.auth-modal').remove()">
                                OK, Got It
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for resend
        modal.querySelector('#resend-email').addEventListener('click', async () => {
            await this.resendVerification(email);
        });

        document.body.appendChild(modal);

        // Also show a regular notification
        this.showNotification('✅ Account created! Check your email to verify.', 'success');
    }

    /**
     * Initialize user usage tracking
     */
    async initializeUserUsage(user) {
        try {
            const { error } = await this.supabase
                .from('user_usage')
                .insert({
                    user_id: user.id,
                    email: user.email,
                    free_generations_used: 0,
                    total_generations: 0,
                    has_own_token: false,
                    created_at: new Date().toISOString()
                });

            if (error && !error.message.includes('already exists')) {
                console.error('Failed to initialize user usage:', error);
            }
        } catch (error) {
            console.error('Error initializing user usage:', error);
        }
    }

    /**
     * Track user login
     */
    async trackUserLogin(user) {
        try {
            const { error } = await this.supabase
                .from('user_usage')
                .upsert({
                    user_id: user.id,
                    email: user.email,
                    last_login: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                console.error('Failed to track user login:', error);
            }
        } catch (error) {
            console.error('Error tracking user login:', error);
        }
    }

    /**
     * Get user usage information
     */
    async getUserUsage() {
        if (!this.user) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', this.user.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get user usage:', error);
            return null;
        }
    }

    /**
     * Update user usage
     */
    async updateUserUsage(updates) {
        if (!this.user) return false;

        try {
            const { error } = await this.supabase
                .from('user_usage')
                .update(updates)
                .eq('user_id', this.user.id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to update user usage:', error);
            return false;
        }
    }

    /**
     * Check if user can generate (has remaining free generations)
     */
    async canUserGenerate() {
        if (!this.user) {
            // Non-logged user - check localStorage for single use
            const hasUsedFree = localStorage.getItem('free_generation_used');
            return !hasUsedFree;
        }

        const usage = await this.getUserUsage();
        if (!usage) return false;

        // If user has own token, they can always generate
        if (usage.has_own_token) return true;

        // Check free generations limit
        return usage.free_generations_used < 3;
    }

    /**
     * Use a generation (increment counter)
     */
    async useGeneration() {
        if (!this.user) {
            // Non-logged user
            localStorage.setItem('free_generation_used', 'true');
            return true;
        }

        const usage = await this.getUserUsage();
        if (!usage) return false;

        const updates = {
            total_generations: usage.total_generations + 1
        };

        // Only increment free generations if user doesn't have own token
        if (!usage.has_own_token) {
            updates.free_generations_used = usage.free_generations_used + 1;
        }

        return await this.updateUserUsage(updates);
    }

    /**
     * Set user's own token status
     */
    async setUserHasOwnToken(hasToken = true) {
        if (!this.user) return false;

        return await this.updateUserUsage({
            has_own_token: hasToken,
            own_token_added_at: hasToken ? new Date().toISOString() : null
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type) {
        // Use the main app's notification system if available
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.user;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseAuth;
} else if (typeof window !== 'undefined') {
    window.SupabaseAuth = SupabaseAuth;
}
