var gridSize = 12;
var speed = 75;

var grid;
var snakeLength;
var movingDirection;
var moveInterval;
var score;



var starter = {
	prepare: function() {
		score = 0;

		this.createGrid(gridSize);
		this.createSnake();
		grid = createFood();
		display();

		setTimeout(function() {
			$(".popup").fadeOut(200);
		}, 200);

		setTimeout(function() {
			starter.start();
		}, 700);
	},

	createGrid: function(size) {
		grid = [];
		$("#grid > div").remove();

		for (var i = 0; i < size ** 2; i++) {
			grid.push({type:"empty"});
		}

		for (let field in grid) {
			var newField = $("<div></div>");

			$("#grid").append(newField);
		}

		$("#grid").css({
			"grid-template-rows": "repeat(" + gridSize + ", 1fr)",
			"grid-template-columns": "repeat(" + gridSize + ", 1fr)"
		});

	},

	createSnake: function() {
		snakeLength = 1;
		grid[gridSize + 1] = {type: "snake", disappearIn: 1, head: true};
	},

	start: function() {
		movingDirection = "right";

		moveInterval = setInterval(function() {
			moveReturn = move(movingDirection);
			moveSuccess = moveReturn[1];
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
				$("#gameOverScoreLabel").text("Score: " + score);

				setTimeout(function() {
					$("#startScreen").fadeIn(200);
				}, 200);

				$("#startScreen h1").text("Game Over");
				$("#startScreen #gameOverScoreLabel").css("display", "block");
				clearInterval(moveInterval);
			}
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
	$("#grid > div").removeClass();

	for (var i = 0; i < grid.length; i++) {
		if (grid[i].type == "snake") {
			$("#grid > div").eq(i).addClass("snake");

			if (grid[i].head == true) {
				$("#grid > div").eq(i).addClass("head");
			}
		}

		if (grid[i].type == "food") {
			$("#grid > div").eq(i).addClass("food");
		}
	}

	$("#scoreLabel").text(score);
}



//go closer to food if it is possible to continue living
function autoDirection() {
    var foodCoordinates = getFoodCoordinates();
    var headCoordinates = getHeadCoordinates();

    var directions = [["left", 0], ["right", 0], ["up", 0], ["down", 0]];

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

    for (let i = 0; i < 4; i++) {
        if (survivalPossible(6, move(directions[i][0])[0]) === false) {
            directions[i][1] = -1;
        }
    }

    //select one of the directions with highest rating
    var highestRating = directions[0][1];
    var bestDirection = directions[0][0];

    for (let direction of directions) {
    	if (direction[1] > highestRating) {
    		bestDirection = direction[0];
    		highestRating = direction[1];
    	}
    }

    movingDirection = bestDirection;
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
		survivalPossibilities.push(survivalPossible(depth - 1, move_up[0]));
	}

	if (move_right[1] != -1) {
		survivalPossibilities.push(survivalPossible(depth - 1, move_right[0]));
	}

	if (move_down[1] != -1) {
		survivalPossibilities.push(survivalPossible(depth - 1, move_down[0]));
	}

	if (move_left[1] != -1) {
		survivalPossibilities.push(survivalPossible(depth - 1, move_left[0]));
	}

	for (let possibility of survivalPossibilities) {
		if (possibility === true) {
			return true;
		}
	}

	return false;
}
