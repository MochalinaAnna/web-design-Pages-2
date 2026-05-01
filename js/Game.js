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
            startPlatform.y - 50,
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
        
        // === ВАЖНОЕ ИСПРАВЛЕНИЕ: платформы в нижней половине экрана ===
        
        // Стартовая платформа — внизу по центру левой части
        this.platforms.push(new Platform(50, h - 80, 180, 20, this.colors));
        
        let lastX = 230;
        let lastY = h - 80;
        
        // Генерируем платформы лесенкой, с небольшими перепадами высоты
        for (let i = 0; i < 22; i++) {
            const width = 80 + Math.random() * 140;
            const gapX = 90 + Math.random() * 150;
            
            // Перепад высоты: от -60 до +40 пикселей (небольшие шаги)
            const gapY = (Math.random() - 0.4) * 80;
            
            let newX = lastX + gapX;
            let newY = lastY + gapY;
            
            // === ЖЁСТКИЕ ОГРАНИЧЕНИЯ: платформы только в нижних 65% экрана ===
            const minY = h * 0.35; // верхняя граница — 35% от высоты
            const maxY = h - 50;    // нижняя граница
            
            if (newY < minY) newY = minY + Math.random() * 20;
            if (newY > maxY) newY = maxY - Math.random() * 20;
            
            this.platforms.push(new Platform(newX, newY, width, 18, this.colors));
            
            lastX = newX + width;
            lastY = newY;
        }
        
        // Финальная платформа — тоже внизу
        this.platforms.push(new Platform(lastX + 100, h - 80, 200, 20, this.colors));
    }

    generateCollectibles() {
        this.platforms.forEach((platform, index) => {
            if (index === 0 || index === this.platforms.length - 1) return;
            
            if (Math.random() < 0.7) {
                const x = platform.x + platform.width / 2 + (Math.random() - 0.5) * platform.width * 0.5;
                const y = platform.y - 25;
                this.collectibles.push(new Collectible(x, y));
            }
            
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
            
            if (Math.random() < 0.25) {
                const x = platform.x + platform.width / 2;
                const y = platform.y - 40;
                this.enemies.push(new Enemy(x, y, platform, this.colors));
            }
        });
    }

    update() {
        if (!this.isRunning || this.isPaused) return;
        
        this.player.update(this.platforms, this.worldWidth, this.worldHeight);
        
        this.camera.x = this.player.x - this.canvas.width / 3;
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
        
        if (this.player.y > this.worldHeight + 100) {
            this.loseLife();
            return;
        }
        
        this.enemies.forEach(enemy => enemy.update());
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);
        
        this.collectibles.forEach(bean => {
            if (!bean.collected && this.player.collidesWith(bean)) {
                bean.collected = true;
                this.score += 100;
                this.collectedBeans++;
                this.spawnParticles(bean.x, bean.y, this.colors.bean, 8);
                this.updateUI();
            }
        });
        
        this.enemies.forEach(enemy => {
            if (this.player.collidesWith(enemy) && !this.player.invulnerable) {
                this.loseLife();
            }
        });
        
        if (this.collectedBeans >= this.totalBeans) {
            this.win();
        }
        
        if (this.player.x > this.worldWidth - 100) {
            this.score += 500;
            this.win();
        }
    }

    render() {
        const ctx = this.ctx;
        const cam = this.camera;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawStars(cam.x * 0.3);
        
        ctx.save();
        ctx.translate(-cam.x, 0);
        
        this.platforms.forEach(platform => {
            if (this.isVisible(platform)) {
                platform.draw(ctx);
            }
        });
        
        this.collectibles.forEach(bean => {
            if (!bean.collected && this.isVisible(bean)) {
                bean.draw(ctx);
            }
        });
        
        this.enemies.forEach(enemy => {
            if (this.isVisible(enemy)) {
                enemy.draw(ctx);
            }
        });
        
        this.particles.forEach(p => p.draw(ctx));
        this.player.draw(ctx);
        
        ctx.restore();
        
        this.drawStars(cam.x * 0.6);
    }

    drawStars(offset) {
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
            this.spawnParticles(this.player.x, this.player.y, this.colors.enemy, 12);
            const safePlatform = this.platforms[0];
            this.player.x = safePlatform.x + safePlatform.width / 2;
            this.player.y = safePlatform.y - 50;
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