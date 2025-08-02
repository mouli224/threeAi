/**
 * GLB Model Library Service
 * Loads high-quality GLB models from Three.js examples
 */

class GLBModelLibrary {
    constructor() {
        this.baseUrl = 'https://threejs.org/examples/models/gltf/';
        this.modelCache = new Map();
        this.loader = new THREE.GLTFLoader();
        this.loadingPromises = new Map(); // Prevent duplicate loads
        
        // Model mapping from keywords to actual GLB files
        this.modelMap = {
            // Animals
            'horse': 'Horse.glb',
            'parrot': 'Parrot.glb',
            'flamingo': 'Flamingo.glb', 
            'stork': 'Stork.glb',
            'bird': 'Parrot.glb',
            'animal': 'Horse.glb',
            
            // Vehicles
            'car': 'ferrari.glb',
            'ferrari': 'ferrari.glb',
            'vehicle': 'ferrari.glb',
            'sports car': 'ferrari.glb',
            
            // Characters/Robots
            'robot': 'RobotExpressive.glb',
            'soldier': 'Soldier.glb',
            'character': 'RobotExpressive.glb',
            'person': 'Soldier.glb',
            'human': 'Soldier.glb',
            'droid': 'RobotExpressive.glb',
            'android': 'RobotExpressive.glb',
            
            // Objects
            'helmet': 'DamagedHelmet.glb',
            'armor': 'DamagedHelmet.glb',
            'sculpture': 'DamagedHelmet.glb'
        };
        
        console.log('🎯 GLB Model Library initialized with', Object.keys(this.modelMap).length, 'models');
    }

    /**
     * Find the best matching GLB model for a prompt
     */
    findBestMatch(prompt) {
        const words = prompt.toLowerCase().split(' ');
        console.log('🔍 Finding GLB model for prompt:', prompt);
        console.log('🔍 Keywords:', words);
        
        // Direct matches first
        for (const word of words) {
            if (this.modelMap[word]) {
                console.log('✅ Direct match found:', word, '->', this.modelMap[word]);
                return this.modelMap[word];
            }
        }
        
        // Partial matches
        for (const [keyword, model] of Object.entries(this.modelMap)) {
            if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
                console.log('✅ Partial match found:', keyword, '->', model);
                return model;
            }
        }
        
        // Category-based fallbacks
        if (words.some(w => ['animal', 'creature', 'pet'].includes(w))) {
            console.log('✅ Animal category fallback -> Horse.glb');
            return 'Horse.glb';
        }
        
        if (words.some(w => ['vehicle', 'transport', 'machine'].includes(w))) {
            console.log('✅ Vehicle category fallback -> ferrari.glb');
            return 'ferrari.glb';
        }
        
        if (words.some(w => ['person', 'people', 'human', 'character'].includes(w))) {
            console.log('✅ Character category fallback -> Soldier.glb');
            return 'Soldier.glb';
        }
        
        // Default fallback
        console.log('🎲 No specific match, using default -> RobotExpressive.glb');
        return 'RobotExpressive.glb';
    }

    /**
     * Load a GLB model by prompt
     */
    async loadModelByPrompt(prompt) {
        const modelFile = this.findBestMatch(prompt);
        return await this.loadModel(modelFile);
    }

    /**
     * Load a specific GLB model
     */
    async loadModel(modelFile) {
        console.log('📦 Loading GLB model:', modelFile);
        
        // Check cache first
        if (this.modelCache.has(modelFile)) {
            console.log('🎯 Using cached GLB model:', modelFile);
            const cached = this.modelCache.get(modelFile);
            return this.cloneModel(cached);
        }
        
        // Check if already loading
        if (this.loadingPromises.has(modelFile)) {
            console.log('⏳ Model already loading, waiting...:', modelFile);
            const model = await this.loadingPromises.get(modelFile);
            return this.cloneModel(model);
        }
        
        // Load the model
        const url = this.baseUrl + modelFile;
        console.log('🌐 Fetching GLB from:', url);
        
        const loadPromise = new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    console.log('✅ GLB model loaded successfully:', modelFile);
                    const model = gltf.scene;
                    
                    // Optimize the model
                    this.optimizeModel(model);
                    
                    // Cache the model
                    this.modelCache.set(modelFile, model);
                    this.loadingPromises.delete(modelFile);
                    
                    resolve(model);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`📥 Loading ${modelFile}: ${percent}%`);
                },
                (error) => {
                    console.error('❌ Failed to load GLB model:', modelFile, error);
                    this.loadingPromises.delete(modelFile);
                    reject(new Error(`Failed to load ${modelFile}: ${error.message}`));
                }
            );
        });
        
        this.loadingPromises.set(modelFile, loadPromise);
        const model = await loadPromise;
        return this.cloneModel(model);
    }

    /**
     * Clone a model for reuse
     */
    cloneModel(model) {
        const cloned = model.clone();
        
        // Ensure materials are also cloned
        cloned.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
            }
        });
        
        return cloned;
    }

    /**
     * Optimize model for web display
     */
    optimizeModel(model) {
        // Normalize scale and position
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Scale to reasonable size (max 3 units)
        if (maxDim > 3) {
            const scale = 3 / maxDim;
            model.scale.multiplyScalar(scale);
        }
        
        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(model.scale.x));
        
        // Position above ground
        const newBox = new THREE.Box3().setFromObject(model);
        const newSize = newBox.getSize(new THREE.Vector3());
        model.position.y = newSize.y / 2;
        
        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Improve material if needed
                if (child.material) {
                    if (child.material.map) {
                        child.material.map.encoding = THREE.sRGBEncoding;
                    }
                }
            }
        });
        
        console.log('⚡ Model optimized - Scale:', model.scale.x.toFixed(2), 'Position Y:', model.position.y.toFixed(2));
    }

    /**
     * Get all available models
     */
    getAvailableModels() {
        return Object.keys(this.modelMap);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.modelCache.clear();
        this.loadingPromises.clear();
        console.log('🗑️ GLB model cache cleared');
    }

    /**
     * Preload popular models
     */
    async preloadPopularModels() {
        const popularModels = ['Horse.glb', 'ferrari.glb', 'RobotExpressive.glb', 'Soldier.glb'];
        console.log('🚀 Preloading popular GLB models...');
        
        const promises = popularModels.map(model => 
            this.loadModel(model).catch(error => 
                console.warn(`Failed to preload ${model}:`, error.message)
            )
        );
        
        await Promise.allSettled(promises);
        console.log('✅ Popular models preloaded');
    }

    /**
     * Get model info for debugging
     */
    getModelInfo(model) {
        let meshCount = 0;
        let vertexCount = 0;
        let materialCount = 0;
        const materials = new Set();
        
        model.traverse((child) => {
            if (child.isMesh) {
                meshCount++;
                if (child.geometry) {
                    vertexCount += child.geometry.attributes.position?.count || 0;
                }
                if (child.material) {
                    materials.add(child.material.uuid);
                }
            }
        });
        
        return {
            meshes: meshCount,
            vertices: vertexCount,
            materials: materials.size,
            boundingBox: new THREE.Box3().setFromObject(model)
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GLBModelLibrary;
} else if (typeof window !== 'undefined') {
    window.GLBModelLibrary = GLBModelLibrary;
}
