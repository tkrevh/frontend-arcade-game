"use strict";
// GAME SETUP
var BUG_WIDTH = 101;
var BUG_HEIGHT = 171;
var BUG_MIN_SPEED = 150;
var BUG_VARIABLE_SPEED = 300;
var BUG_START_POSITION = -300;
var PLAYER_WIDTH = 101;
var PLAYER_HEIGHT = 171;
var TILE_STEP_X = 101;
var TILE_STEP_Y = 83;
var TILE_Y_OFFSET = -30;
var PLAYER_INITIAL_POSITION_X = 2;
var PLAYER_INITIAL_POSITION_Y = 5;
var PLAYER_MAX_X = 4;
var PLAYER_MAX_Y = 5;
var DISPLAY_COLLISION_BOUNDS = false;
var SCORE_PLAYER_GOAL_REACHED = 2;
var SCORE_PLAYER_CAUGHT = -1;

/**
 * Superclass to Enemy and Player, holds position information
 * @param startX
 * @param startY
 * @constructor
 */
var MovingObject = function(startX, startY) {
    this.x = startX;
    this.y = startY;
}


/**
 * Enemies our player must avoid.
 * @param lane, is a value between 1 and 3
 * @constructor
 */
var Enemy = function(lane) {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    MovingObject.call(this, BUG_START_POSITION, lane*TILE_STEP_Y - 20);
    this.sprite = 'images/enemy-bug.png';
    this.reset();
};

// Inherit from MovingObject
Enemy.prototype = Object.create(MovingObject.prototype);
Enemy.prototype.constructor = Enemy;


/**
 * Update the enemy's position, required method for game
 * @param dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += dt * this.speed;
    if (this.x > canvas.width + 500)  // just some arbitrary offscreen number
        this.reset();
};

/**
 * Initialize or reset the bug once its off the screen
 */
Enemy.prototype.reset = function() {
    this.x = BUG_START_POSITION;
    this.speed = BUG_MIN_SPEED + Math.random() * BUG_VARIABLE_SPEED;
}

/**
 * Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    if (DISPLAY_COLLISION_BOUNDS) {
        var bounds = this.getCollisionBounds();
        ctx.strokeStyle = "red";
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    }
};

/**
 * Returns bounds for checking of collision with the player
 * @returns {{left: (number|*), top: *, right: *, bottom: number}}
 */
Enemy.prototype.getCollisionBounds = function() {
    return {
        left: this.x,
        top: this.y + 70,
        right: this.x + BUG_WIDTH,
        bottom: this.y + BUG_HEIGHT - 25
    };
};

/**
 * Returns true if there is a collision with a player
 * @param player
 * @returns {boolean}
 */
Enemy.prototype.collidedWith = function(player) {
    var playerBounds = player.getCollisionBounds();
    var enemyBounds = this.getCollisionBounds();
    return (playerBounds.left <= enemyBounds.right &&
            enemyBounds.left <= playerBounds.right &&
            playerBounds.top <= enemyBounds.bottom &&
            enemyBounds.top <= playerBounds.bottom);
};

/**
 * Player class
 * @constructor
 */
var Player = function() {
    MovingObject.call(this, PLAYER_INITIAL_POSITION_X, PLAYER_INITIAL_POSITION_Y);
    this.moveX = 0;
    this.moveY = 0;
    this.sprite = 'images/char-boy.png';
    this.score = 0;
    this.displayScore();
}

// Inherit from MovingObject
Player.prototype = Object.create(MovingObject.prototype);
Player.prototype.constructor = Player;


/**
 * Reset the player back to initial position
 */
Player.prototype.reset = function() {
    this.x = PLAYER_INITIAL_POSITION_X;
    this.y = PLAYER_INITIAL_POSITION_Y;
    this.moveX = 0;
    this.moveY = 0;
}

/**
 * Reset the score
 */
Player.prototype.resetScore = function() {
    this.updateScore(-this.score);  // set back to 0 and update display
}

/**
 * Process collision with the bug
 */
Player.prototype.handleCollision = function() {
    ion.sound.play("metal_plate_2");
    this.reset();
    this.updateScore(SCORE_PLAYER_CAUGHT);
}

/**
 * Draw the enemy on the screen, required method for game
 */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x*TILE_STEP_X, this.y*TILE_STEP_Y + TILE_Y_OFFSET);
    if (DISPLAY_COLLISION_BOUNDS) {
        var bounds = this.getCollisionBounds();
        ctx.strokeStyle = "red";
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    }
};

/**
 * Get bounds for checking if collision occurred
 * @returns {{left: number, top: number, right: number, bottom: number}}
 */
Player.prototype.getCollisionBounds = function() {
    return {
            left: this.x*TILE_STEP_X + 30,
            top: this.y*TILE_STEP_Y + TILE_Y_OFFSET + 90,
            right: this.x*TILE_STEP_X + 25 + PLAYER_WIDTH - 50,
            bottom: this.y*TILE_STEP_Y + TILE_Y_OFFSET + PLAYER_HEIGHT - 35
        };
};


/**
 * Update the player's position, required method for game
 */
Player.prototype.update = function() {
    this.x += this.moveX;
    this.y += this.moveY;
    // check for coordinates to not go out of boundaries
    if (this.x < 0)
        this.x = 0;
    if (this.x > PLAYER_MAX_X)
        this.x = PLAYER_MAX_X;
    if (this.y < 0)
        this.y = 0;
    if (this.y > PLAYER_MAX_Y)
        this.y = PLAYER_MAX_Y;
    if (this.y == 0) // water reached
        this.win();
    this.moveX = 0;
    this.moveY = 0;
}

/**
 * Player reached the water
 */
Player.prototype.win = function() {
    ion.sound.play("water_droplet_2");
    this.reset();
    this.updateScore(SCORE_PLAYER_GOAL_REACHED);
}

/**
 * Update the current score
 * @param score
 */
Player.prototype.updateScore = function(score) {
    this.score += score;
    if (this.score < 0)
        this.score = 0;
    this.displayScore();
}

/**
 * Display the score
 * @param score
 */
Player.prototype.displayScore = function(score) {
    $('#score').text("Score: "+this.score);
}

/**
 * Handle input from user
 * @param input
 */
Player.prototype.handleInput = function(input) {
    if (input == 'up')
        this.moveY -= 1;
    else if (input == 'down')
        this.moveY += 1;
    else if (input == 'left')
        this.moveX -= 1;
    else if (input == 'right')
        this.moveX += 1;
    ion.sound.play("branch_break");
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies =
    [
        new Enemy(1),
        new Enemy(2),
        new Enemy(3),
        new Enemy(1),
        new Enemy(2),
        new Enemy(3),
        new Enemy(1),
        new Enemy(2),
        new Enemy(3)
];

// Create a new player
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (e.keyCode == 27) {  // ESC
        $("#splashScreen").show();
        $("#gameScreen").hide();
    }
    player.handleInput(allowedKeys[e.keyCode]);
});

