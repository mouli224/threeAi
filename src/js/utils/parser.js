function parsePrompt(prompt) {
    const geometryTypes = ['cube', 'sphere', 'plane'];
    const parameters = {};

    // Normalize the prompt to lowercase for easier matching
    const normalizedPrompt = prompt.toLowerCase();

    // Check for geometry type
    geometryTypes.forEach(type => {
        if (normalizedPrompt.includes(type)) {
            parameters.type = type;
        }
    });

    // Extract color if mentioned
    const colorMatch = normalizedPrompt.match(/(red|green|blue|yellow|purple|orange|black|white|grey|gray)/);
    if (colorMatch) {
        parameters.color = colorMatch[0];
    }

    // Return the parsed parameters
    return parameters;
}

export { parsePrompt };