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
