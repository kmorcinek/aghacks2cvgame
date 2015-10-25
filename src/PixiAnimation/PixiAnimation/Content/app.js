//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

// Size of canvas
var sizeX = 512 * 2;
var sizeY = 512;

var stage = new Container(),
    renderer = autoDetectRenderer(sizeX, sizeY, {"transparent":true});
document.body.appendChild(renderer.view);

$(function() {
    loader
        .add("images/blob.png")
        .add("images/door.png")
        .add("images/wolf.png")
        .add("images/cannon.png")
        .load(setup);

    function refresh() {
        setInterval(function () { refreshMarkers(); }, 3000);
    }

    refresh();
});

var pictureRefreshCounter = 0;

var globalTexture;

function addNewImage() {
    pictureRefreshCounter++;

    var radnomImage = "http://178.62.103.235/zdjecie?game_name=" + Constants.gameName + "&pic=" + pictureRefreshCounter;

    document.body.style.backgroundImage = "url('" + radnomImage + "')";
}

//Define any variables that are used in more than one function
var ball;
var door;
var obstacle;
var cannon;

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

    var calculateMiddle = function(corners) {
        var sumX = 0, sumY = 0;

        for (var i = 0; i < 4; i++) {
            sumX += corners[i].x;
            sumY += corners[i].y;
        }

        return { "x": sumX / 4, "y": sumY / 4 };
    }

    var url = "http://178.62.103.235/detector?game_name=" + Constants.gameName;
    //var url = "data/markers.json";
    $.getJSON(url, function (list) {
        addNewImage();

        var marker = _.findWhere(list, { "id": "64" });
        var secondMarker = _.findWhere(list, { "id": "908" });

        var firstMiddle = calculateMiddle(marker.positions);
        var secondMiddle = calculateMiddle(secondMarker.positions);

        if (marker) {
            var positions = marker.positions;
            var point = positions[0];
            point.x = parseInt(point.x);
            point.y = parseInt(point.y);
            trimToFitVenue(point);

            console.log(point);

            var deltaX = firstMiddle.x - secondMiddle.x;
            var deltaY = firstMiddle.y - secondMiddle.y;

            ball.x = firstMiddle.x;
            ball.y = firstMiddle.y;

            cannon.x = secondMiddle.x;
            cannon.y = secondMiddle.y;

            var speedRatio = 0.02;
            ball.vx = deltaX * speedRatio;
            ball.vy = deltaY * speedRatio;
        } else {
            console.log("marker not found");
        }
    });
}

function setup() {
    ball = new Sprite(resources["images/blob.png"].texture);
    ball.x = 96;
    ball.y = 66;
    
    // initial speed
    ball.vx = 0;
    ball.vy = 0;

    stage.addChild(ball);

    door = new Sprite(resources["images/door.png"].texture);
    door.x = sizeX - 50;
    door.y = sizeY - 50;
    stage.addChild(door);

    cannon = new Sprite(resources["images/cannon.png"].texture);
    cannon.x = 0;
    cannon.y = 0;
    stage.addChild(cannon);

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

function gameLoop() {

    //Loop this function 60 times per second
    requestAnimationFrame(gameLoop);

    ball.move();

    //changeDirectionCausedByObstacle(cat, obstacle);
    // Obstacle must be resolved first
    ball.TryChangeDirection(sizeX, sizeY);

    var boom = hitTestRectangle(ball, door);
    if (boom) {
        alert("boom");

        ball.invertVX();
        ball.invertVY();
    }
    //Render the stage
    renderer.render(stage);
}
