/**
 * Application Configuration
 * Replace these values with your actual credentials
 */

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // Replace with your Supabase URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Replace with your Supabase anon key
};

// Hugging Face Configuration
const HUGGINGFACE_CONFIG = {
    // API endpoints for different models
    endpoints: {
        shapeE: 'https://api-inference.huggingface.co/models/openai/shap-e',
        pointE: 'https://api-inference.huggingface.co/models/openai/point-e',
        stableDiffusion: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2'
    },
    
    // Generation limits
    limits: {
        // Anonymous users (not logged in)
        anonymous: {
            procedural: 5  // 5 procedural generations, AI requires user token
        },
        // Registered users (logged in)  
        registered: {
            procedural: 999,    // Unlimited procedural generations
            aiWithToken: 999    // Unlimited AI generations if user provides token
        }
    },
    
    // Token management
    tokenStorage: {
        key: 'user_hf_token',      // LocalStorage key for user's token
        encrypted: false            // Set to true if implementing encryption
    }
};

// App Configuration
const APP_CONFIG = {
    appName: 'ThreeAI 3D Creator',
    version: '1.0.0',
    features: {
        enableAuth: true,
        enableAI: true,
        enableUsageTracking: true
    }
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        HUGGINGFACE_CONFIG,
        APP_CONFIG
    };
} else if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.HUGGINGFACE_CONFIG = HUGGINGFACE_CONFIG;
    window.APP_CONFIG = APP_CONFIG;
}
