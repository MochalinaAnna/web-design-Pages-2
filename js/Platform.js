export default class Platform {
    constructor(x, y, width, height, colors) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colors = colors;
    }

    draw(ctx) {
        // Тень
        ctx.shadowColor = this.colors.platformBorder;
        ctx.shadowBlur = 8;
        
        // Основа платформы
        ctx.fillStyle = this.colors.platform;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Обводка
        ctx.strokeStyle = this.colors.platformBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Верхняя грань (свечение)
        ctx.fillStyle = this.colors.platformBorder;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(this.x, this.y, this.width, 3);
        ctx.globalAlpha = 1;
        
        // Декоративные линии
        ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + this.height - 4);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height - 4);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
}