export function formatColor(color) {
    if (typeof color === 'string') {
        return color.startsWith('#') ? color : `#${color}`;
    }
    return '#000000'; // Default to black if color is not valid
}

export function manageState(state, action) {
    switch (action.type) {
        case 'SET':
            return { ...state, ...action.payload };
        case 'RESET':
            return {};
        default:
            return state;
    }
}

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}