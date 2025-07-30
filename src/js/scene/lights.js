function setupLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Bright white light
    directionalLight.position.set(5, 10, 7.5); // Position the light
    scene.add(directionalLight);
} 

export { setupLights };