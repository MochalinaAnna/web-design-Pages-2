import Game from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // ========== КНОПКИ УПРАВЛЕНИЯ ==========
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

    // ========== ПАУЗА ПО ESC ==========
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

    // ========== ПОДГОНКА РАЗМЕРА КАНВАСА ==========
    function resizeCanvas() {
        const wrapper = document.querySelector('.game-wrapper');
        const rect = wrapper.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});