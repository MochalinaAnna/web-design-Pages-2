export default class Player {
    constructor(x, y, input) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 50;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3.5;        // Было 5 → стало 3.5 (медленнее)
        this.jumpForce = -10;    // Было -12 → стало -10 (ниже прыжок)
        this.gravity = 0.5;      // Было 0.65 → стало 0.5 (мягче падение)
        this.friction = 0.85;    // Было 0.82 → стало 0.85 (плавнее остановка)
        this.isOnGround = false;
        this.input = input;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.facingRight = true;
        this.animationTimer = 0;
    }

    update(platforms, worldWidth, worldHeight) {
        // Горизонтальное движение
        if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('KeyA')) {
            this.vx = -this.speed;
            this.facingRight = false;
        } else if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('KeyD')) {
            this.vx = this.speed;
            this.facingRight = true;
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Прыжок
        if ((this.input.isKeyDown('Space') || this.input.isKeyDown('KeyW')) && this.isOnGround) {
            this.vy = this.jumpForce;
            this.isOnGround = false;
        }

        // Гравитация
        this.vy += this.gravity;
        if (this.vy > 12) this.vy = 12; // Было 15 → 12

        // Перемещение по X
        this.x += this.vx;
        this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));

        // Коллизии по X
        platforms.forEach(platform => {
            if (this.rectCollision(platform)) {
                if (this.vx > 0) {
                    this.x = platform.x - this.width;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                }
                this.vx = 0;
            }
        });

        // Перемещение по Y
        this.y += this.vy;
        this.isOnGround = false;

        // Коллизии по Y
        platforms.forEach(platform => {
            if (this.rectCollision(platform)) {
                if (this.vy > 0) {
                    this.y = platform.y - this.height;
                    this.isOnGround = true;
                } else if (this.vy < 0) {
                    this.y = platform.y + platform.height;
                }
                this.vy = 0;
            }
        });

        // Анимация
        this.animationTimer += 0.15;
        if (this.invulnerable) {
            this.invulnerableTimer++;
        }
    }

    rectCollision(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }

    collidesWith(obj) {
        const margin = 8;
        return (
            this.x + margin < obj.x + obj.width &&
            this.x + this.width - margin > obj.x &&
            this.y + margin < obj.y + obj.height &&
            this.y + this.height - margin > obj.y
        );
    }

    draw(ctx) {
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Свечение
        ctx.shadowColor = '#4fc3f7';
        ctx.shadowBlur = 10;

        // Тело (фартук бариста)
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(-14, -10, 28, 35);
        
        // Фартук
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, 5, 20, 20);
        
        // Лямки фартука
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.lineTo(-4, 5);
        ctx.moveTo(8, -5);
        ctx.lineTo(4, 5);
        ctx.stroke();

        // Голова
        ctx.fillStyle = '#ffccaa';
        ctx.beginPath();
        ctx.arc(0, -15, 12, 0, Math.PI * 2);
        ctx.fill();

        // Шапочка бариста
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-14, -28, 28, 10);
        ctx.fillRect(-10, -32, 20, 6);

        // Глаза
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(4, -17, 2.5, 0, Math.PI * 2);
        ctx.arc(-4, -17, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Блик в глазах
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(5, -18, 1, 0, Math.PI * 2);
        ctx.arc(-3, -18, 1, 0, Math.PI * 2);
        ctx.fill();

        // Улыбка
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -12, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Ноги
        ctx.fillStyle = '#1a1a1a';
        const legOffset = this.isOnGround ? Math.sin(this.animationTimer) * 3 : 0;
        ctx.fillRect(-8, 25, 8, 10 + legOffset);
        ctx.fillRect(0, 25, 8, 10 - legOffset);

        // Кофейная чашка в руке
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(18, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Пар от чашки
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(18, -8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(22, -12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}