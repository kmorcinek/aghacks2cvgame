//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

//Create a Pixi stage and renderer and add the
//renderer.view to the DOM
var size = 256 * 2;
var stage = new Container(),
    renderer = autoDetectRenderer(size, size);
document.body.appendChild(renderer.view);

loader
  .add("images/cat.png")
  .add("images/door.png")
  .add("images/wolf.png")
  .load(setup);

//Define any variables that are used in more than one function
var cat;
var door;
var obstacle;

function setup() {

    //Create the `cat` sprite
    cat = new Sprite(resources["images/cat.png"].texture);
    cat.x = 96;
    cat.y = 66;
    cat.vx = 3;
    cat.vy = 5;

    Sprite.prototype.invertVX = function () {
        // forget how to do self=this better 
        this.vx = -this.vx;
    }

    Sprite.prototype.invertVY = function () {
        this.vy = -this.vy;
    }

    Sprite.prototype.move = function () {
        this.x += this.vx;
        this.y += this.vy;
    }

    stage.addChild(cat);

    door = new Sprite(resources["images/door.png"].texture);
    door.y = size - 50;
    door.x = size - 50;
    stage.addChild(door);

    obstacle = new Sprite(resources["images/wolf.png"].texture);
    obstacle.y = size - 140;
    obstacle.x = size - 170;
    stage.addChild(obstacle);

    //Start the game loop
    gameLoop();
    //testObstacleCollistion();
}

function cloneMovingObjectProperties(object) {
    return {
        x: object.x,
        y: object.y,
        vx: object.vx,
        vy: object.vy,
        width: object.width,
        height: object.height
    };
}

function changeDirectionCausedByObstacle(point, obstacle) {
    var isHit = hitTestRectangle(point, obstacle);

    if (!isHit) {
        return;
    }

    // try if going back will cause to not to be overlapping
    var clone = cloneMovingObjectProperties(point);
    clone.x -= clone.vx;
    if (hitTestRectangle(clone, object)) {
        // not overlapping anymore to so in x axis we go back 
        point.invertVX();
    } else {
        point.invertVY();
    }
}

function changeDirection(point) {
    if (point.x + point.width >= size) {
        point.invertVX();
    }

    if (point.x <= 0) {
        point.invertVX();
    }

    if (point.y + point.height >= size) {
        point.invertVY();
    }

    if (point.y <= 0) {
        point.invertVY();
    }
}

function gameLoop() {

    //Loop this function 60 times per second
    requestAnimationFrame(gameLoop);

    cat.move();

    changeDirectionCausedByObstacle(cat, obstacle);
    // Obstacle must be resolved first
    changeDirection(cat);

    var boom = hitTestRectangle(cat, door);
    if (boom) {
        alert("boom");

        cat.invertVX();
        cat.invertVY();
    }
    //Render the stage
    renderer.render(stage);
}

function assert(value) {
    if (!value) {
        alert("bug in test");
    }
}

function testObstacleCollistion() {
    var object = new Sprite(resources["images/door.png"].texture);
    object.x = 0;
    object.y = 0;
    object.width = 10;
    object.height = 10;

    var obstacle = new Sprite(resources["images/wolf.png"].texture);
    object.x = 15;
    object.y = 0;
    object.width = 10;
    object.height = 10;

    object.move();
    assert(hitTestRectangle(object, obstacle));
}