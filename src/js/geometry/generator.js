class GeometryGenerator {
    constructor() {
        this.shapes = {
            cube: this.createCube,
            sphere: this.createSphere,
            plane: this.createPlane
        };
    }

    generateGeometry(prompt) {
        const shapeType = this.parsePrompt(prompt);
        if (this.shapes[shapeType]) {
            return this.shapes[shapeType]();
        } else {
            throw new Error("Shape not recognized. Please try a different prompt.");
        }
    }

    parsePrompt(prompt) {
        // Simple parsing logic for demonstration purposes
        const shapeKeywords = Object.keys(this.shapes);
        for (const keyword of shapeKeywords) {
            if (prompt.toLowerCase().includes(keyword)) {
                return keyword;
            }
        }
        return null;
    }

    createCube() {
        // Logic to create a cube geometry
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        return new THREE.Mesh(geometry, material);
    }

    createSphere() {
        // Logic to create a sphere geometry
        const geometry = new THREE.SphereGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        return new THREE.Mesh(geometry, material);
    }

    createPlane() {
        // Logic to create a plane geometry
        const geometry = new THREE.PlaneGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        return new THREE.Mesh(geometry, material);
    }
}

export default GeometryGenerator;