import Player from './Player.js';
import Platform from './Platform.js';
import Collectible from './Collectible.js';
import Enemy from './Enemy.js';
import Particle from './Particle.js';
import InputHandler from './InputHandler.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputHandler();
        
        // Размеры игрового мира
        this.worldWidth = 3200;
        this.worldHeight = canvas.height || 500;
        
        // Камера
        this.camera = { x: 0, y: 0 };
        
        // Состояние игры
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.totalBeans = 0;
        this.collectedBeans = 0;
        this.level = 1;

        // Игровые объекты
        this.player = null;
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.particles = [];
        
        // Цветовая схема уровня
        this.colors = {
            bg: '#0a0a1a',
            platform: '#2a1a3a',
            platformBorder: '#4fc3f7',
            bean: '#ffd93d',
            beanGlow: '#ff8c00',
            enemy: '#f06292',
            enemyGlow: '#ff1744',
            player: '#ffffff',
            playerGlow: '#4fc3f7',
        };
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.collectedBeans = 0;
        this.particles = [];
        
        this.updateUI();
        this.generateLevel();
        this.gameLoop();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.gameLoop();
    }

    restart() {
        this.start();
    }

    generateLevel() {
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        
        // Генерируем платформы
        this.generatePlatforms();
        
        // Создаём игрока на первой платформе
        const startPlatform = this.platforms[0];
        this.player = new Player(
            startPlatform.x + startPlatform.width / 2,
            startPlatform.y - 60,
            this.input
        );
        
        // Генерируем зёрна и врагов
        this.generateCollectibles();
        this.generateEnemies();
        
        this.totalBeans = this.collectibles.length;
        document.getElementById('score').textContent = '0';
    }

    generatePlatforms() {
        const h = this.worldHeight;
        const w = this.worldWidth;
        
        // Стартовая платформа
        this.platforms.push(new Platform(50, h - 100, 200, 20, this.colors));
        
        // Генерируем платформы процедурно
        let lastX = 200;
        let lastY = h - 100;
        
        for (let i = 0; i < 25; i++) {
            const width = 80 + Math.random() * 150;
            const gapX = 100 + Math.random() * 180;
            const gapY = (Math.random() - 0.3) * 150;
            
            let newX = lastX + gapX;
            let newY = Math.max(60, Math.min(h - 40, lastY + gapY));
            
            // Не даём платформам уйти слишком высоко или низко
            if (newY < 80) newY = 80 + Math.random() * 60;
            if (newY > h - 60) newY = h - 100 - Math.random() * 40;
            
            this.platforms.push(new Platform(newX, newY, width, 18, this.colors));
            
            lastX = newX + width;
            lastY = newY;
        }
        
        // Финальная платформа
        this.platforms.push(new Platform(lastX + 100, h - 100, 200, 20, this.colors));
    }

    generateCollectibles() {
        this.platforms.forEach((platform, index) => {
            // Пропускаем первую и последнюю платформу
            if (index === 0 || index === this.platforms.length - 1) return;
            
            // 70% шанс появления зерна на платформе
            if (Math.random() < 0.7) {
                const x = platform.x + platform.width / 2 + (Math.random() - 0.5) * platform.width * 0.6;
                const y = platform.y - 25;
                this.collectibles.push(new Collectible(x, y));
            }
            
            // Иногда два зерна
            if (Math.random() < 0.25) {
                const x2 = platform.x + platform.width / 3 + Math.random() * platform.width * 0.4;
                const y2 = platform.y - 25;
                this.collectibles.push(new Collectible(x2, y2));
            }
        });
    }

    generateEnemies() {
        this.platforms.forEach((platform, index) => {
            if (index < 2 || index === this.platforms.length - 1) return;
            
            // 25% шанс появления врага
            if (Math.random() < 0.25) {
                const x = platform.x + platform.width / 2;
                const y = platform.y - 40;
                this.enemies.push(new Enemy(x, y, platform, this.colors));
            }
        });
    }

    update() {
        if (!this.isRunning || this.isPaused) return;
        
        // Обновляем игрока
        this.player.update(this.platforms, this.worldWidth, this.worldHeight);
        
        // Камера следует за игроком
        this.camera.x = this.player.x - this.canvas.width / 3;
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
        
        // Проверка падения
        if (this.player.y > this.worldHeight + 100) {
            this.loseLife();
            return;
        }
        
        // Обновляем врагов
        this.enemies.forEach(enemy => enemy.update());
        
        // Обновляем частицы
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Проверка сбора зёрен
        this.collectibles.forEach(bean => {
            if (!bean.collected && this.player.collidesWith(bean)) {
                bean.collected = true;
                this.score += 100;
                this.collectedBeans++;
                this.spawnParticles(bean.x, bean.y, this.colors.bean, 8);
                this.updateUI();
            }
        });
        
        // Проверка столкновения с врагами
        this.enemies.forEach(enemy => {
            if (this.player.collidesWith(enemy) && !this.player.invulnerable) {
                this.loseLife();
            }
        });
        
        // Проверка победы
        if (this.collectedBeans >= this.totalBeans) {
            this.win();
        }
        
        // Проверка достижения конца уровня
        if (this.player.x > this.worldWidth - 100) {
            this.score += 500;
            this.win();
        }
    }

    render() {
        const ctx = this.ctx;
        const cam = this.camera;
        
        // Очистка
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Дальние звёзды (медленный параллакс)
        this.drawStars(cam.x * 0.3);
        
        ctx.save();
        ctx.translate(-cam.x, 0);
        
        // Платформы
        this.platforms.forEach(platform => {
            if (this.isVisible(platform)) {
                platform.draw(ctx);
            }
        });
        
        // Зёрна
        this.collectibles.forEach(bean => {
            if (!bean.collected && this.isVisible(bean)) {
                bean.draw(ctx);
            }
        });
        
        // Враги
        this.enemies.forEach(enemy => {
            if (this.isVisible(enemy)) {
                enemy.draw(ctx);
            }
        });
        
        // Частицы
        this.particles.forEach(p => p.draw(ctx));
        
        // Игрок
        this.player.draw(ctx);
        
        ctx.restore();
        
        // Ближние звёзды (быстрый параллакс)
        this.drawStars(cam.x * 0.6);
    }

    drawStars(offset) {
        // Упрощённый параллакс звёзд (основные в CSS)
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        const seed = Math.floor(offset / 100);
        
        for (let i = 0; i < 20; i++) {
            const x = ((i * 137 + seed * 53) % this.canvas.width);
            const y = ((i * 97 + seed * 31) % this.canvas.height);
            const size = (i % 3 === 0) ? 1.5 : 0.8;
            ctx.fillRect(x, y, size, size);
        }
    }

    isVisible(obj) {
        return obj.x + obj.width > this.camera.x - 50 &&
               obj.x < this.camera.x + this.canvas.width + 50;
    }

    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Респаун игрока
            this.spawnParticles(this.player.x, this.player.y, this.colors.enemy, 12);
            const safePlatform = this.platforms[0];
            this.player.x = safePlatform.x + safePlatform.width / 2;
            this.player.y = safePlatform.y - 60;
            this.player.vy = 0;
            this.player.invulnerable = true;
            setTimeout(() => { this.player.invulnerable = false; }, 1500);
        }
    }

    gameOver() {
        this.isRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    win() {
        this.isRunning = false;
        document.getElementById('winScore').textContent = this.score;
        document.getElementById('winScreen').classList.remove('hidden');
        
        // Сохраняем рекорд
        const best = localStorage.getItem('cosmicBaristaBest') || 0;
        if (this.score > best) {
            localStorage.setItem('cosmicBaristaBest', this.score);
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        const hearts = '❤️'.repeat(Math.max(0, this.lives));
        const broken = '🖤'.repeat(Math.max(0, 3 - this.lives));
        document.getElementById('lives').textContent = hearts + broken;
    }

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}