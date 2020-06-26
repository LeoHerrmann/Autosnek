var grid;
var gridSize = 10;
var speed = 75;
var snakeLength;
var movingDirection = "right";
var moveInterval;
var score;



var touchstartPosition;


window.onload = function() {
	addDirectionChangeEvents();

	$("#settingsScreen input, #enterLeaderboardScreen input").on("click", function(e) {
		e.target.focus();
	});


	function addDirectionChangeEvents() {
		$(document).on("keydown", function(e) {
			if (e.which == 37) {
				movingDirection = "left";
			}
			else if (e.which == 38) {
				movingDirection = "up";
			}
			else if (e.which == 39) {
				movingDirection = "right";
			}
			else if (e.which == 40) {
				movingDirection = "down";
			}
		});



		window.ontouchstart = function(e) {
			touchstartPosition = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			}
		}

		window.ontouchmove = function(e) {
			var touchmovePosition = {
				x: e.changedTouches[0].clientX,
				y: e.changedTouches[0].clientY
			};


			var xDifference = touchstartPosition.x - touchmovePosition.x;
			var yDifference = touchstartPosition.y - touchmovePosition.y;
			var direction = "none";

			if (Math.abs(xDifference) > 50) {
				if (xDifference < 0) {
					movingDirection = "right";
				}
				else {
					movingDirection = "left";
				}
			}
			else if (Math.abs(yDifference) > 50) {
				if (yDifference < 0) {
				movingDirection = "down";
				}
				else {
					movingDirection = "up";
				}
			}
		}
	}
}





var starter = {
	prepare: function() {
		score = 0;

		this.createGrid(gridSize);
		this.createSnake();
		grid = createFood();
		display();

		$(document).on("keydown touchstart", starter.start);

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

		for (var i=0;i<size*size;i++) {
			grid.push({type:"empty"});
		}

		for (field in grid) {
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

		$(document).unbind("keydown", starter.start);
		$(document).unbind("touchstart", starter.start);
	}
};




function createFood(tempGrid = JSON.parse(JSON.stringify(grid))) {
	var foodCreated = false;

	while (foodCreated == false && score+1 != gridSize*gridSize) {
		var randomNumber = Math.floor(Math.random() * (tempGrid.length));

		if (tempGrid[randomNumber].type == "empty") {
			tempGrid[randomNumber].type = "food";
			foodCreated = true;
		}
	}

	return tempGrid;
}

function growSnake(tempGrid = JSON.parse(JSON.stringify(grid))) {
	for (field in tempGrid) {
		if (tempGrid[field].type == "snake") {
			tempGrid[field].disappearIn += 1;
		}
	}

	snakeLength++;
	score++;

	return tempGrid;
}





function move(direction, tempGrid = JSON.parse(JSON.stringify(grid))) {
	tempGrid = JSON.parse(JSON.stringify(tempGrid));

	var currentHeadPosition;
	var nextFieldIndex = false;
	var stillAlive = false;

	var success = -1;

	for (var i=0;i<tempGrid.length;i++) {
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
			nextFieldIndex = currentHeadPosition - gridSize;
		}
	}
	else if (direction == "right") {
		if (currentHeadPosition % gridSize != gridSize -1) {
			nextFieldIndex = currentHeadPosition + 1;
		}
	}
	else if (direction == "down") {
		if (currentHeadPosition < gridSize * gridSize - gridSize) {
			nextFieldIndex = currentHeadPosition + gridSize;
		}
	}
	else if (direction == "left") {
		if (currentHeadPosition % gridSize != 0) {
			nextFieldIndex = currentHeadPosition - 1;
		}
	}


	if (nextFieldIndex !== false) {
		if (tempGrid[nextFieldIndex].type != "snake") {
			success = 0;

			if (tempGrid[nextFieldIndex].type == "food") {
				success = 1;
			}

			tempGrid[nextFieldIndex].type = "snake";
			tempGrid[nextFieldIndex].head = true;
			tempGrid[nextFieldIndex].disappearIn = snakeLength;
		}
	}

	return [tempGrid, success];
}





function display() {
	$("#grid > div").removeClass();

	for (var i=0;i<grid.length;i++) {
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
        if (snakeLength > 10) {
        	if (survivalPossible(6, move(directions[i][0])[0]) === false) {
        		directions[i][1] = -1;
        	}
        }

        else {
            if (survivalPossible(3, move(directions[i][0])[0]) === false) {
                directions[i][1] = -1;
        	}
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
			foodCoordinates = [i % gridSize, Math.floor(i / 10)];
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
			headCoordinates = [i % gridSize, Math.floor(i / 10)];
		}
	}

	return headCoordinates;
}



function survivalPossible(depth, tempGrid) {
	if (depth == 0) {
		if (
			move("up", tempGrid)[1] >= 0 || 
			move("right", tempGrid)[1] >= 0 ||
			move("down", tempGrid)[1] >= 0 ||
			move("left", tempGrid)[1] >= 0
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
		if (possibility == true) {
			return true;
		}
	}

	return false;
}
