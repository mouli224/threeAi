/**
 * HuggingFace Token Management
 * Handles user's personal HF tokens securely
 */

class HFTokenManager {
    constructor() {
        this.storageKey = HUGGINGFACE_CONFIG.tokenStorage.key;
        this.hasToken = this.checkToken();
    }

    /**
     * Check if user has a valid token stored
     */
    checkToken() {
        const token = localStorage.getItem(this.storageKey);
        return token && token.startsWith('hf_') && token.length > 10;
    }

    /**
     * Get user's stored token
     */
    getToken() {
        if (this.hasToken) {
            return localStorage.getItem(this.storageKey);
        }
        return null;
    }

    /**
     * Store user's token securely
     */
    setToken(token) {
        if (!token || !token.startsWith('hf_')) {
            throw new Error('Invalid HuggingFace token format. Token should start with "hf_"');
        }
        
        localStorage.setItem(this.storageKey, token);
        this.hasToken = true;
        
        // Update UI
        this.updateTokenStatus();
        return true;
    }

    /**
     * Remove user's token
     */
    removeToken() {
        localStorage.removeItem(this.storageKey);
        this.hasToken = false;
        this.updateTokenStatus();
    }

    /**
     * Update UI to reflect token status
     */
    updateTokenStatus() {
        const tokenStatus = document.getElementById('token-status');
        const aiToggle = document.getElementById('ai-toggle');
        
        if (this.hasToken) {
            if (tokenStatus) {
                tokenStatus.innerHTML = `
                    <span class="token-active">🔑 HF Token Active</span>
                    <button onclick="hfTokenManager.removeToken()" class="btn-remove-token">Remove</button>
                `;
            }
            if (aiToggle) {
                aiToggle.disabled = false;
                aiToggle.title = 'AI generation available with your token';
            }
        } else {
            if (tokenStatus) {
                tokenStatus.innerHTML = `
                    <span class="token-inactive">🔒 No HF Token</span>
                    <button onclick="hfTokenManager.showTokenDialog()" class="btn-add-token">Add Token</button>
                `;
            }
            if (aiToggle) {
                aiToggle.disabled = true;
                aiToggle.checked = false;
                aiToggle.title = 'Add your HuggingFace token to use AI generation';
            }
        }
    }

    /**
     * Show token input dialog
     */
    showTokenDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔑 Add Your HuggingFace Token</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Why do you need a token?</strong></p>
                    <p>• HuggingFace requires authentication for AI model access</p>
                    <p>• Your token stays on your device (not sent to our servers)</p>
                    <p>• This enables unlimited AI generations</p>
                    
                    <p><strong>How to get your token:</strong></p>
                    <ol>
                        <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank">HuggingFace Tokens</a></li>
                        <li>Create a new token with "Read" permission</li>
                        <li>Copy and paste it below</li>
                    </ol>
                    
                    <div class="form-group">
                        <label for="hf-token-input">HuggingFace Token:</label>
                        <input type="password" id="hf-token-input" placeholder="hf_..." class="token-input">
                        <small>Token should start with "hf_"</small>
                    </div>
                    
                    <div class="token-security">
                        <p>🔒 <strong>Security:</strong> Your token is stored locally and never transmitted to our servers.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">Cancel</button>
                    <button onclick="hfTokenManager.saveTokenFromDialog()" class="btn btn-primary">Save Token</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('hf-token-input').focus();
    }

    /**
     * Save token from dialog
     */
    saveTokenFromDialog() {
        const input = document.getElementById('hf-token-input');
        const token = input.value.trim();
        
        try {
            this.setToken(token);
            document.querySelector('.modal').remove();
            showNotification('🔑 HuggingFace token saved successfully!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
            input.focus();
        }
    }

    /**
     * Test if token is valid by making a simple API call
     */
    async validateToken(token = null) {
        const testToken = token || this.getToken();
        if (!testToken) return false;

        try {
            const response = await fetch('https://huggingface.co/api/whoami', {
                headers: {
                    'Authorization': `Bearer ${testToken}`
                }
            });
            return response.ok;
        } catch (error) {
            console.warn('Token validation failed:', error);
            return false;
        }
    }
}

// Initialize token manager
const hfTokenManager = new HFTokenManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HFTokenManager;
} else if (typeof window !== 'undefined') {
    window.HFTokenManager = HFTokenManager;
    window.hfTokenManager = hfTokenManager;
}
