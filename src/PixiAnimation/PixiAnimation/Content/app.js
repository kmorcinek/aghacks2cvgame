//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

// Size of canvas
var sizeX = 800;
var sizeY = 600;

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
        setInterval(function () { refreshCallback(); }, Constants.refreshInternal);
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
var target;
var obstacle;
var cannon;

function refreshCallback() {
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
        var marker = _.findWhere(list, { "id": "64" });
        var secondMarker = _.findWhere(list, { "id": "908" });

        if (marker && secondMarker) {
            addNewImage();

            var firstMiddle = calculateMiddle(marker.positions);
            var secondMiddle = calculateMiddle(secondMarker.positions);

            var deltaX = firstMiddle.x - secondMiddle.x;
            var deltaY = firstMiddle.y - secondMiddle.y;

            ball.x = firstMiddle.x;
            ball.y = firstMiddle.y;

            cannon.x = secondMiddle.x;
            cannon.y = secondMiddle.y;
            var alpha = deltaX / deltaY;
            cannon.rotation = (2 * Math.atan(alpha)) / (1 - (Math.atan(alpha), 2) * (Math.atan(alpha), 2));

            ball.vx = deltaX * Constants.speedRatio;
            ball.vy = deltaY * Constants.speedRatio;
            
            var targetMarker = _.findWhere(list, { "id": "299" });
            if (targetMarker) {
                var targetMiddle = calculateMiddle(targetMarker.positions);
                target.x = targetMiddle.x;
                target.y = targetMiddle.y;
            }
        } else {
            console.log("marker not found");
        }
    });
}

function setup() {
    ball = new Sprite(resources["images/blob.png"].texture);
    ball.x = ball.width / 2 + 1;
    ball.y = ball.height / 2 + 1;
    ball.anchor.x = 0.5;
    ball.anchor.y = 0.5;
    
    // initial speed
    ball.vx = 0;
    ball.vy = 0;

    stage.addChild(ball);

    target = new Sprite(resources["images/door.png"].texture);
    target.x = sizeX - 50;
    target.y = sizeY - 50;
    target.anchor.x = 0.5;
    target.anchor.y = 0.5;
    stage.addChild(target);

    cannon = new Sprite(resources["images/cannon.png"].texture);
    cannon.x = 0;
    cannon.y = 0;
    cannon.anchor.x = 0.5;
    cannon.anchor.y = 0.5;
    cannon.rotation = 0.5;
    //stage.addChild(cannon);

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

    var boom = hitTestRectangle(ball, target);
    if (boom) {
        alert("boom");

        ball.invertVX();
        ball.invertVY();
    }
    //Render the stage
    renderer.render(stage);
}
