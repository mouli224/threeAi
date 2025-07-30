export function createCube(color) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}

export function createSphere(color) {
    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}

export function createPlane(color) {
    const geometry = new THREE.PlaneGeometry();
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}