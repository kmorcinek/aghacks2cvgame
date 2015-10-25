PIXI.Sprite.prototype.invertVX = function () {
    // forget how to do self=this better 
    this.vx = -this.vx;
}

PIXI.Sprite.prototype.invertVY = function () {
    this.vy = -this.vy;
}

PIXI.Sprite.prototype.move = function () {
    this.x += this.vx;
    this.y += this.vy;
}

PIXI.Sprite.prototype.TryChangeDirection= function (sizeX, sizeY) {
    if (this.x + this.width >= sizeX) {
        this.invertVX();
    }

    if (this.x <= 0) {
        this.invertVX();
    }

    if (this.y + this.height >= sizeY) {
        this.invertVY();
    }

    if (this.y <= 0) {
        this.invertVY();
    }
}

