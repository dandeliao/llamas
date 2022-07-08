// ---
// auxiliary functions

// random integer generator
function randomInteger (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 2D matrix generator
function generateMatrix(lines, columns) {
	let matrix = new Array (lines);

	for (let i = 0; i < matrix.length; i++) {
		let line = new Array (columns);
		for (let j = 0; j < line.length; j++) {
			line[j] = null;
		}
		matrix[i] = line;
	}

	return matrix;

}

// brain generator
function generateBrain(layers, neuronsByLayer) {
	
	let brain = generateMatrix(layers, neuronsByLayer);

	for(let i = 0; i < brain.length; i++) {
		let layer = new Array(neuronsByLayer);
		for (let j = 0; j < layer.length; j++) {
			let weights = new Array (neuronsByLayer);
			for (let k = 0; k < weights.length; k++) {
				weights[k] = Math.random(); // random weight, from 0 to under 1
			}
			layer[j] = {
				'activation': Math.random(), // random activation threshold, from 0 to under 1
				'weights': weights
			}
		}
		brain[i] = layer;
	}

	return brain;
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

// creates random llamas and their brains
function randomLlamas (numberOfLines, numberOfColumns) {
	const worldSize = numberOfLines * numberOfColumns;
	const minLlamas = Math.floor(worldSize/100);
	const maxLlamas = Math.floor(worldSize/10);
	let llamas = new Array (randomInteger(minLlamas, maxLlamas));

	for (let i = 0; i < llamas.length; i++) {
		let positionLine = randomInteger(0, numberOfLines - 1);
		let positionColumn = randomInteger(0, numberOfColumns - 1);
		const viewRange = randomInteger(0, 2);
		const neuronsByLayer = randomInteger(10, 100);
		const layers = randomInteger(3, 10);
		const brain = generateBrain(layers, neuronsByLayer);
		llamas[i] = {
			'line': positionLine,
			'column': positionColumn,
			'viewRange': viewRange,
			'brain': brain
		}
	}

	return llamas;
}


module.exports = { randomGround, randomLlamas };