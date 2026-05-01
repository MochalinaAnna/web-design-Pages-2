export default class Enemy {
    constructor(x, y, platform, colors) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.vx = 0.8;          // Было 1.5 → стало 0.8 (медленнее враги)
        this.platform = platform;
        this.colors = colors;
        this.animationTimer = 0;
        this.moveRange = platform.width / 2 - 20;
        this.startX = x;
    }

    update() {
        this.animationTimer += 0.05;
        
        this.x += this.vx;
        if (this.x > this.startX + this.moveRange || this.x < this.startX - this.moveRange) {
            this.vx *= -1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.shadowColor = this.colors.enemyGlow;
        ctx.shadowBlur = 10;

        ctx.fillStyle = this.colors.enemy;
        ctx.beginPath();
        const squash = Math.sin(this.animationTimer) * 2;
        ctx.ellipse(0, 0, 14, 14 + squash, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-4, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -2, 5, 0, Math.PI * 2);
        ctx.arc(5, -2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-5, -1, 2.5, 0, Math.PI * 2);
        ctx.arc(5, -1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -7);
        ctx.lineTo(-2, -5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -7);
        ctx.lineTo(2, -5);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}