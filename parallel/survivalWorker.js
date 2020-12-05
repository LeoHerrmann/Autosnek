var gridSize;
var originalDepth;
var workerBlobURL;


self.addEventListener("message", async function(e) {
    var data = JSON.parse(e.data);

    var move_return = data[0];
    var depth = data[1];
	gridSize = data[2];
	originalDepth = data[3];
	workerBlobURL = data[4];

    if (move_return[1] != -1) {
		if (depth > originalDepth - 2) {
    	    var survivable = await survivalPossible(depth, move_return[0]);
    	    self.postMessage(survivable);
	        self.close();
		}
		else {
			var survivable = await survivalPossibleSingle(depth, move_return[0]);
    	    self.postMessage(survivable);
	        self.close();
		}
    }
    else {
    	self.postMessage(false);
    	self.close();
    }
});



//checks if survival is possible by creating new workers
async function survivalPossible(depth, tempGrid) {
	tempGrid = JSON.parse(JSON.stringify(tempGrid));

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

	var promise = new Promise(function(resolve, reject) {
		var survivalPossibilities = [];

		let move_up = move("up", tempGrid);
		let move_right = move("right", tempGrid);
		let move_down = move("down", tempGrid);
		let move_left = move("left", tempGrid);

		var upWorker;
		var rightWorker;
		var downWorker;
		var leftWorker;

		var pushWorkerResult = function(event) {
			survivalPossibilities.push(event.data);
			event.target.onmessage = undefined;

			if (event.data === true) {
				terminateAllWorkers();
				resolve([true]);
			}

			if (survivalPossibilities.length == 4) {
				terminateAllWorkers();
				resolve(survivalPossibilities);
			}

			function terminateAllWorkers() {
				if (typeof(upWorker) != "undefined") {upWorker.terminate();}
				if (typeof(rightWorker) != "undefined") {rightWorker.terminate();}
				if (typeof(downWorker) != "undefined") {downWorker.terminate();}
				if (typeof(leftWorker) != "undefined") {leftWorker.terminate();}
			}
		};

		if (move_up[1] != -1) {
			upWorker = new Worker(workerBlobURL);
			upWorker.onmessage = pushWorkerResult;
			upWorker.postMessage(JSON.stringify([move_up, depth - 1, gridSize, originalDepth, workerBlobURL]));
		}
		else {
			survivalPossibilities.push(false);
		}

		if (move_right[1] != -1) {
			rightWorker = new Worker(workerBlobURL);
			rightWorker.onmessage = pushWorkerResult;
			rightWorker.postMessage(JSON.stringify([move_right, depth - 1, gridSize, originalDepth, workerBlobURL]));
		}
		else {
			survivalPossibilities.push(false);
		}

		if (move_down[1] != -1) {
			downWorker = new Worker(workerBlobURL);
			downWorker.onmessage = pushWorkerResult;
			downWorker.postMessage(JSON.stringify([move_down, depth - 1, gridSize, originalDepth, workerBlobURL]));
		}
		else {
			survivalPossibilities.push(false);
		}

		if (move_left[1] != -1) {
			leftWorker = new Worker(workerBlobURL);
			leftWorker.onmessage = pushWorkerResult;
			leftWorker.postMessage(JSON.stringify([move_left, depth - 1, gridSize, originalDepth, workerBlobURL]));
		}
		else {
			survivalPossibilities.push(false);
		}

		if (survivalPossibilities.length >= 4) {
			resolve(survivalPossibilities);
		}
	});

	survivalPossibilities = await promise;

	for (let possibility of survivalPossibilities) {
		if (possibility === true) {
			return true;
		}
	}

	return false;
}



//checks if survival is possible on the current worker
function survivalPossibleSingle(depth, tempGrid) {
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
		if(survivalPossibleSingle(depth - 1, move_up[0]) === true) {
			return true;
		}
	}

	if (move_right[1] != -1) {
		if(survivalPossibleSingle(depth - 1, move_right[0]) === true) {
			return true;
		}
	}

	if (move_down[1] != -1) {
		if(survivalPossibleSingle(depth - 1, move_down[0]) === true) {
			return true;
		}
	}

	if (move_left[1] != -1) {
		if(survivalPossibleSingle(depth - 1, move_left[0]) === true) {
			return true;
		}
	}

	return false;
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

	switch (direction) {
		case "up":
			if (currentHeadPosition >= gridSize) {
				nextHeadPosition = currentHeadPosition - gridSize;
			}
			break;

		case "right":
			if (currentHeadPosition % gridSize != gridSize -1) {
				nextHeadPosition = currentHeadPosition + 1;
			}
			break;

		case "down":
			if (currentHeadPosition < gridSize * gridSize - gridSize) {
				nextHeadPosition = currentHeadPosition + gridSize;
			}
			break;

		case "left":
			if (currentHeadPosition % gridSize != 0) {
				nextHeadPosition = currentHeadPosition - 1;
			}
			break;
	}

	if (nextHeadPosition !== false) {
		if (tempGrid[nextHeadPosition].type != "snake") {
			success = 0;

			if (tempGrid[nextHeadPosition].type == "food") {
				success = 1;
			}

			tempGrid[nextHeadPosition].type = "snake";
			tempGrid[nextHeadPosition].head = true;
			tempGrid[nextHeadPosition].disappearIn = getSnakeLength(tempGrid);

			if (success == 1) {
				tempGrid = growSnake(tempGrid);
			}
		}
	}

	return [tempGrid, success];
}



function getSnakeLength(tempGrid) {
	tempGrid = JSON.parse(JSON.stringify(tempGrid));
	var length = 0;

	for (let element of tempGrid) {
		if (element.type == "snake") {
			length += 1;
		}
	}

	return length;
}



function growSnake(tempGrid = JSON.parse(JSON.stringify(grid))) {
	for (let field in tempGrid) {
		if (tempGrid[field].type == "snake") {
			tempGrid[field].disappearIn += 1;
		}
	}

	return tempGrid;
}



function getFoodCoordinates(tempGrid = grid) {
	tempGrid = JSON.parse(JSON.stringify(tempGrid));

	let foodCoordinates = [];

	for (let i = 0; i < tempGrid.length; i++) {
		if (tempGrid[i].type == "food") {
			foodCoordinates = [i % gridSize, Math.floor(i / gridSize)];
			break;
		}
	}

	if (foodCoordinates.length == 0) {
		foodCoordinates = getHeadCoordinates(tempGrid);
	}

	return foodCoordinates;
}



function getHeadCoordinates(tempGrid = grid) {
	tempGrid = JSON.parse(JSON.stringify(tempGrid));

	let headCoordinates = [];

	for (let i = 0; i < tempGrid.length; i++) {
		if (tempGrid[i].type == "snake" && tempGrid[i].head === true) {
			headCoordinates = [i % gridSize, Math.floor(i / gridSize)];
			break;
		}
	}

	return headCoordinates;
}
