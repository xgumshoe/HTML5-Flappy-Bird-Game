var stage = new createjs.Stage('game');
var GRID = 5;
var POINTS = 0;
var started = false;
var obstacles = [];

// Title
var title = stage.addChild(new createjs.Text("FLAPPY BIRD", "Bold 20px Arial", "white"));
title.textAlign = "center";
title.textBaseline = "middle";
title.x = stage.canvas.width/2;
title.y = 100;

// Score
var score = stage.addChild(new createjs.Text(`SCORE: ${POINTS}`, "Bold 20px Arial", "white"));
score.textAlign = "left";
score.textBaseline = "middle";
score.x = 50;
score.y = 180;

// Game screen
var screen = stage.addChild(new createjs.Container());
screen.x = 50;
screen.y = 200;

// Background
var bg = screen.addChild(new createjs.Shape());
bg.graphics
	.beginStroke('rgba(255, 255, 255, 1)').setStrokeStyle(2)
	.beginFill('rgba(0, 0, 0, 1)').drawRect(0, 0, 400, 400);
	
// controls
var guide = stage.addChild(new createjs.Text("Click", "bold 20px arial", "white"));
guide.textAlign = "center";
guide.textBaseline = "middle";
guide.x = stage.canvas.width/2;
guide.y = 300;

// Bird
var bird = {
	x: 40,
	y: 100,
	width: 20,
	height: 20,
	
	gravity: GRID,
	body: screen.addChild(new createjs.Shape()),
	create: () => {
		bird.body.graphics
			.beginFill('rgba(100, 100, 100, 0.8)').drawRect(0, 0, bird.width, bird.height)
			.beginFill('rgba(255, 0, 0, 1)').drawCircle(10, 10, 6)
		bird.body.regX = 10;
		bird.body.regY = 10;
		bird.body.x = bird.x;
		bird.body.y = bird.y;
	},
	/*
	 * Drop y coordinate
	 */
	update: () => {
		// Stop if y has already reached the land
		// bird y >= land y - bird height
		if(bird.y >= land.y-bird.height) return;
		bird.y += bird.gravity;
		bird.body.y = bird.y;
		bird.body.rotation+=35;
	},
	/*
	 * Jump
	 */
	jump() {
		bird.y -= 40;
		bird.body.y = bird.y;
	},
};

// Land
var land = screen.addChild(new createjs.Shape());
land.graphics.beginFill('rgba(50, 50, 50, 1)').drawRect(5, 0, 390, 50)
land.y = 300;

// Obstacle control
var game = {
	delay: 40,
	tick: 0,
}

// Obstacles
class component {
	constructor(x, y, width, height) {
		this.destroyed = false;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		this.body = screen.addChild(new createjs.Shape());
		this.body.graphics.beginFill('rgba(100, 100, 100, 1)').drawRect(0, 0, this.width, this.height);
		this.body.x = this.x;
		this.body.y = this.y;
	}
	/*
	 * Move component
	 */
	update() {
		this.x -= GRID;
		this.body.x = this.x;
		
		if(this.x <= 0) this.destroy();
	}
	/*
	 * Remove component from stage
	 */
	destroy() {
		this.destroyed = true;
		screen.removeChild(this.body);
	}
	/*
	 * Collision detection*
	 */
	collided(x, y, w, h) {
		if((this.y+this.height) < y-h/2 || this.y > ((y-h/2)+h) ||
			(this.x+this.width) < x-w/2 || this.x > ((x-w/2)+w)) {
			return false;
		}
		return true;	
	}
}


// Update game
function update() {
	if(started) {
		score.text = `SCORE: ${++POINTS}`;
		
		game.tick++;
		if(game.tick % game.delay === 0) {
			var height = Math.floor(Math.random() * (150-40)+40);
			var gap = Math.floor(Math.random() * (150-100)+100)
			obstacles.push(new component(350, 0, 20, height));
			obstacles.push(new component(350, height+gap, 20, land.y - height - gap));
		}
		
		bird.update()
		
		// Filter out destroyed obstacles
		var obs = obstacles.filter(e => !e.destroyed);
		obs.map(e => {
			e.update();
			
			if(e.collided(bird.x, bird.y, bird.width, bird.height)) {
				started = false;
			}
		})
	}
	stage.update();
}

function restart() {
	started = true;
	POINTS = 0;
	score.text = `SCORE: ${POINTS}`;
	
	guide.visible = false;
	
	bird.create();
}
setTimeout(() => { restart(); }, 0);
	
stage.on('click', (e) => {
	if(started) {
		bird.jump();
	}
});

createjs.Ticker.on('tick', update);