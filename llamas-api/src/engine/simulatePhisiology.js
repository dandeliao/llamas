const { indexOfMax, warpPosition, toLinearArray, randomInteger } = require("./utils");
const _ = require('lodash');
const { sortedLastIndexOf } = require("lodash");


// ---
// senses

// llama visual sensory input
function fieldOfView (llama, ground) {

	const field = new Array ();
	const lineStart = 	llama.line 	 - llama.viewRange;
	const lineEnd = 	llama.line 	 + llama.viewRange;
	const columnStart =	llama.column - llama.viewRange;
	const columnEnd = 	llama.column + llama.viewRange;

	if ((lineStart !== lineEnd) && (columnStart !== columnEnd)) {
		for (let l = lineStart; l <= lineEnd; l++) {
			let fieldLine = new Array ();
			for (let c = columnStart; c <= columnEnd; c++) {
				let warped = warpPosition(l, c, ground.length, ground[0].length); // gets position in a round world
				fieldLine.push(ground[warped.line][warped.column]);
			}
			field.push(fieldLine);
		}
	} else {
		field.push([ground[llama.line][llama.column]]);
	}
	

	return field;

}

// ---
// endocrine system

// precisa modular as camadas/neurônios de duas maneiras:
// 1 - modulação momentânea (weightNaRodada = weight * modulation) e/ou? (activationNaRodada = activation * modulation) com modulation tendo um range de valores negativos a positivos
// 2 - modulação de longo prazo (weight = weight + (modulation - weigth)/fator) e/ou? o mesmo para activation
// obs: o 'fator' pra cada saída é uma variável genética

// ---
// homeostatic system

// mudança do nível de energia tem 4 componentes:
// 1 - manutenção (consumo pequeno e constante, proporcional ao tamanho dos sitemas nervoso e endócrino)
// 2 - ação (andar ou comer consomem um tanto)
// 3 - digestão (comer eleva a energia)
// 4 - reprodução (reproduzir consome muita energia)

function updateHomeostatic (llama, ground) {
	
	let action = llama.action;
	let delta = -1; // standby use of energy

	switch(action) {
		case 'eat':
			delta += -1; // energy spent in the act of eating
			if (([ground[llama.line][llama.column]] > 0) && (llama.diet === 'mana')) {
				delta += 9;
			} else if (([ground[llama.line][llama.column]] < 4) && (llama.diet === 'void')) {
				delta += 9;
			}
			break;
		case 'up':
		case 'down':
		case 'left':
		case 'right':
			delta += -1;
			break;
		case 'reproduce':
			delta += -10;
			break;
	}

	let newEnergy = llama.energy + delta;
	if (newEnergy < 0) {
		newEnergy = 0;
	} else if (newEnergy > 30) {
		newEnergy = 30;
	}

	llama.energy = newEnergy;

}

function isDead (llama) {
	if (llama.energy <= 0) {
		return true;
	} else {
		return false;
	}
}

// ---
// reproductive system

// assexual e/ou sexual (outros tipos?)
// cópia com mutações

function reproduce (llama) {
	if (llama.reproduction === 'asexual') {
		if (llama.energy > 10) {
			let puppy = _.cloneDeep(llama);
			puppy.energy = 10;
			puppy.action = 'dull';
			mutate(puppy);
			return puppy;
		}
	}
	return null;
}

function mutate(puppy) {

	// neuron mutations
	
	let numberOfNeurons = 0;
	for (let i = 0; i < puppy.brain.length; i++) {
		for (let j = 0; j < puppy.brain[i].length; j++) {
			numberOfNeurons++;
		}
	}
	//console.log('number of neurons:', numberOfNeurons);
	//let nmFactor = 0.02; // max neuronal mutation factor = max % of neuron mutations at birth
	let nmFactor = (puppy.color[0] + 
					puppy.color[1] + 
					puppy.color[2])
					/ (255 * 3 * 10); // this is a workaround for allowing natural selection to affect the mutation factor. Additionally, we get to see it expressed by the brightness of the color
	let numberOfNeuronMutations = randomInteger(1, nmFactor * numberOfNeurons);
	//console.log('number of neuron mutations:', numberOfNeuronMutations);
	for (let i = 0; i < numberOfNeuronMutations; i++) {
		let layer = randomInteger(0, puppy.brain.length - 1);
		let neuronNumber = randomInteger(0, puppy.brain[layer].length - 1);
		let neuron = puppy.brain[layer][neuronNumber];
		let newWeights = new Array(neuron.weights.length);

		for (let k = 0; k < newWeights.length; k++) {
			newWeights[k] = randomRealNumber(-1, 1);
		}

		puppy.brain[layer][neuronNumber] = {
			'bias': randomRealNumber(-2, 2),
			'weights': newWeights
		}
	}


	// big feature mutations
	let numberOfBigFeatureMutations = randomInteger(0, 1);
	let bigFeatures = ['viewRange', 'diet', 'reproduction', 'color', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'];

	let alreadyMutated = [];
	for (let i = 0; i < numberOfBigFeatureMutations; i++) {
		let featureIndex = randomInteger(0, bigFeatures.length - 1);
		while (alreadyMutated.includes(featureIndex)) {
			featureIndex = randomInteger(0, bigFeatures.length - 1);
		}

		if (bigFeatures[featureIndex] === 'viewRange') {
			puppy.color = randomUniqueColor([puppy.color]); // also changes color when viewRange changes
			let viewRange = randomInteger(0, 2); // 0 => 1x1 (own) square, 1 => 3x3 square, 2 => 5x5 square
			let sizeOfViewRange = Math.pow((2 * viewRange) + 1, 2);
			let sizeOfSensoryInput = sizeOfViewRange + sizeOfViewRange + 1; // sensory data = visual input + llama radar + energy level
			while (sizeOfSensoryInput === puppy.brain[0].length) {
				// repeat until it is different
				viewRange = randomInteger(0, 2);
				sizeOfViewRange = Math.pow((2 * viewRange) + 1, 2);
				sizeOfSensoryInput = sizeOfViewRange + sizeOfViewRange + 1;
			}
			let firstLayer = generateLayer(puppy.brain[0].length, sizeOfSensoryInput); // doesn't change number of neurons in the first layer, just the number of inputs. This allows for changing just the first layer and keeping the hidden ones, since the number of outputs from the first layer remain the same.
			puppy.brain[0] = firstLayer;

		} else if (bigFeatures[featureIndex] === 'diet') {
			/* puppy.color = randomUniqueColor([puppy.color]); // also changes color when diet changes
			if (puppy.diet === 'mana') {
				puppy.diet = 'void';
			} else if (puppy.diet === 'void') {
				puppy.diet = 'mana';
			} else {
				console.log('error when mutating puppy diet');
} */

		} else if (bigFeatures[featureIndex] === 'reproduction') {
			// implement after implementing sexual reproduction

		} else if (bigFeatures[featureIndex] === 'color') {
			//if (coinFlip()) {
				//if (coinFlip()) {
					puppy.color = randomUniqueColor([puppy.color]);	
				//}
			//}
			
		}
	}
}

// ---
// nervous system

// neuron activation function
function activationFunction (signal, bias) {
	let r = (1 / (1 + Math.exp(bias - signal))); // sigmoid shifted by bias
	return r;
}

// neuron activation simulation
function neuronActivation (signals, neuron) {

	let weightedSignals = new Array(signals.length);
	for (let i = 0; i < neuron.weights.length; i++) {
		weightedSignals[i] = signals[i] * neuron.weights[i];
	}

	let weightedSum = 0;
	for (let i = 0; i < weightedSignals.length; i++) {
		weightedSum += weightedSignals[i];
	}

	return activationFunction(weightedSum, neuron.bias);

}

// brain simulation
function brainSimulation (llama, ground) {

	const sight = fieldOfView(llama, ground);
	let signals = toLinearArray(sight);
	signals.push(llama.energy);
	console.log('sensory signals of a llama:', signals);

	for (let i = 0; i < llama.brain.length; i++) {
		let outputSignals = new Array();
		for (let j = 0; j < llama.brain[i].length; j++) {
			let neuron = llama.brain[i][j];
			outputSignals[j] = neuronActivation(signals, neuron);
		}
		signals = _.cloneDeep(outputSignals); // output from a layer is the input (signals) for the next layer
	}

	return decideAction(signals);

}

// decides which action a llama will take
function decideAction(motorSignals) {
	
	//const relevantSignals = motorSignals.slice(0, 6);
	const biggestSignal  = indexOfMax(motorSignals);

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
	} else if (biggestSignal === 6) {
		return 'reproduce';
	}

}

// ---
// exports

module.exports = {
	brainSimulation,
	updateHomeostatic,
	isDead,
	reproduce
}