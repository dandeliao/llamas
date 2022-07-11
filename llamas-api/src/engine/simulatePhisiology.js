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
			//mutate(puppy);
			return puppy;
		}
	}
	return null;
}

/* function mutate(puppy) {

	let numberOfMutations = randomInteger(0, 20);



} */

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