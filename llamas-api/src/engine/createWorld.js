const { randomInteger, randomRealNumber, generateMatrix, coinFlip } = require('./utils');

// ---
// llama physiology

// brain generator
function generateBrain(layers, neuronsByLayer, inputs, outputs) {

	let brain = new Array(layers + 2); // total layers = number of hidden layers + input layer + output layer
	brain[0] = new Array(inputs); // first layer

	let hiddenLayers = generateMatrix(layers, neuronsByLayer);
	for(let i = 0; i < hiddenLayers.length; i++) {
		hiddenLayers[i] = new Array(neuronsByLayer);
		brain[i+1] = hiddenLayers[i];
	}

	brain[brain.length - 1] = new Array(outputs); // last layer

	for(let i = 0; i < brain.length; i++) {
		for (let j = 0; j < brain[i].length; j++) {
			let weights;
			if (i === 0) {
				// first layer weights
				weights = new Array (inputs);
			} else {
				weights = new Array (brain[i - 1].length);
			}

			for (let k = 0; k < weights.length; k++) {
				weights[k] = randomRealNumber(-5, 5);
			}
			brain[i][j] = {
				'bias': randomRealNumber(-5, 5),
				'weights': weights
			}
		}
	}

	return brain;
}

// endocrine system generator
function generateEndocrine (brain) {

	// this sizes are temporary - it's the inverse size of the brain matrix, but shouldn't be necessarily
	// what is necessary is that the first layer gets all inputs.
	// the last layer may have any size, but there must be a "bridge" of weights between the output signals and each of the brain layers
	// put "bridge" in the endocrine or in the brain?
	let neuronsByLayer = brain.length;
	let layers = brain[0].length;
	let endocrine = generateMatrix(layers, neuronsByLayer);

	for(let i = 0; i < endocrine.length; i++) {
		let layer = new Array(neuronsByLayer);
		for (let j = 0; j < layer.length; j++) {
			let weights = new Array (neuronsByLayer);
			for (let k = 0; k < weights.length; k++) {
				weights[k] = Math.random(); // random weight, from 0 to under 1
			}
			layer[j] = {
				'bias': 3 * Math.random(), // random bias, from 0 to under 3
				'weights': weights
			}
		}
		endocrine[i] = layer;
	}

	return endocrine;

}

// homeostatic system generator
function generateHomeostatic () {
	return randomInteger(7, 30); // initial energy level of a llama. Should be hereditary, not random
}

// reproductive system generator
function generateReproductive () {
	return 'asexual'; // there can be more variables and options and it should be hereditary
}

// ---
// world building

// creates random ground
function randomGround(numberOfLines, numberOfColumns) {
	
	let ground = generateMatrix (numberOfLines, numberOfColumns);

	for (let i = 0; i < ground.length; i++) {
		for (let j = 0; j < ground[i].length; j++) {
			ground[i][j] = randomInteger(0, 4);
		}
	}

	return ground;
}

// creates random llamas
function randomLlamas (numberOfLines, numberOfColumns) {
	const worldSize = numberOfLines * numberOfColumns;
	const minLlamas = Math.floor(worldSize/100);
	const maxLlamas = Math.floor(worldSize/10);
	let llamas = new Array (randomInteger(minLlamas, maxLlamas));

	linesArray = [];
	columnsArray = [];

	for (let i = 0; i < llamas.length; i++) {
		
		let positionLine = randomInteger(0, numberOfLines - 1);
		let positionColumn = randomInteger(0, numberOfColumns - 1);

		while ((linesArray.indexOf(positionLine) !== -1) && (columnsArray.indexOf(positionColumn) !== -1)) {
			// tries again if position is already occupied
			positionLine = randomInteger(0, numberOfLines - 1);
			positionColumn = randomInteger(0, numberOfColumns - 1);
		}

		let energy = generateHomeostatic();
		const heads = coinFlip();
		let diet = 'mana';
		if (heads) {
			diet = 'void';
		}

		let reproduction = generateReproductive();

		const viewRange = randomInteger(0, 2); // 0 => 1x1 (own) square, 1 => 3x3 square, 2 => 5x5 square
		const sizeOfViewRange = Math.pow((2 * viewRange) + 1, 2);
		const sizeOfSensoryInput = sizeOfViewRange + 1; // sensory data = visual input + energy level
		const neuronsByLayer = randomInteger(4, 20);
		const layers = randomInteger(2, 5);
		const brain = generateBrain(layers, neuronsByLayer, sizeOfSensoryInput, 7); // for now, 7 actions (dull, eat, up, down, left, right, reproduce)
		llamas[i] = {
			'line': positionLine,
			'column': positionColumn,
			'viewRange': viewRange,
			'diet': diet,
			'energy': energy,
			'reproduction': reproduction,
			'brain': brain
		}
	}

	return llamas;
}


module.exports = { randomGround, randomLlamas };