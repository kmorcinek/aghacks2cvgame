//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

var sizeX = 512 * 2;
var sizeY = 512;
var stage = new Container(),
    renderer = autoDetectRenderer(sizeX, sizeY);
document.body.appendChild(renderer.view);

$(function() {
    loader
        .add("images/cat.png")
        .add("images/door.png")
        .add("images/wolf.png")
        .load(setup);

    function myFunction() {
        setInterval(function () { refreshMarkers(); }, 3000);
    }

    myFunction();
});

var pictureRefreshCounter = 0;

var globalTexture;

function addNewImage() {
    pictureRefreshCounter++;

    var radnomImage = "http://178.62.103.235/zdjecie?game_name=" + Constants.gameName + "&pic=" + pictureRefreshCounter;

    if (globalTexture) {
        globalTexture.destroy(true);
    }

    globalTexture = PIXI.Texture.fromImage(radnomImage);
    obstacle = new PIXI.Sprite(globalTexture);
    obstacle.x = 0;
    obstacle.y = 0;
    stage.addChild(obstacle);
    
    ////Add text as a child of the Sprite
    //var text = new PIXI.Text('my custom text',
    //    {
    //        font: '12px Arial',
    //        fill: 0x666666,
    //        align: 'center',
    //        cacheAsBitmap: true, // for better performance
    //        height: 57,
    //        width: 82
    //    });
    //sprite.addChild(text);
}

//Define any variables that are used in more than one function
var cat;
var door;
var obstacle;

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

function refreshMarkers() {
    var trimToFitVenue = function(pointValue) {
        var fitValueX = sizeX - 200;
        if (pointValue.x > fitValueX) {
            pointValue.x = fitValueX;
        }

        var fitValueY = sizeY - 200;
        if (pointValue.y > fitValueY) {
            pointValue.y = fitValueY;
        }
    }

    var url = "http://178.62.103.235/detector?game_name=" + Constants.gameName;
    //var url = "data/markers.json";
    $.getJSON(url, function (list) {
        var marker = _.findWhere(list, { "id": "64" });

        //addNewImage();

        if (marker) {
            var positions = marker.positions;
            var point = positions[0];
            point.x = parseInt(point.x);
            point.y = parseInt(point.y);
            trimToFitVenue(point);

            console.log(point);

            var firstPoint = positions[0];
            var secondPoint = positions[1];

            var deltaX = firstPoint.x = secondPoint.x;
            var deltaY = firstPoint.y = secondPoint.y;

            cat.x = point.x;
            cat.y = point.y;

            var speedRatio = 0.01;
            cat.vx = deltaX * speedRatio;
            cat.vy = deltaY * speedRatio;
        } else {
            console.log("marker not found");
        }
    });
}

function setup() {
    cat = new Sprite(resources["images/cat.png"].texture);
    cat.x = 96;
    cat.y = 66;
    
    // initial speed
    cat.vx = 2;
    cat.vy = 3;

    stage.addChild(cat);

    door = new Sprite(resources["images/door.png"].texture);
    door.x = sizeX - 50;
    door.y = sizeY - 50;
    stage.addChild(door);

    gameLoop();
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
    if (point.x + point.width >= sizeX) {
        point.invertVX();
    }

    if (point.x <= 0) {
        point.invertVX();
    }

    if (point.y + point.height >= sizeY) {
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

    //changeDirectionCausedByObstacle(cat, obstacle);
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