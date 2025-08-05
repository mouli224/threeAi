/**
 * Background Library for ThreeAI
 * Manages environment backgrounds and lighting setups
 */

class BackgroundLibrary {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.currentBackground = null;
        this.environmentKeywords = this.initializeKeywords();
        
        console.log('🌄 Background Library initialized');
    }

    initializeKeywords() {
        return {
            sky: ['sky', 'cloud', 'clouds', 'air', 'atmosphere', 'blue', 'flying'],
            forest: ['forest', 'tree', 'trees', 'wood', 'nature', 'green', 'jungle'],
            desert: ['desert', 'sand', 'dunes', 'hot', 'dry', 'yellow', 'sahara'],
            ocean: ['ocean', 'sea', 'water', 'beach', 'waves', 'blue', 'underwater'],
            mountain: ['mountain', 'mountains', 'peak', 'snow', 'alps', 'rocky', 'cliff'],
            city: ['city', 'urban', 'building', 'skyscraper', 'street', 'downtown', 'metropolis'],
            space: ['space', 'stars', 'galaxy', 'universe', 'cosmic', 'planets', 'nebula'],
            sunset: ['sunset', 'sunrise', 'dawn', 'dusk', 'orange', 'golden', 'evening'],
            garden: ['garden', 'flowers', 'park', 'grass', 'meadow', 'field', 'lawn'],
            cave: ['cave', 'underground', 'dark', 'stone', 'tunnel', 'rocky'],
            fire: ['fire', 'flames', 'lava', 'volcano', 'burning', 'hot', 'red'],
            ice: ['ice', 'snow', 'frozen', 'cold', 'winter', 'glacier', 'arctic']
        };
    }

    /**
     * Analyze prompt and set appropriate background
     */
    setBackgroundFromPrompt(prompt) {
        const words = prompt.toLowerCase().split(' ');
        console.log('🔍 Analyzing prompt for background:', prompt);
        
        // Find matching environment
        let bestMatch = 'default';
        let maxMatches = 0;
        
        for (const [environment, keywords] of Object.entries(this.environmentKeywords)) {
            const matches = keywords.filter(keyword => 
                words.some(word => word.includes(keyword) || keyword.includes(word))
            ).length;
            
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = environment;
            }
        }
        
        if (maxMatches > 0) {
            console.log(`✅ Background match found: ${bestMatch} (${maxMatches} matches)`);
            this.setBackground(bestMatch);
        } else {
            console.log('🎯 Using default background');
            this.setBackground('default');
        }
    }

    /**
     * Set specific background environment
     */
    setBackground(environmentType) {
        // Remove existing background
        if (this.currentBackground) {
            this.scene.remove(this.currentBackground);
        }

        // Set background color and fog
        switch (environmentType) {
            case 'sky':
                this.createSkyBackground();
                break;
            case 'forest':
                this.createForestBackground();
                break;
            case 'desert':
                this.createDesertBackground();
                break;
            case 'ocean':
                this.createOceanBackground();
                break;
            case 'mountain':
                this.createMountainBackground();
                break;
            case 'city':
                this.createCityBackground();
                break;
            case 'space':
                this.createSpaceBackground();
                break;
            case 'sunset':
                this.createSunsetBackground();
                break;
            case 'garden':
                this.createGardenBackground();
                break;
            case 'cave':
                this.createCaveBackground();
                break;
            case 'fire':
                this.createFireBackground();
                break;
            case 'ice':
                this.createIceBackground();
                break;
            default:
                this.createDefaultBackground();
        }

        console.log(`🌄 Background set to: ${environmentType}`);
    }

    createSkyBackground() {
        // Sky blue gradient
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);
        
        // Add clouds
        this.addClouds();
    }

    createForestBackground() {
        // Forest green
        this.scene.background = new THREE.Color(0x228B22);
        this.scene.fog = new THREE.Fog(0x228B22, 5, 30);
        
        // Add simple trees in background
        this.addBackgroundTrees();
    }

    createDesertBackground() {
        // Sandy yellow
        this.scene.background = new THREE.Color(0xF4A460);
        this.scene.fog = new THREE.Fog(0xF4A460, 10, 40);
        
        // Add desert elements
        this.addDesertElements();
    }

    createOceanBackground() {
        // Ocean blue
        this.scene.background = new THREE.Color(0x006994);
        this.scene.fog = new THREE.Fog(0x006994, 8, 35);
    }

    createMountainBackground() {
        // Mountain gray-blue
        this.scene.background = new THREE.Color(0x4682B4);
        this.scene.fog = new THREE.Fog(0x4682B4, 15, 60);
        
        // Add mountain silhouettes
        this.addMountainSilhouettes();
    }

    createCityBackground() {
        // Urban gray
        this.scene.background = new THREE.Color(0x696969);
        this.scene.fog = new THREE.Fog(0x696969, 12, 45);
        
        // Add building silhouettes
        this.addBuildingSilhouettes();
    }

    createSpaceBackground() {
        // Deep space black
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = null; // No fog in space
        
        // Add stars
        this.addStars();
    }

    createSunsetBackground() {
        // Sunset orange-pink
        this.scene.background = new THREE.Color(0xFF6347);
        this.scene.fog = new THREE.Fog(0xFF6347, 8, 40);
    }

    createGardenBackground() {
        // Garden green
        this.scene.background = new THREE.Color(0x90EE90);
        this.scene.fog = new THREE.Fog(0x90EE90, 6, 25);
        
        // Add garden elements
        this.addGardenElements();
    }

    createCaveBackground() {
        // Dark cave
        this.scene.background = new THREE.Color(0x2F2F2F);
        this.scene.fog = new THREE.Fog(0x2F2F2F, 3, 15);
    }

    createFireBackground() {
        // Fire red-orange
        this.scene.background = new THREE.Color(0xFF4500);
        this.scene.fog = new THREE.Fog(0xFF4500, 5, 20);
    }

    createIceBackground() {
        // Ice blue-white
        this.scene.background = new THREE.Color(0xB0E0E6);
        this.scene.fog = new THREE.Fog(0xB0E0E6, 10, 45);
    }

    createDefaultBackground() {
        // Default neutral background
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
    }

    // Helper methods for adding background elements
    addClouds() {
        const cloudGroup = new THREE.Group();
        
        for (let i = 0; i < 5; i++) {
            const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 6);
            const cloudMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0.6 
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            cloud.position.set(
                (Math.random() - 0.5) * 50,
                10 + Math.random() * 10,
                (Math.random() - 0.5) * 50
            );
            cloud.scale.set(1, 0.6, 1);
            
            cloudGroup.add(cloud);
        }
        
        this.scene.add(cloudGroup);
        this.currentBackground = cloudGroup;
    }

    addBackgroundTrees() {
        const treeGroup = new THREE.Group();
        
        for (let i = 0; i < 8; i++) {
            // Simple tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 6);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Tree foliage
            const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 6);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 1.2;
            
            trunk.add(foliage);
            trunk.position.set(
                (Math.random() - 0.5) * 30,
                0.5,
                -15 - Math.random() * 15
            );
            
            treeGroup.add(trunk);
        }
        
        this.scene.add(treeGroup);
        this.currentBackground = treeGroup;
    }

    addDesertElements() {
        // Add some sand dunes as simple shapes
        const duneGroup = new THREE.Group();
        
        for (let i = 0; i < 4; i++) {
            const duneGeometry = new THREE.SphereGeometry(3 + Math.random() * 2, 12, 8);
            const duneMaterial = new THREE.MeshLambertMaterial({ color: 0xF4A460 });
            const dune = new THREE.Mesh(duneGeometry, duneMaterial);
            
            dune.position.set(
                (Math.random() - 0.5) * 40,
                -1,
                -20 - Math.random() * 20
            );
            dune.scale.set(1, 0.3, 1);
            
            duneGroup.add(dune);
        }
        
        this.scene.add(duneGroup);
        this.currentBackground = duneGroup;
    }

    addMountainSilhouettes() {
        const mountainGroup = new THREE.Group();
        
        for (let i = 0; i < 6; i++) {
            const mountainGeometry = new THREE.ConeGeometry(
                2 + Math.random() * 3, 
                5 + Math.random() * 5, 
                6
            );
            const mountainMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x708090,
                transparent: true,
                opacity: 0.7
            });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            mountain.position.set(
                (Math.random() - 0.5) * 60,
                mountain.geometry.parameters.height / 2,
                -25 - Math.random() * 25
            );
            
            mountainGroup.add(mountain);
        }
        
        this.scene.add(mountainGroup);
        this.currentBackground = mountainGroup;
    }

    addBuildingSilhouettes() {
        const buildingGroup = new THREE.Group();
        
        for (let i = 0; i < 8; i++) {
            const buildingGeometry = new THREE.BoxGeometry(
                1 + Math.random() * 2,
                3 + Math.random() * 6,
                1 + Math.random() * 2
            );
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x404040,
                transparent: true,
                opacity: 0.8
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (Math.random() - 0.5) * 40,
                building.geometry.parameters.height / 2,
                -20 - Math.random() * 15
            );
            
            buildingGroup.add(building);
        }
        
        this.scene.add(buildingGroup);
        this.currentBackground = buildingGroup;
    }

    addStars() {
        const starGroup = new THREE.Group();
        const starGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        
        for (let i = 0; i < 100; i++) {
            const starMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xffffff : 0xffff88 
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            star.position.set(
                (Math.random() - 0.5) * 100,
                Math.random() * 50 + 10,
                (Math.random() - 0.5) * 100
            );
            
            starGroup.add(star);
        }
        
        this.scene.add(starGroup);
        this.currentBackground = starGroup;
    }

    addGardenElements() {
        const gardenGroup = new THREE.Group();
        
        // Add simple flowers
        for (let i = 0; i < 10; i++) {
            const flowerGeometry = new THREE.SphereGeometry(0.1, 6, 4);
            const flowerMaterial = new THREE.MeshLambertMaterial({ 
                color: [0xFF69B4, 0xFF0000, 0xFFFF00, 0xFF6347][Math.floor(Math.random() * 4)]
            });
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            
            flower.position.set(
                (Math.random() - 0.5) * 20,
                0.1,
                (Math.random() - 0.5) * 20
            );
            
            gardenGroup.add(flower);
        }
        
        this.scene.add(gardenGroup);
        this.currentBackground = gardenGroup;
    }

    /**
     * Clear current background
     */
    clearBackground() {
        if (this.currentBackground) {
            this.scene.remove(this.currentBackground);
            this.currentBackground = null;
        }
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
    }

    /**
     * Get available background types
     */
    getAvailableBackgrounds() {
        return Object.keys(this.environmentKeywords).concat(['default']);
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundLibrary;
} else if (typeof window !== 'undefined') {
    window.BackgroundLibrary = BackgroundLibrary;
}
