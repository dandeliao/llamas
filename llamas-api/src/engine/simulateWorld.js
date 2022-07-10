const { randomGround, randomLlamas } = require("./createWorld");
const _ = require('lodash');

// ---
// auxiliary functions

// index of the greatest value in an array 
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

// returns position if boundaries where to warp around themselves (e.g. going all the way down makes you come out of the top)
function warpPosition(line, column, numberOfLines, numberOfColumns) {

	let l = _.clone(line);
	let c = _.clone(column);

	if (line >= numberOfLines) {
		l = line - numberOfLines;
	} else if (line < 0) {
		l = numberOfLines + line;
	}

	if (column >= numberOfColumns) {
		c = column - numberOfColumns;
	} else if (column < 0) {
		c = numberOfColumns + column;
	}

	return {'line': l, 'column': c}
}

// llama field of view
function fieldOfView (llama, ground) {

	const field = new Array ();
	const lineStart = 	llama.line 	 - llama.viewRange;
	const lineEnd = 	llama.line 	 + llama.viewRange;
	const columnStart =	llama.column - llama.viewRange;
	const columnEnd = 	llama.column + llama.viewRange;

	for (let l = lineStart; l <= lineEnd; l++) {
		let fieldLine = new Array ();
		for (let c = columnStart; c <= columnEnd; c++) {
			let warped = warpPosition(l, c, ground.length, ground[0].length); // gets position in a round world
			fieldLine.push(ground[warped.line][warped.column]);
		}
		field.push(fieldLine);
	}

	return field;

}

// neuron activation simulation
function neuronActivation (signals, neuron) {

	let weightedSignals = new Array(signals.length);
	for (let i = 0; i < signals.length; i++) {
		weightedSignals[i] = signals[i] * neuron.weights[i];
	}

	let sumOfSignals = 0;
	for (let i = 0; i < weightedSignals.length; i++) {
		sumOfSignals += weightedSignals[i];
	}
	
	let averageSignal = sumOfSignals / weightedSignals.length;

	if (averageSignal > neuron.activation) {
		return true;
	} else {
		return false;
	}

}

// brain simulation
function brainSimulation (llama, ground) {
	
	const sight = fieldOfView(llama, ground);
	const firstSignals = new Array();

	// converts sight (2D matrix) to firstSignals (1D array)
	for (let i = 0; i < sight.length; i++) {
		for (let j = 0; j < sight[0].length; j++) {
			firstSignals[j + sight.length * i] = sight[i][j];
		}
	}
	
	let signals = firstSignals;
	llama.brain.forEach(layer => {
		let futureSignals = new Array();
		layer.forEach(neuron => {
			if (neuronActivation(signals, neuron) === true) {
				futureSignals.push(1);
			} else {
				futureSignals.push(0);
			}
		});
		signals = futureSignals;
	});

	return signals;

}

// decides which action a llama will take
function decideAction(motorSignals) {
	
	const relevantSignals = motorSignals.slice(0, 6);
	const biggestSignal  = indexOfMax(relevantSignals);

	if (biggestSignal === 0) {
		return 'dull';
	} else if (biggestSignal === 1) {
		return 'eat';
	} else if (biggestSignal === 2) {
		return 'left';
	} else if (biggestSignal === 3) {
		return 'down';
	} else if (biggestSignal === 4) {
		return 'right';
	} else if (biggestSignal === 5) {
		return 'up';
	}

}

function nextPosition(llama, action) {

	let positionLine = _.clone(llama.line);
	let positionColumn = _.clone(llama.column);

	if (action === 'dull') {
		return [positionLine, positionColumn];
	} else if (action === 'eat') {
		return [positionLine, positionColumn];
	} else if (action === 'left') {
		return [positionLine, positionColumn - 1];
	} else if (action === 'down') {
		return [positionLine + 1, positionColumn];
	} else if (action === 'right') {
		return [positionLine, positionColumn + 1];
	} else if (action === 'up') {
		return [positionLine - 1, positionColumn];
	}

}

function conflictingPositions(position, llamas) {

	for (let i = 0; i < llamas.length; i++) {
		if (llamas[i].line === position[0]) {
			if (llamas[i].column === position[1]) {
				return true;
			}
		}
	}

	return false;
}

// updates ground
function updateGround(ground, llamas) {

	for(let i = 0; i < ground.length; i++){
		for(let j = 0; j < ground[0].length; j++){
			for(let k = 0; k < llamas.length; k++){
				if ((llamas[k].line === i) && (llamas[k].column === j) && (llamas[k].action === 'eat')) {
					let newGroundValue = ground[i][j] - 1;
					if (newGroundValue >= 0) {
						ground[i][j] = _.clone(newGroundValue);
					}
				}
			}
		}
	}

	return ground;
}

// updates llamas
function updateLlamas (ground, llamas) {
	
	for (let l = 0; l < llamas.length; l++) {

		let llama = llamas[l];

		let motorSignals = brainSimulation(llama, ground);
		let nextAction = decideAction(motorSignals);
		let newPosition = nextPosition(llama, nextAction);

		let warpedPos = warpPosition(newPosition[0], newPosition[1], ground.length, ground[0].length); // adjusts new position for round world
		newPosition[0] = _.clone(warpedPos.line);
		newPosition[1] = _.clone(warpedPos.column);

		if ((nextAction !== 'dull') && (nextAction !== 'eat')) {
			if (conflictingPositions(newPosition, llamas) === true) {
				console.log('conflito de llamas');
				llama.action = 'dull';
				newPosition = [llama.line, llama.column]; // on conflict don't move
			} else {
				console.log('anda sem conflito');
				llama.action = nextAction;
			}
		} else {
			llama.action = nextAction;
		}
		llama.line = newPosition[0];
		llama.column = newPosition[1];
	}

	return llamas;

}

// runs one step of the simulation and returns world
function oneRound(initialGround, initialLlamas) {
	
	let llamas = updateLlamas(initialGround, initialLlamas);
	let ground = updateGround(initialGround, llamas);

	return {'ground': ground, 'llamas': llamas};	
}

module.exports = { oneRound };