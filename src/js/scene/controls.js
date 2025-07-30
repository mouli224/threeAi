class Controls {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.isDragging = false;
        this.previousMousePosition = {
            x: 0,
            y: 0
        };

        this.init();
    }

    init() {
        window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        window.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseMove(event) {
        if (this.isDragging) {
            const deltaMove = {
                x: event.clientX - this.previousMousePosition.x,
                y: event.clientY - this.previousMousePosition.y
            };

            this.camera.rotation.y -= deltaMove.x * 0.005;
            this.camera.rotation.x -= deltaMove.y * 0.005;

            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onMouseWheel(event) {
        this.camera.position.z += event.deltaY * 0.01;
    }
}

export default Controls;