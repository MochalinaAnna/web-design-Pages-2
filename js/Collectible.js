export default class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.animationOffset = Math.random() * Math.PI * 2;
        this.animationTimer = 0;
    }

    update() {
        this.animationTimer += 0.04;
    }

    draw(ctx) {
        if (this.collected) return;
        
        this.update();
        const floatY = Math.sin(this.animationTimer + this.animationOffset) * 4;
        const drawY = this.y + floatY;
        
        ctx.save();
        ctx.translate(this.x, drawY);
        
        // Свечение
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 12;
        
        // Зерно
        ctx.fillStyle = '#6b3a2a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Светлая полоска
        ctx.fillStyle = '#8b5a3a';
        ctx.beginPath();
        ctx.ellipse(-2, 0, 3, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-2, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}