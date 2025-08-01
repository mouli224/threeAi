/**
 * Application Configuration
 * Replace these values with your actual credentials
 */

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://jmfgmpalqkdzckedbfbv.supabase.co', // Replace with your Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmdtcGFscWtkemNrZWRiZmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTA3NjMsImV4cCI6MjA2OTYyNjc2M30.zolFBiHRbZ2Rpy_po4Otb_7WKX_rm9XnrGqgPGbssvw' // Replace with your Supabase anon key
};

// Hugging Face Configuration
const HUGGINGFACE_CONFIG = {
    // Your actual Hugging Face token for the owner's free generations
    ownerToken: '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',
    
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
            procedural: 3  // 3 procedural generations, HF requires login
        },
        // Registered users (logged in)  
        registered: {
            ownerHf: 3,         // 3 HF generations using owner's token
            procedural: 999     // Unlimited procedural (high number)
        },
        dailyLimit: 50 // Total daily limit for owner's token
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
