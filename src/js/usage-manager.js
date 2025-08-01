/**
 * Usage Management System
 * Handles tiered usage limits and token management
 */

class UsageManager {
    constructor(supabaseAuth, huggingFaceService) {
        this.auth = supabaseAuth;
        this.hfService = huggingFaceService;
        
        // Get owner token from configuration
        this.ownerToken = (typeof HUGGINGFACE_CONFIG !== 'undefined' && HUGGINGFACE_CONFIG.ownerToken) 
            ? HUGGINGFACE_CONFIG.ownerToken 
            : 'hf_demo_token_replace_with_actual';
            
        this.usageLimits = (typeof HUGGINGFACE_CONFIG !== 'undefined' && HUGGINGFACE_CONFIG.limits)
            ? HUGGINGFACE_CONFIG.limits
            : {
                anonymous: 1,
                registered: 3,
                ownToken: Infinity
            };
            
        // Check if services are available
        if (!this.hfService) {
            console.warn('⚠️ Hugging Face service not available. AI generation will be limited.');
        }
    }

    /**
     * Check if user can generate and return generation options
     */
    async checkGenerationPermission() {
        const isLoggedIn = this.auth.isLoggedIn();
        
        if (!isLoggedIn) {
            return await this.checkAnonymousUsage();
        } else {
            return await this.checkRegisteredUsage();
        }
    }

    /**
     * Check anonymous user usage
     */
    async checkAnonymousUsage() {
        const hasUsedFree = localStorage.getItem('free_generation_used');
        
        if (hasUsedFree) {
            return {
                canGenerate: false,
                reason: 'anonymous_limit_reached',
                message: 'You\'ve used your free generation. Please create an account for 3 more free generations!',
                action: 'login_required'
            };
        }

        return {
            canGenerate: true,
            useOwnerToken: true,
            remainingGenerations: 1,
            userType: 'anonymous',
            message: 'This is your free generation. Create an account for 3 more!'
        };
    }

    /**
     * Check registered user usage
     */
    async checkRegisteredUsage() {
        const usage = await this.auth.getUserUsage();
        
        if (!usage) {
            return {
                canGenerate: false,
                reason: 'usage_data_error',
                message: 'Unable to load usage data. Please try again.',
                action: 'retry'
            };
        }

        // User has their own token
        if (usage.has_own_token) {
            return {
                canGenerate: true,
                useOwnerToken: false,
                useUserToken: true,
                remainingGenerations: 'unlimited',
                userType: 'own_token',
                message: 'Using your own Hugging Face token - unlimited generations!'
            };
        }

        // User is using free generations
        const remaining = 3 - usage.free_generations_used;
        
        if (remaining > 0) {
            return {
                canGenerate: true,
                useOwnerToken: true,
                remainingGenerations: remaining,
                userType: 'registered',
                message: `${remaining} free generations remaining. Using owner's token.`
            };
        }

        // User has exhausted free generations
        return {
            canGenerate: false,
            reason: 'free_limit_reached',
            message: 'You\'ve used all 3 free generations. Add your own Hugging Face token for unlimited use!',
            action: 'token_required',
            showTokenSetup: true
        };
    }

    /**
     * Execute generation with appropriate token
     */
    async executeGeneration(prompt, options = {}) {
        const permission = await this.checkGenerationPermission();
        
        if (!permission.canGenerate) {
            throw new Error(permission.message);
        }

        // Determine which token to use
        let tokenToUse = null;
        if (permission.useOwnerToken) {
            tokenToUse = this.ownerToken;
            console.log('🔑 Using owner\'s token for generation');
        } else if (permission.useUserToken) {
            tokenToUse = localStorage.getItem('hf_token');
            console.log('🔑 Using user\'s own token for generation');
        }

        // Set the token in options
        const generationOptions = {
            ...options,
            apiKey: tokenToUse
        };

        try {
            // Execute the generation
            let result = null;
            
        if (this.hfService && this.hfService.generate3DModel) {
            console.log('✅ Using Hugging Face service for generation');
            // Update the service token if needed
            if (tokenToUse && this.hfService.apiToken !== tokenToUse) {
                this.hfService.apiToken = tokenToUse;
                console.log('🔄 Updated service token for this generation');
            }
            
            result = await this.hfService.generate3DModel(prompt, generationOptions);
        } else {
            console.log('🔍 Debug - hfService available:', !!this.hfService);
            if (this.hfService) {
                console.log('🔍 Debug - generate3DModel method:', typeof this.hfService.generate3DModel);
                console.log('🔍 Debug - hfService methods:', Object.getOwnPropertyNames(this.hfService));
            }
            // Fallback to procedural generation
            console.warn('⚠️ Hugging Face service not available, using procedural generation');
            throw new Error('AI service not available - falling back to procedural generation');
        }            // Track the usage
            await this.trackUsage(permission);
            
            // Update UI
            this.updateUsageDisplay();
            
            return result;
        } catch (error) {
            console.error('Generation failed:', error);
            throw error;
        }
    }

    /**
     * Track usage after successful generation
     */
    async trackUsage(permission) {
        if (permission.userType === 'anonymous') {
            localStorage.setItem('free_generation_used', 'true');
        } else if (permission.userType === 'registered') {
            await this.auth.useGeneration();
        }
        // For own_token users, usage is tracked by Hugging Face directly
    }

    /**
     * Update usage display in UI
     */
    async updateUsageDisplay() {
        const permission = await this.checkGenerationPermission();
        const statusElement = document.getElementById('usage-status');
        const generateButton = document.getElementById('generate-button');
        
        if (statusElement) {
            let statusText = '';
            let statusColor = '#10b981';
            
            if (permission.canGenerate) {
                if (permission.userType === 'anonymous') {
                    statusText = `${permission.remainingGenerations} free left`;
                    statusColor = '#f59e0b';
                } else if (permission.userType === 'registered') {
                    statusText = `${permission.remainingGenerations} free left`;
                    statusColor = '#10b981';
                } else {
                    statusText = 'Unlimited';
                    statusColor = '#8b5cf6';
                }
            } else {
                statusText = 'Limit reached';
                statusColor = '#ef4444';
            }
            
            statusElement.textContent = statusText;
            statusElement.style.color = statusColor;
        }

        // Update generate button state
        if (generateButton) {
            generateButton.disabled = !permission.canGenerate;
            
            if (!permission.canGenerate) {
                generateButton.textContent = permission.action === 'login_required' ? 
                    'Login to Generate' : 'Add Token to Generate';
                generateButton.onclick = () => {
                    if (permission.action === 'login_required') {
                        this.auth.showAuthModal();
                    } else if (permission.showTokenSetup) {
                        this.showTokenSetupForUser();
                    }
                };
            } else {
                generateButton.textContent = 'Generate Scene';
                generateButton.onclick = null; // Will be set by main app
            }
        }
    }

    /**
     * Show token setup specifically for exhausted users
     */
    showTokenSetupForUser() {
        const modal = this.createUserTokenModal();
        document.body.appendChild(modal);
    }

    /**
     * Create user token setup modal
     */
    createUserTokenModal() {
        const modal = document.createElement('div');
        modal.className = 'user-token-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🚀 Continue Creating with Your Token</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="usage-summary">
                            <h3>✅ You've used all 3 free generations!</h3>
                            <p>To continue creating amazing 3D models, add your own Hugging Face token for unlimited generations.</p>
                        </div>

                        <div class="token-setup">
                            <h4>🔑 Add Your Hugging Face Token</h4>
                            <div class="setup-steps">
                                <div class="step">
                                    <span class="step-number">1</span>
                                    <span>Get a FREE token from <a href="https://huggingface.co/settings/tokens" target="_blank">Hugging Face</a></span>
                                </div>
                                <div class="step">
                                    <span class="step-number">2</span>
                                    <span>Enter your token below:</span>
                                </div>
                            </div>
                            
                            <div class="token-input-group">
                                <input type="password" id="user-hf-token" placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                                <button id="add-token-btn" class="primary-btn">Add Token</button>
                            </div>
                        </div>

                        <div class="benefits">
                            <h4>🎁 Benefits of Using Your Token</h4>
                            <ul>
                                <li>✨ Unlimited 3D generations</li>
                                <li>⚡ Faster processing (your quota)</li>
                                <li>🎯 Better model access</li>
                                <li>🔒 Your data stays private</li>
                            </ul>
                        </div>

                        <div class="alternative">
                            <p><strong>Don't want to add a token?</strong></p>
                            <p>You can still view and download any models you've already created!</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="maybe-later-btn" class="secondary-btn">Maybe Later</button>
                        <button id="get-token-btn" class="primary-btn">Get Free Token</button>
                    </div>
                </div>
            </div>
        `;

        this.addUserTokenModalStyles();
        this.addUserTokenModalListeners(modal);
        return modal;
    }

    /**
     * Add user token modal styles
     */
    addUserTokenModalStyles() {
        if (document.getElementById('user-token-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'user-token-modal-styles';
        style.textContent = `
            .user-token-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }

            .user-token-modal .modal-overlay {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .user-token-modal .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .user-token-modal .usage-summary {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 24px;
            }

            .user-token-modal .usage-summary h3 {
                margin: 0 0 8px 0;
            }

            .user-token-modal .setup-steps {
                margin: 16px 0;
            }

            .user-token-modal .step {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }

            .user-token-modal .step-number {
                background: #3b82f6;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                margin-right: 12px;
            }

            .user-token-modal .token-input-group {
                display: flex;
                gap: 12px;
                margin: 16px 0;
            }

            .user-token-modal #user-hf-token {
                flex: 1;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-family: monospace;
            }

            .user-token-modal .primary-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }

            .user-token-modal .secondary-btn {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }

            .user-token-modal .benefits {
                background: #f0f9ff;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }

            .user-token-modal .benefits ul {
                margin: 8px 0;
                padding-left: 20px;
            }

            .user-token-modal .alternative {
                background: #fef3c7;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
            }

            .user-token-modal .modal-footer {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                padding: 16px 24px 24px;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Add user token modal listeners
     */
    addUserTokenModalListeners(modal) {
        // Close modal
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('#maybe-later-btn').onclick = () => modal.remove();
        
        // Get token button
        modal.querySelector('#get-token-btn').onclick = () => {
            window.open('https://huggingface.co/settings/tokens', '_blank');
        };

        // Add token
        modal.querySelector('#add-token-btn').onclick = async () => {
            await this.addUserToken(modal);
        };

        // Enter key in input
        modal.querySelector('#user-hf-token').onkeydown = (e) => {
            if (e.key === 'Enter') {
                this.addUserToken(modal);
            }
        };
    }

    /**
     * Add user's own token
     */
    async addUserToken(modal) {
        const tokenInput = modal.querySelector('#user-hf-token');
        const addBtn = modal.querySelector('#add-token-btn');
        const token = tokenInput.value.trim();

        if (!token) {
            alert('Please enter your Hugging Face token');
            return;
        }

        if (!token.startsWith('hf_')) {
            alert('Hugging Face tokens should start with "hf_"');
            return;
        }

        addBtn.disabled = true;
        addBtn.textContent = 'Testing...';

        try {
            // Test the token
            const response = await fetch('https://api-inference.huggingface.co/models/openai/point-e', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: 'test',
                    options: { wait_for_model: true }
                })
            });

            if (response.status === 401) {
                throw new Error('Invalid token. Please check your Hugging Face token.');
            }

            // Save token
            localStorage.setItem('hf_token', token);
            
            // Update user record
            await this.auth.setUserHasOwnToken(true);
            
            // Update UI
            await this.updateUsageDisplay();
            
            modal.remove();
            
            if (window.app && window.app.showNotification) {
                window.app.showNotification('🎉 Token added successfully! You now have unlimited generations.', 'success');
            }

        } catch (error) {
            alert(`Failed to add token: ${error.message}`);
        } finally {
            addBtn.disabled = false;
            addBtn.textContent = 'Add Token';
        }
    }

    /**
     * Get usage statistics for display
     */
    async getUsageStats() {
        const permission = await this.checkGenerationPermission();
        const isLoggedIn = this.auth.isLoggedIn();
        
        let stats = {
            isLoggedIn,
            canGenerate: permission.canGenerate,
            userType: permission.userType || 'anonymous',
            remainingGenerations: permission.remainingGenerations || 0,
            message: permission.message || ''
        };

        if (isLoggedIn) {
            const usage = await this.auth.getUserUsage();
            if (usage) {
                stats.totalGenerations = usage.total_generations;
                stats.freeGenerationsUsed = usage.free_generations_used;
                stats.hasOwnToken = usage.has_own_token;
            }
        }

        return stats;
    }

    /**
     * Reset anonymous usage (for testing)
     */
    resetAnonymousUsage() {
        localStorage.removeItem('free_generation_used');
        this.updateUsageDisplay();
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsageManager;
} else if (typeof window !== 'undefined') {
    window.UsageManager = UsageManager;
}
