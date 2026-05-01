import Game from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const wrapper = document.querySelector('.game-wrapper');

    // ===== ВАЖНО: сначала задаём размеры Canvas =====
    function resizeCanvas() {
        const rect = wrapper.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    // Вызываем сразу
    resizeCanvas();
    
    // Создаём игру ПОСЛЕ установки размеров
    const game = new Game(canvas);

    window.addEventListener('resize', () => {
        resizeCanvas();
        // Обновляем worldHeight в игре при ресайзе
        game.worldHeight = canvas.height;
    });

    // ========== КНОПКИ ==========
    document.getElementById('startBtn').addEventListener('click', () => {
        document.getElementById('startScreen').classList.add('hidden');
        game.start();
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
        document.getElementById('pauseScreen').classList.add('hidden');
        game.resume();
    });

    document.getElementById('restartFromPauseBtn').addEventListener('click', () => {
        document.getElementById('pauseScreen').classList.add('hidden');
        game.restart();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
        document.getElementById('gameOverScreen').classList.add('hidden');
        game.restart();
    });

    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.getElementById('winScreen').classList.add('hidden');
        game.restart();
    });

    // Пауза по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && game.isRunning) {
            if (game.isPaused) {
                document.getElementById('pauseScreen').classList.add('hidden');
                game.resume();
            } else {
                document.getElementById('pauseScreen').classList.remove('hidden');
                game.pause();
            }
        }
    });
});