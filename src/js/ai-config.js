/**
 * AI Service Configuration
 * Configure different AI services for 3D model generation
 */

const AI_SERVICES = {
    // Hugging Face Models
    HUGGING_FACE: {
        enabled: true,
        baseUrl: 'https://api-inference.huggingface.co/models/',
        models: {
            shap_e: {
                id: 'openai/shap-e-img2obj',
                description: 'OpenAI Shap-E: Text/Image to 3D',
                inputType: 'text',
                outputFormat: 'ply',
                maxPromptLength: 77,
                estimatedTime: '30-60s'
            },
            point_e: {
                id: 'openai/point-e',
                description: 'OpenAI Point-E: Text to Point Cloud',
                inputType: 'text',
                outputFormat: 'ply',
                maxPromptLength: 77,
                estimatedTime: '20-40s'
            }
        },
        pricing: 'Free tier: 1000 requests/month',
        documentation: 'https://huggingface.co/docs/api-inference/index'
    },

    // Replicate API
    REPLICATE: {
        enabled: true,
        baseUrl: 'https://api.replicate.com/v1/predictions',
        models: {
            dreamfusion: {
                version: 'a283b2e8e73461449d2d6b59c8b8c78d6b9c4d3a',
                description: 'DreamFusion: Text to 3D using NeRF',
                inputType: 'text',
                outputFormat: 'glb',
                estimatedTime: '5-10min'
            },
            stable_dreamfusion: {
                version: 'b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1',
                description: 'Stable DreamFusion for 3D generation',
                inputType: 'text',
                outputFormat: 'obj',
                estimatedTime: '3-8min'
            }
        },
        pricing: 'Pay per use: $0.01-0.50 per generation',
        documentation: 'https://replicate.com/docs'
    },

    // Local AI Server
    LOCAL_AI: {
        enabled: false, // Set to true when you have local server running
        baseUrl: 'http://localhost:8000',
        models: {
            custom_point_e: {
                endpoint: '/generate/point-e',
                description: 'Self-hosted Point-E model',
                inputType: 'text',
                outputFormat: 'ply'
            },
            custom_shap_e: {
                endpoint: '/generate/shap-e',
                description: 'Self-hosted Shap-E model',
                inputType: 'text',
                outputFormat: 'glb'
            }
        },
        setup_instructions: `
            To set up local AI server:
            1. Clone Point-E: git clone https://github.com/openai/point-e
            2. Install dependencies: pip install -r requirements.txt
            3. Run server: python server.py
            4. Enable LOCAL_AI in this config
        `
    },

    // Pre-trained Model Library
    MODEL_LIBRARY: {
        enabled: true,
        baseUrl: 'https://threejs.org/examples/models/gltf/',
        models: {
            animals: {
                'horse': 'Horse.glb',
                'parrot': 'Parrot.glb', 
                'flamingo': 'Flamingo.glb',
                'stork': 'Stork.glb',
                'dog': 'RobotExpressive.glb', // Will use as placeholder
                'cat': 'RobotExpressive.glb', // Will use as placeholder
                'bird': 'Parrot.glb'
            },
            vehicles: {
                'car': 'ferrari.glb',
                'truck': 'ferrari.glb', // Placeholder
                'motorcycle': 'ferrari.glb', // Placeholder  
                'helicopter': 'helicopter.glb',
                'plane': 'helicopter.glb', // Placeholder
                'airplane': 'helicopter.glb',
                'aircraft': 'helicopter.glb',
                'boat': 'ferrari.glb', // Placeholder
                'ship': 'ferrari.glb' // Placeholder
            },
            robots: {
                'robot': 'RobotExpressive.glb',
                'droid': 'RobotExpressive.glb',
                'android': 'RobotExpressive.glb'
            },
            characters: {
                'soldier': 'Soldier.glb',
                'character': 'RobotExpressive.glb',
                'person': 'Soldier.glb',
                'human': 'Soldier.glb'
            },
            abstract: {
                'sculpture': 'DamagedHelmet.glb',
                'helmet': 'DamagedHelmet.glb',
                'armor': 'DamagedHelmet.glb'
            }
        },
        // Additional Three.js example models
        alternativeModels: {
            'ferrari': 'https://threejs.org/examples/models/gltf/ferrari.glb',
            'robottExpressive': 'https://threejs.org/examples/models/gltf/RobotExpressive.glb',
            'soldier': 'https://threejs.org/examples/models/gltf/Soldier.glb',
            'damagedHelmet': 'https://threejs.org/examples/models/gltf/DamagedHelmet.glb',
            'horse': 'https://threejs.org/examples/models/gltf/Horse.glb',
            'parrot': 'https://threejs.org/examples/models/gltf/Parrot.glb',
            'flamingo': 'https://threejs.org/examples/models/gltf/Flamingo.glb',
            'stork': 'https://threejs.org/examples/models/gltf/Stork.glb'
        },
        fallback: true,
        description: 'High-quality 3D models from Three.js examples'
    },

    // Procedural Generation
    PROCEDURAL: {
        enabled: true,
        description: 'Algorithmic generation of basic shapes and structures',
        categories: {
            architecture: ['building', 'house', 'tower', 'bridge'],
            nature: ['tree', 'mountain', 'cloud', 'terrain'],
            vehicles: ['car', 'plane', 'boat', 'rocket'],
            furniture: ['chair', 'table', 'bookshelf', 'bed'],
            abstract: ['spiral', 'wave', 'fractal', 'lattice']
        },
        fallback: true
    }
};

// Generation Strategy Configuration
const GENERATION_STRATEGY = {
    // Order of preference for generation methods
    priority: [
        'HUGGING_FACE',     // Primary: Good quality, free
        'PROCEDURAL',       // Fast fallback
        'MODEL_LIBRARY',    // Fast, reliable
        'REPLICATE',        // High quality, paid
        'LOCAL_AI'          // Best quality, requires setup
    ],

    // Fallback chain
    fallback_chain: [
        'PROCEDURAL',
        'MODEL_LIBRARY'
    ],

    // Quality vs Speed preference
    mode: 'balanced', // 'fast', 'balanced', 'quality'

    // Cache settings
    cache: {
        enabled: true,
        maxSize: 50,        // Maximum cached models
        ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        persistLocal: true   // Save to localStorage
    },

    // Generation timeouts
    timeouts: {
        fast: 10000,        // 10 seconds
        balanced: 60000,    // 1 minute
        quality: 300000     // 5 minutes
    }
};

// Prompt Enhancement
const PROMPT_ENHANCEMENT = {
    enabled: true,
    
    // Add quality modifiers to prompts
    quality_modifiers: [
        'high quality',
        'detailed',
        '3d model',
        'clean topology'
    ],
    
    // Style presets
    styles: {
        realistic: 'photorealistic, high detail, accurate proportions',
        stylized: 'cartoon style, simplified, colorful',
        lowpoly: 'low poly, geometric, minimal detail',
        modern: 'modern design, clean lines, minimalist'
    },
    
    // Negative prompts (what to avoid)
    negative_prompts: [
        'blurry',
        'low quality',
        'distorted',
        'incomplete'
    ]
};

// API Keys Configuration (set these in your environment)
const API_CONFIG = {
    huggingface: {
        token: 'hf_demo_token_free', // Demo token for testing
        required: false, // Free tier available
        freeQuotaUsed: false // Track free quota usage
    },
    replicate: {
        token: 'your-replicate-token-here', // Browser doesn't have process.env
        required: true // Paid service
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AI_SERVICES,
        GENERATION_STRATEGY,
        PROMPT_ENHANCEMENT,
        API_CONFIG
    };
} else if (typeof window !== 'undefined') {
    window.AI_CONFIG = {
        AI_SERVICES,
        GENERATION_STRATEGY,
        PROMPT_ENHANCEMENT,
        API_CONFIG
    };
}
