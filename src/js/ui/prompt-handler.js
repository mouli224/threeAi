export function handlePrompt(input) {
    const parsedData = parsePrompt(input);
    if (parsedData) {
        const geometryGenerator = new GeometryGenerator();
        const geometry = geometryGenerator.generateGeometry(parsedData);
        // Assuming there's a function to add geometry to the scene
        addGeometryToScene(geometry);
    } else {
        console.error("Invalid prompt. Please try again.");
    }
}