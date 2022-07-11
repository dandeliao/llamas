const { warpPosition } = require('./utils');
const { brainSimulation } = require('./simulatePhisiology');
const _ = require('lodash');

// ---

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
	
	for (let l = 0; l < llamas.length; l++) {

		let llama = llamas[l];

		let nextAction = brainSimulation(llama, ground);
		let newPosition = nextPosition(llama, nextAction);

		let warpedPos = warpPosition(newPosition[0], newPosition[1], ground.length, ground[0].length); // adjusts new position for round world
		newPosition[0] = _.clone(warpedPos.line);
		newPosition[1] = _.clone(warpedPos.column);

		if ((nextAction !== 'dull') && (nextAction !== 'eat')) {
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
				console.log('eats nom mnom')
			}
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