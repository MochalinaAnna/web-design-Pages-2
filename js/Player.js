export default class Player {
    constructor(x, y, input) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 46;
        this.vx = 0;
        this.vy = 0;
        
        // ===== НАСТРОЙКИ ДВИЖЕНИЯ =====
        this.speed = 2.6;           // спокойный бег
        this.jumpForce = -7;      // начальная скорость прыжка
        this.gravity = 0.2;       // МЕДЛЕННАЯ гравитация → дальний прыжок
        this.friction = 0.8;     // плавное скольжение
        
        this.isOnGround = false;
        this.input = input;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.facingRight = true;
        this.animationTimer = 0;
        
        // Чтобы нельзя было бесконечно прыгать
        this.canJump = true;
        this.jumpCooldown = 0;
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
            if (Math.abs(this.vx) < 0.05) this.vx = 0;
        }

        // Прыжок (с защитой от двойного срабатывания)
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }
        
        if ((this.input.isKeyDown('Space') || this.input.isKeyDown('KeyW')) && this.isOnGround && this.canJump && this.jumpCooldown <= 0) {
            this.vy = this.jumpForce;
            this.isOnGround = false;
            this.canJump = false;
            this.jumpCooldown = 8; // небольшая задержка перед следующим прыжком
        }
        
        // Сброс canJump когда клавиша отпущена
        if (!this.input.isKeyDown('Space') && !this.input.isKeyDown('KeyW')) {
            this.canJump = true;
        }

        // Гравитация (медленная — прыжок получается дальним и плавным)
        this.vy += this.gravity;
        if (this.vy > 10) this.vy = 10; // ограничение падения

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
                    // Приземление сверху
                    this.y = platform.y - this.height;
                    this.isOnGround = true;
                    this.canJump = true;
                } else if (this.vy < 0) {
                    // Удар головой
                    this.y = platform.y + platform.height;
                }
                this.vy = 0;
            }
        });

        this.animationTimer += 0.15;
        if (this.invulnerable) {
            this.invulnerableTimer++;
        }
    }

    rectCollision(obj) {
        const margin = 2;
        return (
            this.x + margin < obj.x + obj.width &&
            this.x + this.width - margin > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }

    collidesWith(obj) {
        const margin = 10;
        return (
            this.x + margin < obj.x + obj.width &&
            this.x + this.width - margin > obj.x &&
            this.y + margin < obj.y + obj.height &&
            this.y + this.height - margin > obj.y
        );
    }

    draw(ctx) {
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 4) % 2 === 0) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        if (!this.facingRight) ctx.scale(-1, 1);

        ctx.shadowColor = '#4fc3f7';
        ctx.shadowBlur = 10;

        // Тело
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(-14, -10, 28, 35);
        
        // Фартук
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, 5, 20, 20);
        
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

        // Шапочка
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-14, -28, 28, 10);
        ctx.fillRect(-10, -32, 20, 6);

        // Глаза
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(4, -17, 2.5, 0, Math.PI * 2);
        ctx.arc(-4, -17, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(5, -18, 1, 0, Math.PI * 2);
        ctx.arc(-3, -18, 1, 0, Math.PI * 2);
        ctx.fill();

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

        // Чашка
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(18, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(18, -8, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}