const { randomInteger, randomRealNumber, generateMatrix, coinFlip , mapProperty, randomUniqueColor } = require('./utils');

// ---
// llama physiology

// layer of neurons generator
function generateLayer (numberOfNeurons, numberOfInputs) {
	let layer = new Array(numberOfNeurons);
	for (let i = 0; i < layer.length; i++) {
		let weights = new Array (numberOfInputs);
		for (let j = 0; j < weights.length; j++) {
			weights[j] = randomRealNumber(-100, 100);
		}
		layer[i] = {
			'bias': randomRealNumber(-100, 100),
			'weights': weights
		}
	}
	return layer;
}

// brain generator
function generateBrain(layers, neuronsByLayer, inputs, outputs) {

	// creates empty layers
	let brain = new Array(layers + 2); // total layers = number of hidden layers + input layer + output layer
	brain[0] = new Array(inputs); // first layer
	let hiddenLayers = generateMatrix(layers, neuronsByLayer); // hidden layers
	for(let i = 0; i < hiddenLayers.length; i++) {
		hiddenLayers[i] = new Array(neuronsByLayer);
		brain[i+1] = hiddenLayers[i];
	}
	brain[brain.length - 1] = new Array(outputs); // last layer

	// initializes bias and weights for each neuron
	for(let i = 0; i < brain.length; i++) {
		let inputSize;
		if (i === 0) {
			inputSize = inputs;
		} else {
			inputSize = brain[i - 1].length;
		}
		let layer = generateLayer(brain[i].length, inputSize);
		brain[i] = layer;
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
				'bias': (4 * Math.random()) - 2, // random bias, from 0 to under 3 (changed)
				'weights': weights
			}
		}
		endocrine[i] = layer;
	}

	return endocrine;

}

// homeostatic system generator
function generateHomeostatic () {
	return randomInteger(80, 100); // initial energy level of a llama. Should be hereditary, not random
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
	const minLlamas = Math.floor(worldSize/5);
	const maxLlamas = Math.floor(worldSize/4);
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
		/* if (heads) {
			diet = 'void';
		} */

		let colorsInUse = mapProperty('color', llamas);
		console.log('colors in use:', colorsInUse);
		let color = randomUniqueColor(colorsInUse);
		//console.log('color of llama:', color);

		let reproduction = generateReproductive();

		const viewRange = randomInteger(0, 2); // 0 => 1x1 (own) square, 1 => 3x3 square, 2 => 5x5 square
		const sizeOfViewRange = Math.pow((2 * viewRange) + 1, 2);
		const sizeOfLlamaRange = sizeOfViewRange; // same as view range, but for knowing if there's a llama at each square of the visual field
		const sizeOfSensoryInput = sizeOfViewRange + sizeOfLlamaRange + 1; // sensory data = visual input + llama input + energy level
		const neuronsByLayer = randomInteger(10, 40);
		const layers = randomInteger(1, 3);
		const brain = generateBrain(layers, neuronsByLayer, sizeOfSensoryInput, 16); // for now, 7 actions (dull, eat, up, down, left, right, reproduce) represented by 5 binary outputs (see decideAction at phisiological simulation)
		llamas[i] = {
			'line': positionLine,
			'column': positionColumn,
			'color': color,
			'viewRange': viewRange,
			'diet': diet,
			'energy': energy,
			'reproduction': reproduction,
			'brain': brain
		}
	}

	return llamas;
}


module.exports = { randomGround, randomLlamas, generateLayer };