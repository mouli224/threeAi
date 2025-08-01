/**
 * Simple API Integration Example
 * Quick setup for testing AI generation with Hugging Face
 */

// Simple example for immediate testing
class SimpleAIIntegration {
    constructor() {
        this.huggingFaceToken = 'your-token-here'; // Get from https://huggingface.co/settings/tokens
        this.enabled = false; // Set to true when you have a token
    }

    async generateSimpleModel(prompt) {
        if (!this.enabled) {
            console.log('AI disabled - add your Hugging Face token to enable');
            return this.createFallbackModel(prompt);
        }

        try {
            // Using Hugging Face Inference API
            const response = await fetch(
                'https://api-inference.huggingface.co/models/openai/clip-vit-large-patch14',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.huggingFaceToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        options: { wait_for_model: true }
                    }),
                }
            );

            if (response.ok) {
                // For demo purposes, return a procedural model
                // In real implementation, process the AI response
                return this.createEnhancedModel(prompt);
            }
        } catch (error) {
            console.warn('AI generation failed:', error);
        }

        return this.createFallbackModel(prompt);
    }

    createFallbackModel(prompt) {
        // Enhanced procedural generation based on prompt
        const words = prompt.toLowerCase();
        
        if (words.includes('car') || words.includes('vehicle')) {
            return this.createCar();
        } else if (words.includes('tree') || words.includes('plant')) {
            return this.createTree();
        } else if (words.includes('house') || words.includes('building')) {
            return this.createBuilding();
        } else if (words.includes('animal') || words.includes('cat') || words.includes('dog')) {
            return this.createAnimal();
        }
        
        // Default to a basic shape with color from prompt
        return this.createBasicShape(prompt);
    }

    createEnhancedModel(prompt) {
        // More sophisticated model based on AI insights
        const model = this.createFallbackModel(prompt);
        
        // Add some "AI-enhanced" features
        model.material = new THREE.MeshPhongMaterial({
            color: this.extractColor(prompt) || 0x888888,
            shininess: 100,
            specular: 0x222222
        });
        
        // Add subtle animation
        model.userData.animate = true;
        
        return model;
    }

    createCar() {
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFF4444 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        group.add(body);
        
        // Roof
        const roofGeometry = new THREE.BoxGeometry(1.2, 0.4, 0.8);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xCC3333 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0.2, 0.9, 0);
        group.add(roof);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const wheelPositions = [
            [-0.7, 0.15, 0.4],
            [0.7, 0.15, 0.4],
            [-0.7, 0.15, -0.4],
            [0.7, 0.15, -0.4]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            group.add(wheel);
        });
        
        return group;
    }

    createTree() {
        const group = new THREE.Group();
        
        // Trunk with texture-like material
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,
            shininess: 10
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.6;
        group.add(trunk);
        
        // Multiple leaf layers for more realistic look
        const leafMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x228B22,
            shininess: 30
        });
        
        // Bottom leaves
        const leaves1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 12, 8),
            leafMaterial
        );
        leaves1.position.set(0, 1.3, 0);
        leaves1.scale.set(1, 0.7, 1);
        group.add(leaves1);
        
        // Top leaves
        const leaves2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 12, 8),
            leafMaterial
        );
        leaves2.position.set(0, 1.7, 0);
        leaves2.scale.set(1, 0.8, 1);
        group.add(leaves2);
        
        return group;
    }

    createBuilding() {
        const group = new THREE.Group();
        
        // Main structure
        const buildingGeometry = new THREE.BoxGeometry(1.2, 2, 1.2);
        const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 1;
        group.add(building);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(0.8, 0.6, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 2.3;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
        
        // Windows
        const windowGeometry = new THREE.PlaneGeometry(0.2, 0.3);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        
        // Front windows
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-0.3, 1.3, 0.61);
        group.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(0.3, 1.3, 0.61);
        group.add(window2);
        
        return group;
    }

    createAnimal() {
        const group = new THREE.Group();
        
        // Simple cat-like animal
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.5;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 12, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.5, 0.5, 0);
        group.add(head);
        
        // Ears
        const earGeometry = new THREE.ConeGeometry(0.08, 0.15, 6);
        const earMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
        
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.position.set(0.45, 0.65, 0.1);
        group.add(ear1);
        
        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.position.set(0.45, 0.65, -0.1);
        group.add(ear2);
        
        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8);
        const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(-0.6, 0.7, 0);
        tail.rotation.z = Math.PI / 4;
        group.add(tail);
        
        return group;
    }

    createBasicShape(prompt) {
        const words = prompt.toLowerCase();
        let geometry;
        
        if (words.includes('sphere') || words.includes('ball')) {
            geometry = new THREE.SphereGeometry(0.5, 32, 32);
        } else if (words.includes('cylinder') || words.includes('tube')) {
            geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);
        } else if (words.includes('cone') || words.includes('triangle')) {
            geometry = new THREE.ConeGeometry(0.5, 1, 32);
        } else {
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        const color = this.extractColor(prompt) || 0x888888;
        const material = new THREE.MeshPhongMaterial({ color });
        
        return new THREE.Mesh(geometry, material);
    }

    extractColor(prompt) {
        const colorMap = {
            'red': 0xFF4444,
            'blue': 0x4444FF,
            'green': 0x44FF44,
            'yellow': 0xFFFF44,
            'orange': 0xFF8844,
            'purple': 0xFF44FF,
            'pink': 0xFF88FF,
            'white': 0xFFFFFF,
            'black': 0x444444,
            'gray': 0x888888,
            'grey': 0x888888,
            'brown': 0x8B4513,
            'gold': 0xFFD700,
            'silver': 0xC0C0C0
        };
        
        const words = prompt.toLowerCase().split(' ');
        for (const word of words) {
            if (colorMap[word]) {
                return colorMap[word];
            }
        }
        return null;
    }
}

// Make it globally available
window.SimpleAIIntegration = SimpleAIIntegration;
