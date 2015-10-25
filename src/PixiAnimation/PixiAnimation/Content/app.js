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
        .add("images/obstacle.png")
        .add("images/cannon.png")
        .add("images/small-chest.png")
        .add("images/chest.png");

    loader
        .load(setup);

    //testObstacleCollistion();

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
var cannon;

var obstacles = [];

function refreshCallback() {
    var firstMarkerId = "64";
    var secondMarkerId = "908";
    var targetMarkerId = "299";

    var calculateMiddle = function(corners) {
        var sumX = 0, sumY = 0;

        for (var i = 0; i < 4; i++) {
            sumX += corners[i].x;
            sumY += corners[i].y;
        }

        return { "x": sumX / 4, "y": sumY / 4 };
    }

    var setObstacles = function(markers) {
        var obstacleMarkers = _.filter(markers, function (m) {
            return m.id !== firstMarkerId
                && m.id !== secondMarkerId
                && m.id !== targetMarkerId;
        });

        _.each(obstacles, function(obstacle) {
            stage.removeChild(obstacle);
        });

        obstacles = [];
            
        _.each(obstacleMarkers, function(marker) {
            var middle = calculateMiddle(marker.positions);
            obstacles.push(addObstacle(middle.x, middle.y));
        });
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
            //var alpha = deltaY / deltaX;
            //cannon.rotation = (2 * Math.atan(alpha)) / (1 - (Math.atan(alpha), 2) * (Math.atan(alpha), 2));

            ball.vx = deltaX * Constants.speedRatio;
            ball.vy = deltaY * Constants.speedRatio;
            
            var targetMarker = _.findWhere(list, { "id": "299" });
            if (targetMarker) {
                var targetMiddle = calculateMiddle(targetMarker.positions);
                target.x = targetMiddle.x;
                target.y = targetMiddle.y;
            }

            setObstacles(list);
        } else {
            console.log("marker not found");
        }
    });
}

var addObstacle = function (x, y) {
    var obstacle = new Sprite(resources["images/obstacle.png"].texture);
    obstacle.x = x;
    obstacle.y = y;
    obstacle.anchor.x = 0.5;
    obstacle.anchor.y = 0.5;
    stage.addChild(obstacle);

    return obstacle;
}

function startNew() {
    ball.x = ball.width / 2 + 1;
    ball.y = ball.height / 2 + 1;
    ball.anchor.x = 0.5;
    ball.anchor.y = 0.5;
    
    // initial speed
    ball.vx = 0;
    ball.vy = 0;
    if (Constants.runAtStartup) {
        ball.vx = 4;
        ball.vy = 7;
    }

    target.x = sizeX + 50;
    target.y = sizeY + 50;
    target.anchor.x = 0.5;
    target.anchor.y = 0.5;

    cannon.x = 0;
    cannon.y = 0;
    cannon.anchor.x = 0.5;
    cannon.anchor.y = 0.5;
}

function setup() {
    ball = new Sprite(resources["images/blob.png"].texture);
    stage.addChild(ball);

    target = new Sprite(resources["images/small-chest.png"].texture);
    stage.addChild(target);

    cannon = new Sprite(resources["images/cannon.png"].texture);
    stage.addChild(cannon);

    if (Constants.showObstacles) {
        obstacles.push(addObstacle(500, 500));
        obstacles.push(addObstacle(300, 300));
    }

    startNew();

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
    // very important
    if (!hitTestRectangle(clone, obstacle)) {
        // not overlapping anymore to so in x axis we go back 
        point.vx = -point.vx;
    } else {
        point.vy = -point.vy;
    }
}

function gameLoop() {

    //Loop this function 60 times per second
    requestAnimationFrame(gameLoop);

    ball.move();

    // multiple obstacles nearby will cause problems!
    _.each(obstacles, function(obstacle) {
        changeDirectionCausedByObstacle(ball, obstacle);
    });

    // Obstacle must be resolved first
    ball.TryChangeDirection(sizeX, sizeY);

    var boom = hitTestRectangle(ball, target);
    if (boom) {
        alert("BOOOOOOOOOOOOOOOOOOOOOOOOOOOOOMMMMMMMMMM");

        ball.invertVX();
        ball.invertVY();
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
    object.vx = 10;
    object.vy = 0;
    object.width = 32;
    object.height = 32;
    // width height = 32

    var obstacle = new Sprite(resources["images/door.png"].texture);
    obstacle.x = 32 + 5;
    obstacle.y = 0;
    obstacle.vx = 0;
    obstacle.vy = 0;
    obstacle.width = 32;
    obstacle.height = 32;
    // width height = 32

    object.move();

    var isHit = hitTestRectangle(object, obstacle);
    assert(isHit);

    changeDirectionCausedByObstacle(object, obstacle);

    assert(object.vx === -10);
}
