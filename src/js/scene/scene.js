class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.objects = [];
    }

    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
    }

    removeObject(object) {
        this.scene.remove(object);
        this.objects = this.objects.filter(obj => obj !== object);
    }

    clearScene() {
        this.objects.forEach(object => {
            this.scene.remove(object);
        });
        this.objects = [];
    }

    getScene() {
        return this.scene;
    }
}

export default SceneManager;