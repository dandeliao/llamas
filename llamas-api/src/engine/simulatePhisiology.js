const { indexOfMax, warpPosition, toLinearArray, randomUniqueColor, randomInteger, randomRealNumber, coinFlip, saveInfo } = require("./utils");
const { generateLayer } = require('./createWorld');
const _ = require('lodash');


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

// llama radar for detecting nearby llamas
function fieldOfLlamaRadar (llama, ground, llamas) {

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
				let found = false;
				for (k = 0; k < llamas.length; k++) {
					if ((llamas[k].line === warped.line) && (llamas[k].column === warped.column)) {
						found = true;
					}
				}
				if (found) {
					fieldLine.push(4);
				} else {
					fieldLine.push(0);
				}
			}
			field.push(fieldLine);
		}
	} else {
		field.push(4); // if fielOfView is 0, detects itself
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
	let delta = -6; // standby use of energy

	switch(action) {
		case 'eat':
			delta += -5; // energy used in the act of eating
			if ((ground[llama.line][llama.column] > 0) && (llama.diet === 'mana')) {
				delta += 60;
			} else if ((ground[llama.line][llama.column] < 4) && (llama.diet === 'void')) {
				delta += 60;
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
	} else if (newEnergy > 100) {
		newEnergy = 100;
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

function reproduce (llama) {
	if (llama.reproduction === 'asexual') {
		if (llama.energy > 40) {
			let puppy = _.cloneDeep(llama);
			puppy.energy = 40;
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
function brainSimulation (llama, ground, llamas) {

	const sight = fieldOfView(llama, ground);
	let signals = toLinearArray(sight);
	const radar = fieldOfLlamaRadar(llama, ground, llamas);
	let llamaRadar = toLinearArray(radar);
	for (i = 0; i < llamaRadar.length; i++) {
		signals.push(llamaRadar[i]);
	}
	signals.push(llama.energy);
	if (llama === llamas[0]) {
		saveInfo(`../logs/llama_0.json`, '--- input ---');
		saveInfo(`../logs/llama_0.json`, signals);
	}
	//console.log('sensory signals of a llama:', signals);

	for (let i = 0; i < llama.brain.length; i++) {
		let outputSignals = new Array();
		for (let j = 0; j < llama.brain[i].length; j++) {
			let neuron = llama.brain[i][j];
			outputSignals[j] = neuronActivation(signals, neuron);
		}
		signals = _.cloneDeep(outputSignals); // output from a layer is the input (signals) for the next layer
	}

	if (llama === llamas[0]) {
		saveInfo(`../logs/llama_0.json`, '--- output ---');
		saveInfo(`../logs/llama_0.json`, signals);
	}

	let newAction = decideAction(signals);
	if (llama === llamas[0]) {
		saveInfo(`../logs/llama_0.json`, '--- action ---');
		saveInfo(`../logs/llama_0.json`, newAction);
		saveInfo(`../logs/llama_0.json`, '-');
	}
	return newAction;

}

// decides which action a llama will take
function decideAction(motorSignals) {
	
	/* an explanation of what is going on here

	>> tl,dr: apply a hamming code to the motor signals and map a range of the output to the each action
	
	at first I implemented 5 motor signals for the llama brain and this was the solution for deciding an action:
	
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

	but multiple shortcomings arose, e.g.:
		
		- there could be multiple actions with maximum value at the same time, and no way to decide between them
		  (in the implementation above, llama would choose the one that came first on the if/else-if blocks)
		  
		- very small differences in the motor signals could drastically change action
		  (i guess it is highly non-linear, which is hard for llama to control)
	
	instead, I thought, I could 'binarize' the motor signals, by passing them through a step function

		if signal > 0.5 then binSignal = 1;
		else binSignal = 0;
	
	the resulting binary array could then be checked for specific values, each one representing an action
	this way there would be no conflict. For example:
	
		0000000 <= 'dull'
		1010101 <= 'eat'
		0000110 <= 'left'
		0001100 <= 'down'
		0011000 <= 'right'
		0110000 <= 'up'
		1111111 <= 'reproduce'

	... but that would leave a lot of output possibilities useless (7 bits = 2^7 possibilities)
	
	it would be tempting to reduce the number of outputs to the minimum necessary:

		000 <= 'dull'
		010 <= 'dull'
		101 <= 'eat'
		001 <= 'left'
		100 <= 'down'
		011 <= 'right'
		110 <= 'up'
		111 <= 'reproduce'

	... but this is not ideal, since some actions differ by just one bit, which could be flipped by mistake by the llama,
	    again making it too non-linear and hard to control
	
	a compromise solution would be the two-out-of-five code, which can encode 10 numbers in combinations of 11 and 000

		0 11000
		1 00011
		2 00101
		3 00110
		4 01001
		5 01010
		6 01100
		7 10001
		8 10010
		9 10100

	we could use up to 10 out of 32 possible numbers, lefting 22 as "errors" to which we could assign "dull".
	this did not work as well as I expected, llamas had mostly dull responses.
	I then tried assigning the 22 left-outs to a random action, but llamas just got too crazy
	
	at the end, I implemented a hamming code.
	motor signals are first binarized (which introduces non-linerity, but not a huge problem as there will be correction for errors):
		
		if signal > 0.5 then binSignal = 1;
		else binSignal = 0;

	then the hamming(15,7) is applied: the first bit is ignored, 4 other bits are parity checkers and 11 are data

		xab0
		c000
		d000
		0000

		x 		=> ignored. Could be used for additional parity checking in the future
		a,b,c,d => bits for parity checking
		0		=> data

		in a linear array this looks like: [x,a,b,0,c,0,0,0,d,0,0,0,0,0,0,0]
	
	we then check the array for all positions with a 1
	then we XOR the positions
	the result of the XOR is the position of the wrong bit (if there is a one-bit error by the llama) or 0 (no one-bit errors)
		
		x a b 0 c 0 0 0 d 0 0  0  0  0  0  0  <= bit string
		0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 <= positions
			  3   5 6 7   9 10 11 12 13 14 15 <= data positions

		errorPosition = (positions of every 1 in bit string) XOR(^) one another
		if errorPosition is even, return data (->action)
		if errorPosition is odd, flip bit at the position [errorPosition]

	after correcting possible one-bit errors, we must choose the actions.
	since we have 11 bits of data, that still leaves 2^11 possible outputs, from which we want just 7.
	so we divide the output in 7 ranges with size (2^11)/7 and attribute each range to an output.

	this solution is imune to one-bit errors and allow llamas to express the desired action in clusters of outputs.

		(only data bits shown)

		from 000 0000 0000 to 001 0001 0010 <= 'dull'
		from 001 0001 0011 to 010 0000 1111 <= 'eat'
		from 010 0001 0000 to 011 0001 1101 <= 'left'
		and so on...

	nonetheless, a future improved solution could group together outputs in a way that gives maximum hamming distances between different actions

	*/

	let binarizedSignals = new Array (motorSignals.length);
	for (let i = 0; i < motorSignals.length; i++) {
		if (motorSignals[i] > 0.5) {
			binarizedSignals[i] = 1;
		} else {
			binarizedSignals[i] = 0;
		}
	}
		
	let onesPositions = [];
	for (let i = 0; i < binarizedSignals.length; i++) {
		if (binarizedSignals[i] === 1) {
			onesPositions.push(i);
		}
	}
	let errorPosition = 0;
	if (onesPositions.length > 0) {
		errorPosition = onesPositions[0];
		for (let i = 1; i < onesPositions.length; i++) {
			errorPosition ^= onesPositions[i];
		}
	}

	if (errorPosition !== 0) {
		// flips bit that caused error
		if (binarizedSignals[errorPosition] === 0) {
			binarizedSignals[errorPosition] = 1;
		} else {
			binarizedSignals[errorPosition] = 0;
		}
	}

	let data = [
		binarizedSignals[3],
		binarizedSignals[5],
		binarizedSignals[6],
		binarizedSignals[7],
		binarizedSignals[9],
		binarizedSignals[10],
		binarizedSignals[11],
		binarizedSignals[12],
		binarizedSignals[13],
		binarizedSignals[14],
		binarizedSignals[15]
	]

	let decimalData = 0;
	for (let i = 0; i < data.length; i++) {
		decimalData += data[i] * Math.pow(2, i);
	}

	const range = Math.floor(Math.pow(2,11) / 7);

	if (decimalData < range) {
		return 'dull';
	} else if (decimalData < 2 * range) {
		return 'eat';
	} else if (decimalData < 3 * range) {
		return 'left';
	} else if (decimalData < 4 * range) {
		return 'down';
	} else if (decimalData < 5 * range) {
		return 'right';
	} else if (decimalData < 6 * range) {
		return 'up';
	} else if (decimalData < 7 * range) {
		return 'reproduce';
	} else {
		return 'dull';
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