var gridSize = 12;
var speed = 75;
var maxSurvivalCheckDepth = 25;

var grid;
var snakeLength;
var movingDirection;
var moveInterval;
var score;

var processing_times = {
	list: [],

	getAverage: function() {
		var sum = 0;

		for (element of processing_times.list) {
		  sum += element;
		}

		return sum / processing_times.list.length;
	},

	getMaximum: function() {
		var maximum = 0;

		for (element of processing_times.list) {
			if (element > maximum) {
				maximum = element;
			}
		}

		return maximum;
	}
}



var starter = {
	prepare: function() {
		score = 0;

		processing_times.list = [];

		starter.createGrid(gridSize);
		starter.createSnake();
		grid = createFood();
		display();


		setTimeout(function() {
			document.getElementById("startScreen").style.opacity = 0;

			setTimeout(function() {
				document.getElementById("startScreen").style.display = "none";
			}, 200);
		}, 200);

		setTimeout(function() {
			starter.start();
		}, 700);
	},

	createGrid: function(size) {
		grid = [];

		var gridElement = document.getElementById("grid");

		var gridTiles = gridElement.getElementsByTagName("div");

		while (gridTiles.length > 0) {
			gridTiles[0].remove();
		}

		for (var i = 0; i < size ** 2; i++) {
			grid.push({type:"empty"});
		}

		for (let field in grid) {
			gridElement.append(document.createElement("div"))
		}

		gridElement.style.gridTemplateRows = "repeat(" + gridSize + ", 1fr)";
		gridElement.style.gridTemplateColumns = "repeat(" + gridSize + ", 1fr)";

	},

	createSnake: function() {
		snakeLength = 1;
		grid[gridSize + 1] = {type: "snake", disappearIn: 1, head: true};
	},

	start: function() {
		autoDirection();

		moveInterval = setInterval(function() {
			var start_time = new Date().getTime();
			var end_time;

			var moveReturn = move(movingDirection);
			var moveSuccess = moveReturn[1];
			grid = moveReturn[0];

			if (moveSuccess == 1) {
				grid = growSnake();
				grid = createFood();
			}

			if (moveSuccess >= 0) {
				display();
				autoDirection();
			}

			else {
				clearInterval(moveInterval);

				var gameOverScoreLabel = document.getElementById("gameOverScoreLabel");
				gameOverScoreLabel.innerText = "Score: " + score;
				gameOverScoreLabel.style.display = "block";

				document.querySelector("#startScreen h1").innerText = "Game Over";

				document.getElementById("startScreen").style.display = "block";

				setTimeout(function() {
					document.getElementById("startScreen").style.opacity = "1";
				}, 500);
			}

			var end_time = new Date().getTime();
			processing_times.list.push(end_time - start_time);
		}, speed);
	}
};



function createFood(tempGrid = JSON.parse(JSON.stringify(grid))) {
	var foodCreated = false;

	while (foodCreated == false && score + 1 != gridSize ** 2) {
		var randomNumber = Math.floor(Math.random() * (tempGrid.length));

		if (tempGrid[randomNumber].type == "empty") {
			tempGrid[randomNumber].type = "food";
			foodCreated = true;
		}
	}

	return tempGrid;
}



function growSnake(tempGrid = JSON.parse(JSON.stringify(grid))) {
	for (let field in tempGrid) {
		if (tempGrid[field].type == "snake") {
			tempGrid[field].disappearIn += 1;
		}
	}

	snakeLength++;
	score++;

	return tempGrid;
}





function move(direction, tempGrid = grid) {
	tempGrid = JSON.parse(JSON.stringify(tempGrid));

	var currentHeadPosition;
	var nextHeadPosition = false;
	var success = -1;

	for (var i = 0; i < tempGrid.length; i++) {
		if(tempGrid[i].type == "snake") {
			if (tempGrid[i].head === true) {
				currentHeadPosition = i;
				tempGrid[i].head = undefined;
			}

			tempGrid[i].disappearIn -= 1;

			if (tempGrid[i].disappearIn == 0) {
				tempGrid[i].type = "empty";
				tempGrid[i].disappearIn = undefined;
			}
		}
	}


	if (typeof(currentHeadPosition) == "undefined") {
		return [tempGrid, -1];
	}


	if (direction == "up") {
		if (currentHeadPosition >= gridSize) {
			nextHeadPosition = currentHeadPosition - gridSize;
		}
	}
	else if (direction == "right") {
		if (currentHeadPosition % gridSize != gridSize -1) {
			nextHeadPosition = currentHeadPosition + 1;
		}
	}
	else if (direction == "down") {
		if (currentHeadPosition < gridSize * gridSize - gridSize) {
			nextHeadPosition = currentHeadPosition + gridSize;
		}
	}
	else if (direction == "left") {
		if (currentHeadPosition % gridSize != 0) {
			nextHeadPosition = currentHeadPosition - 1;
		}
	}


	if (nextHeadPosition !== false) {
		if (tempGrid[nextHeadPosition].type != "snake") {
			success = 0;

			if (tempGrid[nextHeadPosition].type == "food") {
				success = 1;
			}

			tempGrid[nextHeadPosition].type = "snake";
			tempGrid[nextHeadPosition].head = true;
			tempGrid[nextHeadPosition].disappearIn = snakeLength;
		}
	}

	return [tempGrid, success];
}



function display() {
	var gridTiles = document.querySelectorAll("#grid > div");

	for (let i = 0; i < gridTiles.length; i++) {
		gridTiles[i].classList.remove("food");
		gridTiles[i].classList.remove("snake");
		gridTiles[i].classList.remove("head");

		if (grid[i].type == "snake") {
			gridTiles[i].classList.add("snake");

			if (grid[i].head === true) { //richtig?
				gridTiles[i].classList.add("head");
			}
		}

		else if (grid[i].type == "food") {
			gridTiles[i].classList.add("food");
		}
	}

	document.getElementById("scoreLabel").innerText = score;
}



//go closer to food if it is possible to continue living
function autoDirection() {
    var foodCoordinates = getFoodCoordinates();
    var headCoordinates = getHeadCoordinates();

    var directions = [["left", 0], ["right", 0], ["up", 0], ["down", 0]];

    //rate movements positively if they bring the snake closer to the food source
    if (headCoordinates[0] > foodCoordinates[0]) {
        directions[0][1] = 1;
    }
    else if (headCoordinates[0] < foodCoordinates[0]) {
        directions[1][1] = 1;
    }

    if (headCoordinates[1] > foodCoordinates[1]) {
        directions[2][1] = 1;
    }
    else if (headCoordinates[1] < foodCoordinates[1]) {
        directions[3][1] = 1;
    }

	//rate movements negatively if they oppose the current direction
	switch (movingDirection) {
		case "left":
			directions[1][1] = -1;
			break;
		case "right":
			directions[0][1] = -1;
			break;
		case "up":
			directions[3][1] = -1;
			break;
		case "down":
			directions[2][1] = -1;
			break;
	}

    //rate movements negatively if they inevitably lead to the snake dying
	var survivalCheckDepth;

	if (snakeLength < maxSurvivalCheckDepth) {
		survivalCheckDepth = snakeLength;
	}
	else {
		survivalCheckDepth = maxSurvivalCheckDepth;
	}

    for (let i = 0; i < directions.length; i++) {
    	if (directions[i][1] >= 0) {
			if (survivalPossible(survivalCheckDepth, move(directions[i][0])[0]) === false) {
			    directions[i][1] = -1;
			}
    	}
    }

	//if death inevitable, rate movements bringing the snake closer to the food source higher
	if (directions[0][1] == -1 && directions[1][1] == -1 && directions[2][1] == -1 && directions[3][1] == -1) {
	    if (headCoordinates[0] > foodCoordinates[0]) {
    	    directions[0][1] = 1;
    	}
    	if (headCoordinates[0] < foodCoordinates[0]) {
    	    directions[1][1] = 1;
    	}
    	if (headCoordinates[1] > foodCoordinates[1]) {
    	    directions[2][1] = 1;
    	}
    	if (headCoordinates[1] < foodCoordinates[1]) {
    	    directions[3][1] = 1;
    	}
	}

    //choose randomly between the best movements
	var highestRating = directions[0][1];
    var bestDirections = [directions[0][0]];

    for (let direction of directions) {
    	if (direction[1] > highestRating) {
    		bestDirections = [direction[0]];
    		highestRating = direction[1];
    	}
    	else if (direction[1] == highestRating) {
    		bestDirections.push(direction[0])
    	}
    }

    movingDirection = bestDirections[Math.floor(Math.random() * bestDirections.length)];
}



function getFoodCoordinates(tempGrid = JSON.parse(JSON.stringify(grid))) {
	let foodCoordinates = [];

	for (let i = 0; i < tempGrid.length; i++) {
		if (tempGrid[i].type == "food") {
			foodCoordinates = [i % gridSize, Math.floor(i / gridSize)];
			break;
		}
	}

	if (foodCoordinates.length == 0) {
		foodCoordinates = getHeadCoordinates();
	}

	return foodCoordinates;
}



function getHeadCoordinates(tempGrid = JSON.parse(JSON.stringify(grid))) {
	let headCoordinates = [];

	for (let i = 0; i < tempGrid.length; i++) {
		if (tempGrid[i].type == "snake" && tempGrid[i].head === true) {
			headCoordinates = [i % gridSize, Math.floor(i / gridSize)];
			break;
		}
	}

	return headCoordinates;
}



function survivalPossible(depth, tempGrid) {
	if (depth == 0) {
		var headCoordinates = getHeadCoordinates(tempGrid);

		if (
			(headCoordinates[1] > 0 && tempGrid[headCoordinates[1] * gridSize + headCoordinates[0] - gridSize].type != "snake") ||				//up
			(headCoordinates[0] < gridSize - 1 && tempGrid[headCoordinates[1] * gridSize + headCoordinates[0] + 1].type != "snake") ||			//right
			(headCoordinates[1] < gridSize - 1 && tempGrid[headCoordinates[1] * gridSize + headCoordinates[0] + gridSize].type != "snake") || 	//down
			(headCoordinates[0] > 0 && tempGrid[headCoordinates[1] * gridSize + headCoordinates[0] - 1].type != "snake")						//left
		) {
			return true;
		}

		return false;
	}

	let survivalPossibilities = [];

	let move_up = move("up", tempGrid);
	let move_right = move("right", tempGrid);
	let move_down = move("down", tempGrid);
	let move_left = move("left", tempGrid);

	if (move_up[1] != -1) {
		if (survivalPossible(depth - 1, move_up[0]) === true) {
			return true;
		}
	}

	if (move_right[1] != -1) {
		if(survivalPossible(depth - 1, move_right[0]) === true) {
			return true;
		}
	}

	if (move_down[1] != -1) {
		if(survivalPossible(depth - 1, move_down[0]) === true) {
			return true;
		}
	}

	if (move_left[1] != -1) {
		if(survivalPossible(depth - 1, move_left[0]) === true) {
			return true;
		}
	}

	return false;
}
