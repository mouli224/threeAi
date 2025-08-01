/**
 * Hugging Face Token Setup Guide
 * Instructions for getting better AI generation results
 */

class HuggingFaceTokenSetup {
    constructor() {
        this.setupModal = null;
    }

    /**
     * Show token setup guide to user
     */
    showTokenSetupGuide() {
        if (this.setupModal) {
            this.setupModal.remove();
        }

        this.setupModal = this.createSetupModal();
        document.body.appendChild(this.setupModal);
    }

    /**
     * Create the setup modal
     */
    createSetupModal() {
        const modal = document.createElement('div');
        modal.className = 'token-setup-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🤗 Improve AI Generation Quality</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="setup-section">
                            <h3>📈 Current Status</h3>
                            <div class="status-info">
                                <div class="status-item">
                                    <span class="status-label">Token Status:</span>
                                    <span class="status-value" id="token-status">❌ No Token</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">Daily Requests:</span>
                                    <span class="status-value" id="request-count">Limited (anonymous)</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">Generation Quality:</span>
                                    <span class="status-value" id="quality-status">⚠️ Basic (fallback to procedural)</span>
                                </div>
                            </div>
                        </div>

                        <div class="setup-section">
                            <h3>🚀 Get FREE Hugging Face Token</h3>
                            <div class="steps">
                                <div class="step">
                                    <span class="step-number">1</span>
                                    <div class="step-content">
                                        <strong>Visit Hugging Face</strong>
                                        <p>Go to <a href="https://huggingface.co" target="_blank">huggingface.co</a> and create a free account</p>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">2</span>
                                    <div class="step-content">
                                        <strong>Get API Token</strong>
                                        <p>Visit <a href="https://huggingface.co/settings/tokens" target="_blank">Settings > Tokens</a> and create a new token</p>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">3</span>
                                    <div class="step-content">
                                        <strong>Enter Token Below</strong>
                                        <input type="password" id="hf-token-input" placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                                        <button id="save-token-btn">💾 Save Token</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="setup-section">
                            <h3>📊 Benefits of Using Token</h3>
                            <div class="benefits">
                                <div class="benefit">
                                    <span class="benefit-icon">🎯</span>
                                    <strong>Better Accuracy:</strong> Access to full AI models
                                </div>
                                <div class="benefit">
                                    <span class="benefit-icon">⚡</span>
                                    <strong>Faster Generation:</strong> Priority API access
                                </div>
                                <div class="benefit">
                                    <span class="benefit-icon">📈</span>
                                    <strong>Higher Limits:</strong> 1000+ requests per day
                                </div>
                                <div class="benefit">
                                    <span class="benefit-icon">🎨</span>
                                    <strong>More Models:</strong> Access to latest AI models
                                </div>
                            </div>
                        </div>

                        <div class="setup-section">
                            <h3>💡 Free Tier Limits</h3>
                            <div class="limits-info">
                                <p><strong>Without Token:</strong> Very limited requests, basic fallback models</p>
                                <p><strong>With Free Token:</strong> 1000 requests/day, full model access</p>
                                <p><strong>Pro Account:</strong> Unlimited requests, fastest generation</p>
                            </div>
                        </div>

                        <div class="setup-section">
                            <h3>🔐 Privacy & Security</h3>
                            <div class="privacy-info">
                                <p>✅ Token stored locally in your browser</p>
                                <p>✅ Never sent to third parties</p>
                                <p>✅ You can remove it anytime</p>
                                <p>✅ Only used for Hugging Face API calls</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="skip-setup-btn" class="btn-secondary">Skip for Now</button>
                        <button id="test-generation-btn" class="btn-primary">🧪 Test Generation</button>
                    </div>
                </div>
            </div>
        `;

        // Add CSS styles
        this.addModalStyles();

        // Add event listeners
        this.addEventListeners(modal);

        return modal;
    }

    /**
     * Add modal styles
     */
    addModalStyles() {
        if (document.getElementById('token-setup-styles')) return;

        const style = document.createElement('style');
        style.id = 'token-setup-styles';
        style.textContent = `
            .token-setup-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }

            .token-setup-modal .modal-overlay {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .token-setup-modal .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .token-setup-modal .modal-header {
                padding: 24px 24px 16px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .token-setup-modal .modal-header h2 {
                margin: 0;
                color: #1f2937;
                font-size: 24px;
            }

            .token-setup-modal .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 4px;
                color: #6b7280;
            }

            .token-setup-modal .modal-close:hover {
                color: #ef4444;
            }

            .token-setup-modal .modal-body {
                padding: 24px;
            }

            .token-setup-modal .setup-section {
                margin-bottom: 32px;
            }

            .token-setup-modal .setup-section h3 {
                margin: 0 0 16px 0;
                color: #1f2937;
                font-size: 18px;
            }

            .token-setup-modal .status-info {
                background: #f9fafb;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .token-setup-modal .status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .token-setup-modal .status-item:last-child {
                margin-bottom: 0;
            }

            .token-setup-modal .status-label {
                font-weight: 500;
                color: #374151;
            }

            .token-setup-modal .status-value {
                color: #6b7280;
            }

            .token-setup-modal .steps {
                space-y: 16px;
            }

            .token-setup-modal .step {
                display: flex;
                align-items: flex-start;
                margin-bottom: 20px;
            }

            .token-setup-modal .step-number {
                background: #3b82f6;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 16px;
                flex-shrink: 0;
            }

            .token-setup-modal .step-content {
                flex: 1;
            }

            .token-setup-modal .step-content strong {
                display: block;
                margin-bottom: 4px;
                color: #1f2937;
            }

            .token-setup-modal .step-content p {
                margin: 0;
                color: #6b7280;
                line-height: 1.5;
            }

            .token-setup-modal .step-content a {
                color: #3b82f6;
                text-decoration: none;
            }

            .token-setup-modal .step-content a:hover {
                text-decoration: underline;
            }

            .token-setup-modal #hf-token-input {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                margin-top: 8px;
                margin-bottom: 12px;
                font-family: monospace;
            }

            .token-setup-modal #save-token-btn {
                background: #10b981;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
            }

            .token-setup-modal #save-token-btn:hover {
                background: #059669;
            }

            .token-setup-modal .benefits {
                display: grid;
                gap: 12px;
            }

            .token-setup-modal .benefit {
                display: flex;
                align-items: center;
                padding: 12px;
                background: #f0f9ff;
                border-radius: 8px;
                border: 1px solid #bae6fd;
            }

            .token-setup-modal .benefit-icon {
                margin-right: 12px;
                font-size: 20px;
            }

            .token-setup-modal .limits-info {
                background: #fef3c7;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #fbbf24;
            }

            .token-setup-modal .limits-info p {
                margin: 8px 0;
                color: #92400e;
            }

            .token-setup-modal .privacy-info {
                background: #f0fdf4;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #bbf7d0;
            }

            .token-setup-modal .privacy-info p {
                margin: 4px 0;
                color: #166534;
            }

            .token-setup-modal .modal-footer {
                padding: 16px 24px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                gap: 12px;
            }

            .token-setup-modal .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
            }

            .token-setup-modal .btn-secondary:hover {
                background: #e5e7eb;
            }

            .token-setup-modal .btn-primary {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
            }

            .token-setup-modal .btn-primary:hover {
                background: #2563eb;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Add event listeners
     */
    addEventListeners(modal) {
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#skip-setup-btn').addEventListener('click', () => {
            modal.remove();
        });

        // Save token
        modal.querySelector('#save-token-btn').addEventListener('click', () => {
            this.saveToken(modal);
        });

        // Test generation
        modal.querySelector('#test-generation-btn').addEventListener('click', () => {
            this.testGeneration(modal);
        });

        // Click outside to close
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                modal.remove();
            }
        });

        // Update status on load
        this.updateStatus(modal);
    }

    /**
     * Save token to localStorage
     */
    saveToken(modal) {
        const tokenInput = modal.querySelector('#hf-token-input');
        const token = tokenInput.value.trim();

        if (!token) {
            alert('Please enter a valid token');
            return;
        }

        if (!token.startsWith('hf_')) {
            alert('Hugging Face tokens should start with "hf_"');
            return;
        }

        try {
            localStorage.setItem('hf_token', token);
            this.updateStatus(modal);
            
            // Show success message
            const saveBtn = modal.querySelector('#save-token-btn');
            saveBtn.textContent = '✅ Saved!';
            saveBtn.style.background = '#10b981';
            
            setTimeout(() => {
                saveBtn.textContent = '💾 Save Token';
                saveBtn.style.background = '#10b981';
            }, 2000);

        } catch (error) {
            alert('Failed to save token: ' + error.message);
        }
    }

    /**
     * Test generation with current setup
     */
    async testGeneration(modal) {
        const testBtn = modal.querySelector('#test-generation-btn');
        const originalText = testBtn.textContent;
        
        testBtn.textContent = '🧪 Testing...';
        testBtn.disabled = true;

        try {
            // Try to make a simple API call
            const token = localStorage.getItem('hf_token');
            const response = await fetch('https://api-inference.huggingface.co/models/openai/point-e', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: 'test cube',
                    options: { wait_for_model: true }
                })
            });

            if (response.ok) {
                testBtn.textContent = '✅ Test Successful!';
                testBtn.style.background = '#10b981';
                alert('🎉 Hugging Face API is working! You can now generate high-quality 3D models.');
            } else if (response.status === 401) {
                testBtn.textContent = '❌ Invalid Token';
                testBtn.style.background = '#ef4444';
                alert('❌ Token is invalid. Please check your Hugging Face token.');
            } else if (response.status === 503) {
                testBtn.textContent = '⏳ Model Loading';
                testBtn.style.background = '#f59e0b';
                alert('⏳ Model is loading. This is normal and usually takes 20-30 seconds. Try generating again in a moment.');
            } else {
                testBtn.textContent = '⚠️ API Issue';
                testBtn.style.background = '#f59e0b';
                alert('⚠️ API call failed. You can still use enhanced procedural generation.');
            }
        } catch (error) {
            testBtn.textContent = '❌ Connection Error';
            testBtn.style.background = '#ef4444';
            alert('❌ Network error. Please check your internet connection.');
        }

        setTimeout(() => {
            testBtn.textContent = originalText;
            testBtn.style.background = '#3b82f6';
            testBtn.disabled = false;
        }, 3000);
    }

    /**
     * Update status display
     */
    updateStatus(modal) {
        const token = localStorage.getItem('hf_token');
        const tokenStatus = modal.querySelector('#token-status');
        const requestCount = modal.querySelector('#request-count');
        const qualityStatus = modal.querySelector('#quality-status');

        if (token) {
            tokenStatus.textContent = '✅ Token Configured';
            requestCount.textContent = '1000+ requests/day';
            qualityStatus.textContent = '✨ High Quality (AI Models)';
        } else {
            tokenStatus.textContent = '❌ No Token';
            requestCount.textContent = 'Very Limited';
            qualityStatus.textContent = '⚠️ Basic (Procedural Fallback)';
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuggingFaceTokenSetup;
} else if (typeof window !== 'undefined') {
    window.HuggingFaceTokenSetup = HuggingFaceTokenSetup;
}
