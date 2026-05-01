export default class InputHandler {
    constructor() {
        this.keys = {};
        this.justPressed = {};

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            
            // Предотвращаем прокрутку страницы
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.justPressed[e.code] = false;
        });
    }

    isKeyDown(key) {
        return !!this.keys[key];
    }

    wasJustPressed(key) {
        if (this.justPressed[key]) {
            this.justPressed[key] = false;
            return true;
        }
        return false;
    }
}