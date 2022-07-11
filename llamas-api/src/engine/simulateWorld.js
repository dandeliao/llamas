const { warpPosition, randomInteger } = require('./utils');
const { brainSimulation, updateHomeostatic, isDead, reproduce } = require('./simulatePhisiology');
const _ = require('lodash');

// ---

function freePositions(ground, llamas) {

	let freePositions = new Array;

	for (let i = 0; i < ground.length; i++) {
		for (let j = 0; j < ground[0].length; j++) {
			freePositions.push([i,j]);
			llamaLoop: for (let l = 0; l < llamas.length; l++) {
				if ((llamas[l].line === i) && (llamas[l].column === j)) {
					let popped = freePositions.pop();
					break llamaLoop;
				}
			}
		}
	}
	
	return freePositions;
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
	} else if (action === 'reproduce') {
		return [positionLine, positionColumn];
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
					let newGroundValue;
					if (llamas[k].diet === 'mana') {
						newGroundValue = ground[i][j] - 1;
					} else if (llamas[k].diet === 'void') {
						newGroundValue = ground[i][j] + 1;
					}
					
					if ((newGroundValue >= 0) && (newGroundValue < 5)) {
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
	
	console.log('llamas.length', llamas.length);

	let puppies = [];

	for (let l = 0; l < llamas.length; l++) {

		let llama = llamas[l];

		let nextAction = brainSimulation(llama, ground);
		let newPosition = nextPosition(llama, nextAction);

		console.log('llama #', l, nextAction);

		let warpedPos = warpPosition(newPosition[0], newPosition[1], ground.length, ground[0].length); // adjusts new position for round world
		newPosition[0] = _.clone(warpedPos.line);
		newPosition[1] = _.clone(warpedPos.column);

		if ((nextAction !== 'dull') && (nextAction !== 'eat') && (nextAction !== 'reproduce')) {
			if (conflictingPositions(newPosition, llamas) === true) {
				console.log('stops before crashing');
				llama.action = 'dull';
				newPosition = [llama.line, llama.column]; // on conflict don't move
			} else {
				console.log('walks peacefully');
				llama.action = nextAction;
			}
		} else {
			if (nextAction === 'eat') { 
				console.log('eats nom mnom');
			} else if (nextAction === 'reproduce') {
				
				console.log('trying to make a puppy');
				let puppy = null;
				let puppyPosition = null;
				let freePositionsArray = freePositions(ground, llamas);
				if (freePositionsArray.length > 0) {
					puppyPosition = freePositionsArray[randomInteger(0, freePositionsArray.length)];
				}
				if (puppyPosition) {
					puppy = reproduce(llama);
					console.log('puppy Position:', puppyPosition);
				} else {
					console.log('no space for babies now');
				}
				if (puppy) {
					puppy.line = puppyPosition[0];
					puppy.column = puppyPosition[1];
					puppies.push(puppy);
					console.log('gave birth :)');
				} else {
					nextAction = 'dull';
					console.log('no baby this time :(');
				}
			}
			llama.action = nextAction;
		}

		updateHomeostatic(llama, ground);

		llama.line = newPosition[0];
		llama.column = newPosition[1];
	}

	// checks for dead llamas and remove them
	for (let l = llamas.length - 1; l >= 0; l--) {
		if (isDead(llamas[l])) {
			console.log('✝✝✝ a llama died ✝✝✝');
			llamas.splice(l, 1);
		}
	}

	// checks for new born puppies and add them
	for (let p = 0; p < puppies.length; p++) {
		console.log('☆☆☆ a llama was born ☆☆☆');
		llamas.push(puppies[p]);
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