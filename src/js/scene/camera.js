class CameraController {
    constructor(scene) {
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        this.controls = new THREE.OrbitControls(this.camera, document.body);
    }

    update() {
        this.controls.update();
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    getCamera() {
        return this.camera;
    }
}

export default CameraController;